import { unlinkSync } from "fs-extra";
import { Range, WorkspaceEdit, TextDocument, workspace } from "vscode";
import { MessageUpdate, TypeChanged } from "../../typings/types";
import { ALFullSyntaxTreeNodeExt } from "../AL Code Outline Ext/alFullSyntaxTreeNodeExt";
import { FullSyntaxTreeNodeKind } from "../AL Code Outline Ext/fullSyntaxTreeNodeKind";
import { TextRangeExt } from "../AL Code Outline Ext/textRangeExt";
import { ALFullSyntaxTreeNode } from "../AL Code Outline/alFullSyntaxTreeNode";
import { SyntaxTree } from "../AL Code Outline/syntaxTree";
import { ElementUtils } from "./elementUtils";
import { RangeUtils } from "./rangeUtils";
import { TestMethodUtils } from "./testMethodUtils";

export class ElementDeletionUtils {
    public static async deleteSomethingFromCode(msg: MessageUpdate): Promise<boolean> {
        if (msg.Type == TypeChanged.Feature) {
            unlinkSync(msg.FsPath);
            return true;
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
    public static async deleteElementWithProcedureCall(edit: WorkspaceEdit, msg: MessageUpdate, document: TextDocument) {
        if (!msg.ArrayIndex && msg.ArrayIndex != 0)
            throw new Error('ArrayIndex not passed')
        let rangeOfElement: Range | undefined = await ElementUtils.getRangeOfElement(document, msg.Scenario, msg.Type, msg.ArrayIndex);
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