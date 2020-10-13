export enum AppEditMode {
    Feature = 'Feature',
    Scenario = 'Scenario'
}

export enum AppEventPublisher {
    appMainColumnsResized = 'appMainColumnsResized',
    entryFormEdited = 'entryFormEdited',
    export = 'export',
    onNewScenario = 'onNewScenario',
    selectedEntryEdited = 'selectedEntryEdited',
    sidebarLinksUpdated = 'sidebarLinksUpdated',
    saveChanges = 'saveChanges',
    saveChangesOK = 'saveChangesOK',
    saveChangesCancelled = 'saveChangesCancelled',
    onDeleteScenario = 'onDeleteScenario'
}

export class Message {
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
    ArrayIndex?: number;
}

export class MessageDetails {
    feature: string;
    name: string;
    given: Array<string>;
    when: Array<string>;
    then: Array<string>;
}

export class MessageUpdate {
    Feature: string;
    Scenario: string;
    Id?: number;
    Type: TypeChanged;
    State: MessageState;
    OldValue: string;
    NewValue: string;
    FsPath: string;
    Project: string;
    DeleteProcedure: boolean;
    ArrayIndex?: number;
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

export enum MessageDetailType {
    Given = 'Given',
    When = 'When',
    Then = 'Then'
}