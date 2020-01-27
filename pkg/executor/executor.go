package executor

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"
	"sync"
	"time"

	v1 "github.com/32leaves/werft/pkg/api/v1"
	werftv1 "github.com/32leaves/werft/pkg/api/v1"
	"github.com/gogo/protobuf/jsonpb"
	"github.com/golang/protobuf/ptypes"
	log "github.com/sirupsen/logrus"
	"github.com/technosophos/moniker"
	"golang.org/x/xerrors"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/watch"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/util/retry"
)

const (
	// LabelWerftMarker is the label applied to all jobs and configmaps. This label can be used
	// to search for werft job objects in Kubernetes.
	LabelWerftMarker = "werft.sh/job"

	// UserDataAnnotationPrefix is prepended to all user annotations added to jobs
	UserDataAnnotationPrefix = "userdata.werft.sh"

	// AnnotationFailureLimit is the annotation denoting the max times a job may fail
	AnnotationFailureLimit = "werft.sh/failureLimit"

	// AnnotationMetadata stores the JSON encoded metadata available at creation
	AnnotationMetadata = "werft.sh/metadata"

	// AnnotationFailed explicitelly fails the job
	AnnotationFailed = "werft.sh/failed"

	// AnnotationResults stores JSON encoded list of a job results
	AnnotationResults = "werft.sh/results"

	// AnnotationCanReplay stores if this job can be replayed
	AnnotationCanReplay = "werft.sh/canReplay"

	// AnnotationWaitUntil stores the start time of waiting job
	AnnotationWaitUntil = "werft.sh/waitUntil"
)

// Config configures the executor
type Config struct {
	Namespace       string    `yaml:"namespace"`
	EventTraceLog   string    `yaml:"eventTraceLog,omitempty"`
	JobPrepTimeout  *Duration `yaml:"preperationTimeout"`
	JobTotalTimeout *Duration `yaml:"totalTimeout"`
}

// Duration is a JSON un-/marshallable type
type Duration struct {
	time.Duration
}

// UnmarshalYAML parses a duration from its JSON representation
func (d *Duration) UnmarshalYAML(unmarshal func(interface{}) error) error {
	var v string
	err := unmarshal(&v)
	if err != nil {
		return err
	}

	d.Duration, err = time.ParseDuration(v)
	if err != nil {
		return err
	}
	return nil
}

// NewExecutor creates a new job center instance
func NewExecutor(config Config, kubeConfig *rest.Config) (*Executor, error) {
	kubeClient, err := kubernetes.NewForConfig(kubeConfig)
	if err != nil {
		return nil, err
	}

	if config.JobPrepTimeout == nil {
		return nil, xerrors.Errorf("job preperation timeout is required")
	}
	if config.JobTotalTimeout == nil {
		return nil, xerrors.Errorf("total job timeout is required")
	}
	if config.JobTotalTimeout.Duration < config.JobPrepTimeout.Duration {
		return nil, xerrors.Errorf("total job timeout must be greater than the preparation timeout")
	}

	return &Executor{
		OnUpdate: func(pod *corev1.Pod, status *werftv1.JobStatus) {},

		Config:     config,
		Client:     kubeClient,
		KubeConfig: kubeConfig,

		waitingJobs: make(map[string]*waitingJob),
	}, nil
}

// Executor starts and watches jobs running in Kubernetes
type Executor struct {
	// OnUpdate is called when the status of a job changes.
	// Beware: this function can be called several times with the same status.
	OnUpdate func(pod *corev1.Pod, status *werftv1.JobStatus)

	Client     kubernetes.Interface
	Config     Config
	KubeConfig *rest.Config

	waitingJobs map[string]*waitingJob
	mu          sync.RWMutex
}

// waitingJob is a job which doesn't run yet, but waits until it can start (e.g. based on time)
type waitingJob struct {
	Cancel func(reason string)
	Start  func()
	Mutex  string
	Status *v1.JobStatus
}

// Run starts the executor and returns immediately
func (js *Executor) Run() {
	go js.monitorJobs()
	go js.doHousekeeping()
}

type startOptions struct {
	JobName     string
	Modifier    []func(*corev1.Pod)
	Annotations map[string]string
	Mutex       string
	CanReplay   bool
	WaitUntil   time.Time
}

// StartOpt configures a job at startup
type StartOpt func(*startOptions)

// WithBackoff configures the backoff behaviour of a job
func WithBackoff(limit int) StartOpt {
	return func(opts *startOptions) {
		opts.Modifier = append(opts.Modifier, func(j *corev1.Pod) {
			j.Annotations[AnnotationFailureLimit] = fmt.Sprintf("%d", limit)
		})
	}
}

// WithAnnotation sets a single annotation on a job
func WithAnnotation(key, value string) StartOpt {
	return func(opts *startOptions) {
		if opts.Annotations == nil {
			opts.Annotations = make(map[string]string)
		}
		opts.Annotations[key] = value
	}
}

// WithAnnotations sets all annotations of a job
func WithAnnotations(annotations map[string]string) StartOpt {
	return func(opts *startOptions) {
		opts.Annotations = annotations
	}
}

// WithName sets the name of the job
func WithName(name string) StartOpt {
	return func(opts *startOptions) {
		opts.JobName = name
	}
}

// WithMutex starts a job with a mutex (i.e. cancels all other jobs with that mutex)
func WithMutex(name string) StartOpt {
	return func(opts *startOptions) {
		opts.Mutex = name
	}
}

// WithCanReplay configures the if the job can be replayed
func WithCanReplay(canReplay bool) StartOpt {
	return func(opts *startOptions) {
		opts.CanReplay = canReplay
	}
}

// WithWaitUntil starts the execution of a job at some later point
func WithWaitUntil(t time.Time) StartOpt {
	return func(opts *startOptions) {
		opts.WaitUntil = t
	}
}

// Start starts a new job
func (js *Executor) Start(podspec corev1.PodSpec, metadata werftv1.JobMetadata, options ...StartOpt) (status *v1.JobStatus, err error) {
	opts := startOptions{
		JobName: fmt.Sprintf("werft-%s", strings.ReplaceAll(moniker.New().Name(), " ", "-")),
	}
	for _, opt := range options {
		opt(&opts)
	}

	annotations := make(map[string]string)
	for key, val := range opts.Annotations {
		annotations[fmt.Sprintf("%s/%s", UserDataAnnotationPrefix, key)] = val
	}
	if opts.CanReplay {
		annotations[AnnotationCanReplay] = "true"
	}
	if !opts.WaitUntil.IsZero() {
		annotations[AnnotationWaitUntil] = opts.WaitUntil.Format(time.RFC3339)
	}

	metadata.Created = ptypes.TimestampNow()
	mdjson, err := (&jsonpb.Marshaler{
		EnumsAsInts: true,
	}).MarshalToString(&metadata)
	if err != nil {
		return nil, xerrors.Errorf("cannot marshal metadata: %w", err)
	}
	annotations[AnnotationMetadata] = mdjson

	if podspec.RestartPolicy != corev1.RestartPolicyNever && podspec.RestartPolicy != corev1.RestartPolicyOnFailure {
		podspec.RestartPolicy = corev1.RestartPolicyOnFailure
	}

	meta := metav1.ObjectMeta{
		Name: opts.JobName,
		Labels: map[string]string{
			LabelWerftMarker: "true",
			LabelJobName:     opts.JobName,
		},
		Annotations: annotations,
	}
	poddesc := corev1.Pod{
		ObjectMeta: meta,
		Spec:       podspec,
	}
	for _, opt := range opts.Modifier {
		opt(&poddesc)
	}

	mutexCancelationMsg := fmt.Sprintf("a newer job (%s) with the same mutex (%s) started", opts.JobName, opts.Mutex)
	if opts.Mutex != "" {
		poddesc.ObjectMeta.Labels[LabelMutex] = opts.Mutex

		// enforce mutex by marking all other jobs with the same mutex as failed
		pods, err := js.Client.CoreV1().Pods(js.Config.Namespace).List(metav1.ListOptions{LabelSelector: fmt.Sprintf("%s=%s", LabelMutex, opts.Mutex)})
		if err != nil {
			return nil, xerrors.Errorf("cannot enforce mutex: %w", err)
		}
		for _, pod := range pods.Items {
			err := js.addAnnotation(pod.Name, map[string]string{
				AnnotationFailed: mutexCancelationMsg,
			})
			if err != nil {
				return nil, xerrors.Errorf("cannot enforce mutex: %w", err)
			}
		}

		// enforce mutex on all waiting jobs
		js.mu.Lock()
		for k, wj := range js.waitingJobs {
			if wj.Mutex == opts.Mutex {
				wj.Cancel(mutexCancelationMsg)
				delete(js.waitingJobs, k)
			}
		}
		js.mu.Unlock()
	}

	startJob := func() (*v1.JobStatus, error) {
		if log.GetLevel() == log.DebugLevel {
			dbg, _ := json.MarshalIndent(poddesc, "", "  ")
			log.Debugf("scheduling job\n%s", dbg)
		}

		job, err := js.Client.CoreV1().Pods(js.Config.Namespace).Create(&poddesc)
		if err != nil {
			return nil, err
		}

		return getStatus(job)
	}

	// Register the go routine to start the job when its time comes.
	// Werft will tell us again about this job upon startup (pass set of waiting jobs into NewExecutor).
	// When a waiting job is canceled manually or by a mutex it's deleted from the store.
	log.WithField("wait-until", opts.WaitUntil).Debug("waiting until")
	if !opts.WaitUntil.IsZero() && opts.WaitUntil.After(time.Now()) {
		status, err := getStatus(&poddesc)
		if err != nil {
			return nil, err
		}

		// This job's time hasn't come yet - let's delay its execution until later.
		startChan, cancelChan := make(chan struct{}), make(chan string)
		js.mu.Lock()
		js.waitingJobs[opts.JobName] = &waitingJob{
			Cancel: func(reason string) { cancelChan <- reason },
			Start:  func() { close(startChan) },
			Mutex:  opts.Mutex,
			Status: status,
		}
		js.mu.Unlock()

		run := func() {
			js.mu.Lock()
			delete(js.waitingJobs, opts.JobName)
			js.mu.Unlock()

			startJob()
		}

		go func() {
			d := opts.WaitUntil.Sub(time.Now())
			select {
			case <-time.After(d):
				run()
			case <-startChan:
				run()
			case reason := <-cancelChan:
				log.WithField("name", opts.JobName).Debug("canceled this waiting job")
				status.Phase = v1.JobPhase_PHASE_DONE
				status.Conditions.Success = false
				status.Details = reason
				js.OnUpdate(&poddesc, status)
			}
		}()

		status.Phase = v1.JobPhase_PHASE_WAITING

		// normally we'd see a Kubernetes event as the job would start immediately. This Kubernetes event would propagate
		// throughout the system. However, waiting jobs do not produce Kubernetes events right away, hence we have to
		// call OnUpdate ourselves.
		js.OnUpdate(&poddesc, status)

		return status, nil
	}

	return startJob()
}

func (js *Executor) monitorJobs() {
	for {
		incoming, err := js.Client.CoreV1().Pods(js.Config.Namespace).Watch(metav1.ListOptions{
			LabelSelector: fmt.Sprintf("%s=true", LabelWerftMarker),
		})
		if err != nil {
			log.WithError(err).Error("cannot watch jobs - retrying")
			<-time.After(1 * time.Second)
			continue
		}
		log.Info("connected to Kubernetes master")

		for evt := range incoming.ResultChan() {
			if evt.Object == nil {
				break
			}
			obj, ok := evt.Object.(*corev1.Pod)
			if !ok {
				continue
			}

			js.handleJobEvent(evt.Type, obj)
		}
		log.Warn("lost connection to Kubernetes master")

		<-time.After(1 * time.Second)
	}

	// TODO: handle graceful shutdown
}

func (js *Executor) handleJobEvent(evttpe watch.EventType, obj *corev1.Pod) {
	status, err := getStatus(obj)
	js.writeEventTraceLog(status, obj)
	if err != nil {
		log.WithError(err).WithField("name", obj.Name).Error("cannot compute status")
		return
	}

	js.OnUpdate(obj, status)
	err = js.actOnUpdate(status, obj)
	if err != nil {
		log.WithError(err).WithField("name", obj.Name).Error("cannot act on status update")
		return
	}
}

func (js *Executor) actOnUpdate(status *werftv1.JobStatus, obj *corev1.Pod) error {
	if status.Phase == werftv1.JobPhase_PHASE_DONE {
		gracePeriod := int64(5)
		policy := metav1.DeletePropagationForeground

		err := js.Client.CoreV1().Pods(js.Config.Namespace).Delete(obj.Name, &metav1.DeleteOptions{
			GracePeriodSeconds: &gracePeriod,
			PropagationPolicy:  &policy,
		})
		if err != nil {
			log.WithError(err).WithField("name", obj.Name).Error("cannot delete job pod")
		}

		// TODO: clean up workspace content

		return nil
	}

	return nil
}

func (js *Executor) writeEventTraceLog(status *werftv1.JobStatus, obj *corev1.Pod) {
	// make sure we recover from a panic in this function - not that we expect this to ever happen
	//nolint:errcheck
	defer recover()

	if js.Config.EventTraceLog == "" {
		return
	}

	var out io.Writer
	if js.Config.EventTraceLog == "-" {
		out = os.Stdout
	} else {
		f, err := os.OpenFile(js.Config.EventTraceLog, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
		if err != nil {
			return
		}
		defer f.Close()

		out = f
	}

	type eventTraceEntry struct {
		Time   string             `yaml:"time"`
		Status *werftv1.JobStatus `yaml:"status"`
		Job    *corev1.Pod        `yaml:"job"`
	}
	// If writing the event trace log fails that does nothing to harm the function of ws-manager.
	// In fact we don't even want to react to it, hence the nolint.
	//nolint:errcheck
	json.NewEncoder(out).Encode(eventTraceEntry{Time: time.Now().Format(time.RFC3339), Status: status, Job: obj})
}

// Logs provides the log output of a running job. If the job is unknown, nil is returned.
func (js *Executor) Logs(name string) io.Reader {
	return listenToLogs(js.Client, name, js.Config.Namespace)
}

func (js *Executor) doHousekeeping() {
	tick := time.NewTicker(js.Config.JobPrepTimeout.Duration / 2)
	for {
		// check our state and watch for non-existent jobs/events that we missed
		pods, err := js.Client.CoreV1().Pods(js.Config.Namespace).List(metav1.ListOptions{
			LabelSelector: fmt.Sprintf("%s=true", LabelWerftMarker),
		})
		if err != nil {
			log.WithError(err).Warn("cannot perform housekeeping")
			continue
		}

		for _, pod := range pods.Items {
			status, err := getStatus(&pod)
			if err != nil {
				log.WithError(err).WithField("name", pod.Name).Warn("cannot perform housekeeping")
				continue
			}

			created, err := ptypes.Timestamp(status.Metadata.Created)
			if err != nil {
				log.WithError(err).WithField("name", pod.Name).Warn("cannot perform housekeeping")
				continue
			}

			var ttl time.Duration
			if status.Phase == v1.JobPhase_PHASE_PREPARING {
				ttl = js.Config.JobPrepTimeout.Duration
			} else {
				ttl = js.Config.JobTotalTimeout.Duration
			}
			if time.Since(created) < ttl {
				continue
			}

			msg := fmt.Sprintf("job timed out during %s", strings.TrimPrefix(strings.ToLower(status.Phase.String()), "phase_"))
			log.WithField("job", status.Name).Info(msg)
			err = js.addAnnotation(pod.Name, map[string]string{
				AnnotationFailed: msg,
			})
		}

		<-tick.C
	}
}

// errNotFound is returned by getJobPod if no running job was found
var errNotFound = xerrors.Errorf("unknown job")

// Finds the pod executing a job
func (js *Executor) getJobPod(name string) (*corev1.Pod, error) {
	pods, err := js.Client.CoreV1().Pods(js.Config.Namespace).List(metav1.ListOptions{
		LabelSelector: fmt.Sprintf("%s=%s", LabelJobName, name),
	})
	if err != nil {
		return nil, err
	}

	if len(pods.Items) == 0 {
		return nil, xerrors.Errorf("%w: %s", errNotFound, name)
	}
	if len(pods.Items) > 1 {
		return nil, xerrors.Errorf("job %s has no unique execution", name)
	}

	return &pods.Items[0], nil
}

// Stop stops a job
func (js *Executor) Stop(name, reason string) error {
	// maybe this is a waiting job - if so, kill that one first
	js.mu.Lock()
	if wj, ok := js.waitingJobs[name]; ok {
		wj.Cancel(reason)
		delete(js.waitingJobs, name)
		js.mu.Unlock()

		return nil
	}
	js.mu.Unlock()

	pod, err := js.getJobPod(name)
	if err != nil {
		return err
	}

	err = js.addAnnotation(pod.Name, map[string]string{
		AnnotationFailed: reason,
	})
	if err != nil {
		return err
	}

	return nil
}

// GetKnownJobs returns a list of all jobs the executor knows about
func (js *Executor) GetKnownJobs() (jobs []v1.JobStatus, err error) {
	js.mu.RLock()
	for _, wj := range js.waitingJobs {
		jobs = append(jobs, *wj.Status)
	}
	js.mu.RUnlock()

	pods, err := js.Client.CoreV1().Pods(js.Config.Namespace).List(metav1.ListOptions{
		LabelSelector: fmt.Sprintf("%s=true", LabelWerftMarker),
	})
	if err != nil {
		return nil, err
	}
	for _, pod := range pods.Items {
		var status *v1.JobStatus
		status, err = getStatus(&pod)
		if err != nil {
			return nil, err
		}

		jobs = append(jobs, *status)
	}
	return
}

// RegisterResult registers a result produced by a job
func (js *Executor) RegisterResult(jobname string, res *v1.JobResult) error {
	pod, err := js.getJobPod(jobname)
	if err != nil {
		return err
	}
	podname := pod.Name

	client := js.Client.CoreV1().Pods(js.Config.Namespace)
	err = retry.RetryOnConflict(retry.DefaultBackoff, func() error {
		pod, err := client.Get(podname, metav1.GetOptions{})
		if err != nil {
			return xerrors.Errorf("cannot find job pod %s: %w", podname, err)
		}
		if pod == nil {
			return xerrors.Errorf("job pod %s does not exist", podname)
		}

		var results []v1.JobResult
		if c, ok := pod.Annotations[AnnotationResults]; ok {
			err := json.Unmarshal([]byte(c), &results)
			if err != nil {
				return xerrors.Errorf("cannot unmarshal previous results: %w", err)
			}
		}
		results = append(results, *res)
		ra, err := json.Marshal(results)
		if err != nil {
			return xerrors.Errorf("cannot remarshal results: %w", err)
		}
		pod.Annotations[AnnotationResults] = string(ra)

		_, err = client.Update(pod)
		return err
	})
	return err
}

// addAnnotation adds annotations to a pod
func (js *Executor) addAnnotation(podname string, annotations map[string]string) error {
	client := js.Client.CoreV1().Pods(js.Config.Namespace)
	err := retry.RetryOnConflict(retry.DefaultBackoff, func() error {
		pod, err := client.Get(podname, metav1.GetOptions{})
		if err != nil {
			return xerrors.Errorf("cannot find job pod %s: %w", podname, err)
		}
		if pod == nil {
			return xerrors.Errorf("job pod %s does not exist", podname)
		}

		for k, v := range annotations {
			pod.Annotations[k] = v
		}

		_, err = client.Update(pod)
		return err
	})
	return err
}
