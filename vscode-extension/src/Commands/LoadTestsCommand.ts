import { Application } from './../Application';
import { VSCommandType, VSCommandService } from '../Services/VSCommandService';
import { IMessageBase } from './../typings/IMessageBase';
import { WebPanel } from '../WebPanel';
import { ICommandBase } from '../typings/ICommandBase';

export class LoadTestsCommand implements ICommandBase {
    private vsCommandService: VSCommandService;
    
    public constructor() {
        this.vsCommandService = Application.container.get(VSCommandService);
    }

    async execute(message?: IMessageBase) {
        await this.vsCommandService.executeCommand(VSCommandType.Discover);
        WebPanel.postMessage({ Command: 'LoadTests', Data: WebPanel.testList });
    }
}