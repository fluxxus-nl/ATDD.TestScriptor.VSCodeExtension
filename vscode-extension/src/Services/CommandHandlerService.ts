import { WebPanel } from './../WebPanel';
import { ICommandBase } from '../typings/ICommandBase';
import * as vscode from 'vscode';
import { IMessageBase } from '../typings/IMessageBase';

export class CommandHandlerService {
    message: any;

    protected extensionPath: string = '';

    protected webPanel: WebPanel;

    public constructor(lExtensionPath: string, lWebPanel: WebPanel) {
        this.extensionPath = lExtensionPath;
        this.webPanel = lWebPanel;
    }

    public async dispatch(message: IMessageBase) {
        let className = `${message.Command}Command`;
        let handlerClass = require(`../Commands/${className}`);

        if (handlerClass) {
            let handler: ICommandBase = new handlerClass[className](this.extensionPath, this.webPanel);
            await handler.execute(message);
            //await handler.showMessage(message);
        } else {
            await vscode.window.showInformationMessage(`'${message.Command}' command was not found.`);
        }
    }

}