import { MessageState, AppEventPublisher } from './../../types';
import { ICommand } from "backend/CommandHandlerService";
import { transient, autoinject } from "aurelia-framework";
import { EventAggregator } from 'aurelia-event-aggregator';
import { Message, ALTestRunnerResult } from "types";
import { AppService } from 'services/app-service';

@autoinject()
export class ExportCommand implements ICommand {

    constructor(private eventAggregator: EventAggregator, private appService: AppService) {
    }

    async execute(payload: any): Promise<void> {        
        this.eventAggregator.publish(AppEventPublisher.export);
        console.log('Export Command');
    }
}
