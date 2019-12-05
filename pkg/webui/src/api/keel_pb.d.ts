// package: v1
// file: keel.proto

import * as jspb from "google-protobuf";
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";

export class StartLocalJobRequest extends jspb.Message {
  hasMetadata(): boolean;
  clearMetadata(): void;
  getMetadata(): JobMetadata | undefined;
  setMetadata(value?: JobMetadata): void;

  hasConfigYaml(): boolean;
  clearConfigYaml(): void;
  getConfigYaml(): Uint8Array | string;
  getConfigYaml_asU8(): Uint8Array;
  getConfigYaml_asB64(): string;
  setConfigYaml(value: Uint8Array | string): void;

  hasJobYaml(): boolean;
  clearJobYaml(): void;
  getJobYaml(): Uint8Array | string;
  getJobYaml_asU8(): Uint8Array;
  getJobYaml_asB64(): string;
  setJobYaml(value: Uint8Array | string): void;

  hasWorkspaceTar(): boolean;
  clearWorkspaceTar(): void;
  getWorkspaceTar(): Uint8Array | string;
  getWorkspaceTar_asU8(): Uint8Array;
  getWorkspaceTar_asB64(): string;
  setWorkspaceTar(value: Uint8Array | string): void;

  hasWorkspaceTarDone(): boolean;
  clearWorkspaceTarDone(): void;
  getWorkspaceTarDone(): boolean;
  setWorkspaceTarDone(value: boolean): void;

  getContentCase(): StartLocalJobRequest.ContentCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StartLocalJobRequest.AsObject;
  static toObject(includeInstance: boolean, msg: StartLocalJobRequest): StartLocalJobRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StartLocalJobRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StartLocalJobRequest;
  static deserializeBinaryFromReader(message: StartLocalJobRequest, reader: jspb.BinaryReader): StartLocalJobRequest;
}

export namespace StartLocalJobRequest {
  export type AsObject = {
    metadata?: JobMetadata.AsObject,
    configYaml: Uint8Array | string,
    jobYaml: Uint8Array | string,
    workspaceTar: Uint8Array | string,
    workspaceTarDone: boolean,
  }

  export enum ContentCase {
    CONTENT_NOT_SET = 0,
    METADATA = 1,
    CONFIG_YAML = 2,
    JOB_YAML = 3,
    WORKSPACE_TAR = 4,
    WORKSPACE_TAR_DONE = 5,
  }
}

export class StartJobResponse extends jspb.Message {
  hasStatus(): boolean;
  clearStatus(): void;
  getStatus(): JobStatus | undefined;
  setStatus(value?: JobStatus): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StartJobResponse.AsObject;
  static toObject(includeInstance: boolean, msg: StartJobResponse): StartJobResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StartJobResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StartJobResponse;
  static deserializeBinaryFromReader(message: StartJobResponse, reader: jspb.BinaryReader): StartJobResponse;
}

export namespace StartJobResponse {
  export type AsObject = {
    status?: JobStatus.AsObject,
  }
}

export class ListJobsRequest extends jspb.Message {
  clearFilterList(): void;
  getFilterList(): Array<FilterExpression>;
  setFilterList(value: Array<FilterExpression>): void;
  addFilter(value?: FilterExpression, index?: number): FilterExpression;

  clearOrderList(): void;
  getOrderList(): Array<OrderExpression>;
  setOrderList(value: Array<OrderExpression>): void;
  addOrder(value?: OrderExpression, index?: number): OrderExpression;

  getStart(): number;
  setStart(value: number): void;

  getLimit(): number;
  setLimit(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListJobsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListJobsRequest): ListJobsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListJobsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListJobsRequest;
  static deserializeBinaryFromReader(message: ListJobsRequest, reader: jspb.BinaryReader): ListJobsRequest;
}

export namespace ListJobsRequest {
  export type AsObject = {
    filterList: Array<FilterExpression.AsObject>,
    orderList: Array<OrderExpression.AsObject>,
    start: number,
    limit: number,
  }
}

export class FilterExpression extends jspb.Message {
  clearTermsList(): void;
  getTermsList(): Array<FilterTerm>;
  setTermsList(value: Array<FilterTerm>): void;
  addTerms(value?: FilterTerm, index?: number): FilterTerm;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FilterExpression.AsObject;
  static toObject(includeInstance: boolean, msg: FilterExpression): FilterExpression.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FilterExpression, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FilterExpression;
  static deserializeBinaryFromReader(message: FilterExpression, reader: jspb.BinaryReader): FilterExpression;
}

export namespace FilterExpression {
  export type AsObject = {
    termsList: Array<FilterTerm.AsObject>,
  }
}

export class FilterTerm extends jspb.Message {
  getField(): string;
  setField(value: string): void;

  getValue(): string;
  setValue(value: string): void;

  getOperation(): FilterOpMap[keyof FilterOpMap];
  setOperation(value: FilterOpMap[keyof FilterOpMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FilterTerm.AsObject;
  static toObject(includeInstance: boolean, msg: FilterTerm): FilterTerm.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FilterTerm, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FilterTerm;
  static deserializeBinaryFromReader(message: FilterTerm, reader: jspb.BinaryReader): FilterTerm;
}

export namespace FilterTerm {
  export type AsObject = {
    field: string,
    value: string,
    operation: FilterOpMap[keyof FilterOpMap],
  }
}

export class OrderExpression extends jspb.Message {
  getField(): string;
  setField(value: string): void;

  getAscending(): boolean;
  setAscending(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OrderExpression.AsObject;
  static toObject(includeInstance: boolean, msg: OrderExpression): OrderExpression.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: OrderExpression, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OrderExpression;
  static deserializeBinaryFromReader(message: OrderExpression, reader: jspb.BinaryReader): OrderExpression;
}

export namespace OrderExpression {
  export type AsObject = {
    field: string,
    ascending: boolean,
  }
}

export class ListJobsResponse extends jspb.Message {
  getTotal(): number;
  setTotal(value: number): void;

  clearResultList(): void;
  getResultList(): Array<JobStatus>;
  setResultList(value: Array<JobStatus>): void;
  addResult(value?: JobStatus, index?: number): JobStatus;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListJobsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListJobsResponse): ListJobsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListJobsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListJobsResponse;
  static deserializeBinaryFromReader(message: ListJobsResponse, reader: jspb.BinaryReader): ListJobsResponse;
}

export namespace ListJobsResponse {
  export type AsObject = {
    total: number,
    resultList: Array<JobStatus.AsObject>,
  }
}

export class SubscribeRequest extends jspb.Message {
  clearFilterList(): void;
  getFilterList(): Array<FilterExpression>;
  setFilterList(value: Array<FilterExpression>): void;
  addFilter(value?: FilterExpression, index?: number): FilterExpression;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubscribeRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SubscribeRequest): SubscribeRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SubscribeRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubscribeRequest;
  static deserializeBinaryFromReader(message: SubscribeRequest, reader: jspb.BinaryReader): SubscribeRequest;
}

export namespace SubscribeRequest {
  export type AsObject = {
    filterList: Array<FilterExpression.AsObject>,
  }
}

export class SubscribeResponse extends jspb.Message {
  hasResult(): boolean;
  clearResult(): void;
  getResult(): JobStatus | undefined;
  setResult(value?: JobStatus): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubscribeResponse.AsObject;
  static toObject(includeInstance: boolean, msg: SubscribeResponse): SubscribeResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SubscribeResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubscribeResponse;
  static deserializeBinaryFromReader(message: SubscribeResponse, reader: jspb.BinaryReader): SubscribeResponse;
}

export namespace SubscribeResponse {
  export type AsObject = {
    result?: JobStatus.AsObject,
  }
}

export class ListenRequest extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getUpdates(): boolean;
  setUpdates(value: boolean): void;

  getLogs(): boolean;
  setLogs(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListenRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListenRequest): ListenRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListenRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListenRequest;
  static deserializeBinaryFromReader(message: ListenRequest, reader: jspb.BinaryReader): ListenRequest;
}

export namespace ListenRequest {
  export type AsObject = {
    name: string,
    updates: boolean,
    logs: boolean,
  }
}

export class ListenResponse extends jspb.Message {
  hasUpdate(): boolean;
  clearUpdate(): void;
  getUpdate(): JobStatus | undefined;
  setUpdate(value?: JobStatus): void;

  hasSlice(): boolean;
  clearSlice(): void;
  getSlice(): LogSliceEvent | undefined;
  setSlice(value?: LogSliceEvent): void;

  getContentCase(): ListenResponse.ContentCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListenResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListenResponse): ListenResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListenResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListenResponse;
  static deserializeBinaryFromReader(message: ListenResponse, reader: jspb.BinaryReader): ListenResponse;
}

export namespace ListenResponse {
  export type AsObject = {
    update?: JobStatus.AsObject,
    slice?: LogSliceEvent.AsObject,
  }

  export enum ContentCase {
    CONTENT_NOT_SET = 0,
    UPDATE = 1,
    SLICE = 2,
  }
}

export class JobStatus extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  hasMetadata(): boolean;
  clearMetadata(): void;
  getMetadata(): JobMetadata | undefined;
  setMetadata(value?: JobMetadata): void;

  getPhase(): JobPhaseMap[keyof JobPhaseMap];
  setPhase(value: JobPhaseMap[keyof JobPhaseMap]): void;

  hasConditions(): boolean;
  clearConditions(): void;
  getConditions(): JobConditions | undefined;
  setConditions(value?: JobConditions): void;

  getDetails(): string;
  setDetails(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JobStatus.AsObject;
  static toObject(includeInstance: boolean, msg: JobStatus): JobStatus.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: JobStatus, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JobStatus;
  static deserializeBinaryFromReader(message: JobStatus, reader: jspb.BinaryReader): JobStatus;
}

export namespace JobStatus {
  export type AsObject = {
    name: string,
    metadata?: JobMetadata.AsObject,
    phase: JobPhaseMap[keyof JobPhaseMap],
    conditions?: JobConditions.AsObject,
    details: string,
  }
}

export class JobMetadata extends jspb.Message {
  getOwner(): string;
  setOwner(value: string): void;

  hasRepository(): boolean;
  clearRepository(): void;
  getRepository(): Repository | undefined;
  setRepository(value?: Repository): void;

  getTrigger(): JobTriggerMap[keyof JobTriggerMap];
  setTrigger(value: JobTriggerMap[keyof JobTriggerMap]): void;

  hasCreated(): boolean;
  clearCreated(): void;
  getCreated(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreated(value?: google_protobuf_timestamp_pb.Timestamp): void;

  hasFinished(): boolean;
  clearFinished(): void;
  getFinished(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setFinished(value?: google_protobuf_timestamp_pb.Timestamp): void;

  clearAnnotationsList(): void;
  getAnnotationsList(): Array<Annotation>;
  setAnnotationsList(value: Array<Annotation>): void;
  addAnnotations(value?: Annotation, index?: number): Annotation;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JobMetadata.AsObject;
  static toObject(includeInstance: boolean, msg: JobMetadata): JobMetadata.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: JobMetadata, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JobMetadata;
  static deserializeBinaryFromReader(message: JobMetadata, reader: jspb.BinaryReader): JobMetadata;
}

export namespace JobMetadata {
  export type AsObject = {
    owner: string,
    repository?: Repository.AsObject,
    trigger: JobTriggerMap[keyof JobTriggerMap],
    created?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    finished?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    annotationsList: Array<Annotation.AsObject>,
  }
}

export class Repository extends jspb.Message {
  getHost(): string;
  setHost(value: string): void;

  getOwner(): string;
  setOwner(value: string): void;

  getRepo(): string;
  setRepo(value: string): void;

  getRef(): string;
  setRef(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Repository.AsObject;
  static toObject(includeInstance: boolean, msg: Repository): Repository.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Repository, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Repository;
  static deserializeBinaryFromReader(message: Repository, reader: jspb.BinaryReader): Repository;
}

export namespace Repository {
  export type AsObject = {
    host: string,
    owner: string,
    repo: string,
    ref: string,
  }
}

export class Annotation extends jspb.Message {
  getKey(): string;
  setKey(value: string): void;

  getValue(): string;
  setValue(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Annotation.AsObject;
  static toObject(includeInstance: boolean, msg: Annotation): Annotation.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Annotation, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Annotation;
  static deserializeBinaryFromReader(message: Annotation, reader: jspb.BinaryReader): Annotation;
}

export namespace Annotation {
  export type AsObject = {
    key: string,
    value: string,
  }
}

export class JobConditions extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): void;

  getFailureCount(): number;
  setFailureCount(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JobConditions.AsObject;
  static toObject(includeInstance: boolean, msg: JobConditions): JobConditions.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: JobConditions, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JobConditions;
  static deserializeBinaryFromReader(message: JobConditions, reader: jspb.BinaryReader): JobConditions;
}

export namespace JobConditions {
  export type AsObject = {
    success: boolean,
    failureCount: number,
  }
}

export class LogSliceEvent extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getPhase(): LogSlicePhaseMap[keyof LogSlicePhaseMap];
  setPhase(value: LogSlicePhaseMap[keyof LogSlicePhaseMap]): void;

  getPayload(): string;
  setPayload(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LogSliceEvent.AsObject;
  static toObject(includeInstance: boolean, msg: LogSliceEvent): LogSliceEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LogSliceEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LogSliceEvent;
  static deserializeBinaryFromReader(message: LogSliceEvent, reader: jspb.BinaryReader): LogSliceEvent;
}

export namespace LogSliceEvent {
  export type AsObject = {
    name: string,
    phase: LogSlicePhaseMap[keyof LogSlicePhaseMap],
    payload: string,
  }
}

export interface FilterOpMap {
  OP_EQUALS: 0;
  OP_STARTS_WITH: 1;
  OP_ENDS_WITH: 2;
  OP_CONTAINS: 3;
  OP_EXISTS: 4;
}

export const FilterOp: FilterOpMap;

export interface JobTriggerMap {
  TRIGGER_UNKNOWN: 0;
  TRIGGER_PUSH: 1;
  TRIGGER_MANUAL: 2;
}

export const JobTrigger: JobTriggerMap;

export interface JobPhaseMap {
  PHASE_UNKNOWN: 0;
  PHASE_PREPARING: 1;
  PHASE_STARTING: 2;
  PHASE_RUNNING: 3;
  PHASE_DONE: 4;
  PHASE_CLEANUP: 5;
}

export const JobPhase: JobPhaseMap;

export interface LogSlicePhaseMap {
  SLICE_ABANDONED: 0;
  SLICE_CHECKPOINT: 1;
  SLICE_START: 2;
  SLICE_CONTENT: 3;
  SLICE_END: 4;
}

export const LogSlicePhase: LogSlicePhaseMap;

