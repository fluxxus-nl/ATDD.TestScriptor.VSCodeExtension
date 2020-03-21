import { VSCommandType } from './../Bootstrap/VSCommands';
import { IMessageBase } from './../typings/IMessageBase';
import { CommandBase } from './CommandBase';
import { commands } from 'vscode';
import { WebPanel } from '../WebPanel';

export class LoadTestsCommand extends CommandBase {

    async execute(message?: IMessageBase) {
        await commands.executeCommand(VSCommandType.Discover);
        WebPanel.postMessage({ Command: 'LoadTests', Data: WebPanel.testList });
    }
}