import { TextDocument, workspace, ViewColumn, window, TextEditorRevealType, Selection, Range } from 'vscode';
import { IMessageBase, Message } from '../typings/IMessageBase';
import { WebPanel } from '../WebPanel';
import { ICommandBase } from '../typings/ICommandBase';

export class ViewSourceCommand implements ICommandBase {

    constructor() {
    }

    async execute(message: IMessageBase) {
        let entry: Message = message.Data;
        let doc: TextDocument = await workspace.openTextDocument(entry.FsPath);
        let editor = await window.showTextDocument(doc, ViewColumn.Beside);

        let text = editor.document.getText();

        let itemIndex = text.indexOf(entry.MethodName);
        let x = editor.document.positionAt(itemIndex);
        editor.selection = new Selection(x, x);
        editor.revealRange(new Range(x, x), TextEditorRevealType.InCenter);

        await WebPanel.postMessage(null);
    }
}