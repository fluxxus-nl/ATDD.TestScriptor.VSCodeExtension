import { IMessageBase } from './../typings/IMessageBase';
import { CommandBase } from './CommandBase';
import * as vscode from 'vscode';
import { WebPanel } from '../WebPanel';

export class LoadTestsCommand extends CommandBase {

    async execute(message: IMessageBase) {
        await vscode.commands.executeCommand('atddTestScriptor.discover');
        WebPanel.postMessage(WebPanel.testList);
    }
}