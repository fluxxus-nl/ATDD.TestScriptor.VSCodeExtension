import { VSCommandType, ExecuteCommand } from './../Bootstrap/VSCommands';
import { IMessageBase } from './../typings/IMessageBase';
import { CommandBase } from './CommandBase';
import { WebPanel } from '../WebPanel';

export class LoadTestsCommand extends CommandBase {

    async execute(message?: IMessageBase) {
        await ExecuteCommand(VSCommandType.Discover);
        WebPanel.postMessage({ Command: 'LoadTests', Data: WebPanel.testList });
    }
}