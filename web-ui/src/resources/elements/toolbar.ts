import { CommandHandlerService } from "backend/CommandHandlerService";
import { autoinject } from "aurelia-framework";

@autoinject()
export class Toolbar {

    constructor(private commandHandlerService: CommandHandlerService) {

    }

    async sendCommand(command: string, data?: any) {
        await this.commandHandlerService.dispatch(command, data);
    }
}