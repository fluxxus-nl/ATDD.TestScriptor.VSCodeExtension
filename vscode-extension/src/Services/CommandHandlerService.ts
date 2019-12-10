import { ICommandBase } from '../typings/ICommandBase';
import * as vscode from 'vscode';
import { IMessageBase } from '../typings/IMessageBase';

export class CommandHandlerService {
    message: any;

    protected extensionPath: string = '';

    public constructor(lExtensionPath: string) {
        this.extensionPath = lExtensionPath;
    }

    public async dispatch(message: IMessageBase) {
        let className = `${message.Command}Command`;
        let handlerClass = require(`./Commands/${className}Command`);

        if (handlerClass) {
            let handler: ICommandBase = new handlerClass[className](this.extensionPath);
            await handler.execute(message);
            await handler.showMessage(message);
        } else {
            await vscode.window.showInformationMessage(`'${message.Command}' command was not found.`);
        }
    }

}