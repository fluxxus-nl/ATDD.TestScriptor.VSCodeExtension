import { IMessageBase } from './../typings/IMessageBase';
import { CommandBase } from './CommandBase';
import * as vscode from 'vscode';
import { WebPanel } from '../WebPanel';
import { ATDDMiddleware } from 'middleware';

export class LoadProjectsCommand extends CommandBase {
    
    async execute(message: IMessageBase) {
        let paths = (vscode.workspace.workspaceFolders as Array<vscode.WorkspaceFolder>).map(m => m.uri.fsPath);
        let middleware: ATDDMiddleware = WebPanel.middleware;

        let projects = await middleware.getProjects(paths);
        WebPanel.postMessage(projects);
    }
}