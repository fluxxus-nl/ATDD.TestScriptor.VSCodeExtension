import { Middleware } from './../Middleware';
import { IMessageBase } from './../typings/IMessageBase';
import { CommandBase } from './CommandBase';
import * as vscode from 'vscode';
import { WebPanel } from '../WebPanel';

export class LoadTestsCommand extends CommandBase {
    
    async execute(message: IMessageBase) {
        let paths = (vscode.workspace.workspaceFolders as Array<vscode.WorkspaceFolder>).map(m => m.uri.fsPath);

        let projects = await Middleware.instance.getObjects(paths);
        WebPanel.postMessage(projects);
    }
}