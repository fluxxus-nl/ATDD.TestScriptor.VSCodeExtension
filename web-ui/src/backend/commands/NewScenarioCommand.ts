import { MessageState, AppEventPublisher } from 'types';
import { ICommand } from "backend/CommandHandlerService";
import { autoinject } from "aurelia-framework";
import { EventAggregator } from 'aurelia-event-aggregator';
import { Message, ALTestRunnerResult } from "types";
import { AppService } from 'services/app-service';

@autoinject()
export class NewScenarioCommand implements ICommand {

    constructor(private eventAggregator: EventAggregator, private appService: AppService) {
    }

    async execute(payload: any): Promise<void> {
        let project = this.appService.projects[0];
        let featureName = this.appService.selectedEntry?.Feature || '';
        let fsPath = this.appService.selectedEntry?.FsPath || '';
        if (featureName == '' || fsPath == '') {
            let lastEntry: Message | undefined = this.appService.getLastEntry();
            if (lastEntry && featureName == '')
                featureName = lastEntry.Feature
            if (lastEntry && fsPath == '')
                fsPath = lastEntry.FsPath
        }
        let newID = this.appService.getNextScenarioID(featureName);
        let newRec: Message = {
            Uid: this.appService.uuidv4(),
            Project: project,
            Feature: featureName,
            Scenario: `New Scenario (${newID})`,
            Id: newID,
            MethodName: '',
            Codeunit: '',
            FsPath: fsPath,
            IsDirty: true,
            TestRunnerResult: ALTestRunnerResult.NoInfo,
            State: MessageState.New,
            Details: {
                feature: '',
                name: '',
                given: [],
                when: [''],
                then: []
            }

        };
        this.eventAggregator.publish(AppEventPublisher.onNewScenario, newRec);
    }
}
