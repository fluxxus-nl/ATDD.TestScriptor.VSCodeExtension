export interface IMessageBase {
    Command?: string;
    Params?: any;
    Data?: any;
}

export interface Message {
    Uid: string;
    Project: string;
    Feature: string;
    Id?: number;
    Scenario: string;
    Codeunit: string;
    FsPath: string;
    MethodName: string;
    IsDirty: boolean;
    State: MessageState;
    TestRunnerResult: ALTestRunnerResult;
    Details: MessageDetails;
}

export interface MessageDetails {
    given: Array<string>;
    when: Array<string>;
    then: Array<string>;
}

export enum ALTestRunnerResult {
    NoInfo,
    Success,
    Failure
}

export enum MessageState {
    Unchanged,
    New,
    Modified,
    Deleted
}

export interface MessageUpdate {
    Scenario: string;
    Feature: string;
    Type: TypeChanged;
    State: MessageState;
    OldValue: string;
    NewValue: string;
    Id?: number;
    FsPath: string;
    Project: string;
    ProceduresToDelete?: Array<{ procedureName: string, parameterTypes: string[] }>;
    UpdateProcedureCall?: boolean;
    ArrayIndex?: number;
    MethodName?: string;
    internalCall?: boolean;
}

export enum TypeChanged {
    Feature,
    ScenarioFeature,
    ScenarioId,
    ScenarioName,
    Given,
    When,
    Then
}