import { unlinkSync } from "fs-extra";
import { Range, TextDocument, Uri, workspace, WorkspaceEdit } from "vscode";
import { Application } from "../../Application";
import { Message, MessageUpdate, TypeChanged } from "../../typings/types";
import { ALFullSyntaxTreeNodeExt } from "../AL Code Outline Ext/alFullSyntaxTreeNodeExt";
import { FullSyntaxTreeNodeKind } from "../AL Code Outline Ext/fullSyntaxTreeNodeKind";
import { TextRangeExt } from "../AL Code Outline Ext/textRangeExt";
import { ALFullSyntaxTreeNode } from "../AL Code Outline/alFullSyntaxTreeNode";
import { SyntaxTree } from "../AL Code Outline/syntaxTree";
import { ElementUtils } from "./elementUtils";
import { MessageParser } from "./messageParser";
import { RangeUtils } from "./rangeUtils";
import { TestMethodUtils } from "./testMethodUtils";

export class ElementDeletionUtils {
    public static async deleteSomethingFromCode(msg: MessageUpdate): Promise<boolean> {
        if (msg.Type == TypeChanged.Feature) {
            return await ElementDeletionUtils.deleteFeature(msg.OldValue)
        } else {
            let edit: WorkspaceEdit = new WorkspaceEdit();
            let document: TextDocument = await workspace.openTextDocument(msg.FsPath);
            if ([TypeChanged.Given, TypeChanged.When, TypeChanged.Then].includes(msg.Type))
                await ElementDeletionUtils.deleteElementWithProcedureCall(edit, msg, document);
            else if (TypeChanged.ScenarioName == msg.Type && msg.ProceduresToDelete)
                await ElementDeletionUtils.deleteProcedures(edit, document, msg.ProceduresToDelete);

            let successful: boolean = await workspace.applyEdit(edit);
            await document.save();
            return successful;
        }
    }
    static async deleteFeature(featureToDelete: string): Promise<void> {
        let features: Map<string, Uri[]> = await ElementUtils.getFeaturesOfDirectories(Application.getWorkspacePaths())
        if (!features.has(featureToDelete))
            return
        let uris: Uri[] = features.get(featureToDelete)!
        for (const uri of uris) {
            let messages: Message[] = await MessageParser.getMessageObjectFromTestUri(uri)
            let messagesOfFeature: Message[] = messages.filter(message => message.Feature == featureToDelete)

            if (messagesOfFeature.length == messages.length)
                unlinkSync(uri.fsPath);
            else {
                await ElementDeletionUtils.deleteScenariosWithFeature(uri, featureToDelete);
            }
        }
    }
    private static async deleteScenariosWithFeature(uri: Uri, featureToDelete: string) {
        let messages: Message[] = await MessageParser.getMessageObjectFromTestUri(uri);
        let featureMessages: Message[] = messages.filter(message => message.Feature == featureToDelete);
        let document: TextDocument = await workspace.openTextDocument(uri);
        let edit: WorkspaceEdit = new WorkspaceEdit();
        for (const featureMessage of featureMessages) {
            let range: Range | undefined = ElementUtils.getRangeOfScenario(document, featureMessage.Scenario, featureMessage.Id);
            if (range) {
                let syntaxTree: SyntaxTree = await SyntaxTree.getInstance(document);
                let methodTreeNode: ALFullSyntaxTreeNode = syntaxTree.findTreeNode(range.start, [FullSyntaxTreeNodeKind.getMethodDeclaration()])!;
                edit.delete(uri, TextRangeExt.createVSCodeRange(methodTreeNode.fullSpan));
            }
        }
        if (edit.entries().length > 0)
            await workspace.applyEdit(edit);
    }

    public static async deleteElementWithProcedureCall(edit: WorkspaceEdit, msg: MessageUpdate, document: TextDocument) {
        if (!msg.ArrayIndex && msg.ArrayIndex != 0)
            throw new Error('ArrayIndex not passed')
        let rangeOfElement: Range | undefined = await ElementUtils.getRangeOfElement(document, msg.Scenario, msg.Id, msg.Type, msg.ArrayIndex);
        if (!rangeOfElement)
            throw new Error('Element ' + msg.OldValue + ' not found in scenario \'' + msg.Scenario + '\'.');

        //search for procedurecall    
        let syntaxTree: SyntaxTree = await SyntaxTree.getInstance(document);
        let statementTreeNode: ALFullSyntaxTreeNode | undefined = syntaxTree.findTreeNode(rangeOfElement.start, FullSyntaxTreeNodeKind.getAllStatementKinds());
        if (statementTreeNode) {
            let statementRange: Range = TextRangeExt.createVSCodeRange(statementTreeNode.fullSpan);
            let range: Range = new Range(rangeOfElement.start, RangeUtils.trimRange(document, statementRange).end)
            range = range.with(range.start.translate(-1, document.lineAt(range.start.line - 1).text.length - 1), undefined);
            // if (document.lineAt(range.start.line).isEmptyOrWhitespace)
            //     range = range.with(range.start.translate(-1, document.lineAt(range.start.line - 1).text.length - 1), undefined);
            // if (document.lineAt(range.end.line + 1).isEmptyOrWhitespace)
            //     range = range.with(undefined, range.end.translate(1, undefined))
            edit.delete(document.uri, range);
            if (msg.ProceduresToDelete)
                await ElementDeletionUtils.deleteProcedures(edit, document, msg.ProceduresToDelete);
        } else
            edit.delete(document.uri, new Range(rangeOfElement.start.line, 0, rangeOfElement.end.line + 1, 0));
    }
    static async deleteProcedures(edit: WorkspaceEdit, document: TextDocument, proceduresToDelete: { procedureName: string; parameterTypes: string[]; }[]) {
        let syntaxTree: SyntaxTree = await SyntaxTree.getInstance(document);
        let methodTreeNodes: ALFullSyntaxTreeNode[] = syntaxTree.collectNodesOfKindXInWholeDocument(FullSyntaxTreeNodeKind.getMethodDeclaration());
        methodTreeNodes = methodTreeNodes.filter(method =>
            proceduresToDelete.some(procedure =>
                procedure.procedureName == ALFullSyntaxTreeNodeExt.findIdentifierAndGetValueOfTreeNode(document, method) &&
                JSON.stringify(TestMethodUtils.getParameterTypesOfMethod(method, document)) == JSON.stringify(procedure.parameterTypes)
            )
        );
        methodTreeNodes = methodTreeNodes.sort((a, b) => a.fullSpan && a.fullSpan.start && b.fullSpan && b.fullSpan.start ? b.fullSpan.start.line - a.fullSpan.start.line : 0);
        methodTreeNodes.forEach(method => edit.delete(document.uri, TextRangeExt.createVSCodeRange(method.fullSpan)));
    }

    public static async deleteElement(edit: WorkspaceEdit, document: TextDocument, rangeToDelete: Range) {
        edit.delete(document.uri, rangeToDelete);
    }
}