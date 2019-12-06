import { ICommand } from "backend/CommandHandlerService";
import { transient, autoinject } from "aurelia-framework";
import { EventAggregator } from 'aurelia-event-aggregator';

@autoinject()
export class NewScenarioCommand implements ICommand {

    constructor(private eventAggregator: EventAggregator) {
    }

    async execute(payload: any): Promise<void> {
        let newRec = { Project: 'My app', Feature: 'Test 11', Scenario: 'Scenario 11', Codeunit: 'Test 11 Codeunit' };
        this.eventAggregator.publish('onNewScenario', newRec);
    }
}
