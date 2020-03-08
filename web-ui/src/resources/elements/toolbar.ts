import { EventAggregator } from 'aurelia-event-aggregator';
import { CommandHandlerService } from "backend/CommandHandlerService";
import { autoinject, bindable } from "aurelia-framework";

@autoinject()
export class Toolbar {

    @bindable()
    searchValue: string;

    constructor(private commandHandlerService: CommandHandlerService) {
    }

    async sendCommand(command: string, data?: any) {
        await this.commandHandlerService.dispatch(command, data);
    }
}