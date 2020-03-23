export enum AppEditMode {
    Feature = 'Feature',
    Scenario = 'Scenario'
}

export enum AppEventPublisher {
    appMainColumnsResized = 'appMainColumnsResized',
    entryFormEdited = 'entryFormEdited',
    onNewScenario = 'onNewScenario',
    selectedEntryEdited = 'selectedEntryEdited',
    sidebarLinksUpdated = 'sidebarLinksUpdated'
}

export class Message {
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

export class MessageDetails {
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