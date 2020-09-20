import { MessageState, AppEventPublisher } from 'types';
import { ICommand } from "backend/CommandHandlerService";
import { autoinject } from "aurelia-framework";
import { EventAggregator } from 'aurelia-event-aggregator';
import { Message, ALTestRunnerResult } from "types";
import { AppService } from 'services/app-service';

@autoinject()
export class DeleteScenarioCommand implements ICommand {

    constructor(private eventAggregator: EventAggregator, private appService: AppService) {
    }

    async execute(payload: any): Promise<void> {
        let scenario = this.appService.selectedEntry;        
        this.eventAggregator.publish(AppEventPublisher.onDeleteScenario, scenario);
    }
}
