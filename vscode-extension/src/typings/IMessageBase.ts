export interface IMessageBase {
    Command?: string;
    Params?: any;
    Data?: any;
}

export interface Message {
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
    feature: string;
    name: string;
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