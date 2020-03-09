import { IMessageBase } from '../typings/IMessageBase';
import { CommandBase } from './CommandBase';
import * as vscode from 'vscode';
import { WebPanel } from '../WebPanel';

export class ViewSourceCommand extends CommandBase {

    async execute(message: IMessageBase) {
        let doc: vscode.TextDocument = await vscode.workspace.openTextDocument(message.Data.FsPath);
        let editor = await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);

        let text = editor.document.getText();

        let itemIndex = text.indexOf(message.Data.MethodName);
        let x = editor.document.positionAt(itemIndex);
        editor.selection = new vscode.Selection(x, x);
        editor.revealRange(new vscode.Range(x, x), vscode.TextEditorRevealType.InCenter);

        await WebPanel.postMessage(null);
    }
}