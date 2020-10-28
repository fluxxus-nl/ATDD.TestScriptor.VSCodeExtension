import { commands, Range, TextDocument, workspace, WorkspaceEdit } from "vscode";
import { MessageUpdate, TypeChanged } from "../../typings/types";
import { SyntaxTreeExt } from "../AL Code Outline Ext/syntaxTreeExt";
import { TextRangeExt } from "../AL Code Outline Ext/textRangeExt";
import { ALFullSyntaxTreeNode } from "../AL Code Outline/alFullSyntaxTreeNode";
import { SyntaxTree } from "../AL Code Outline/syntaxTree";
import { ElementDeletionUtils } from "./elementDeletionUtils";
import { ElementInsertionUtils } from "./elementInsertionUtils";
import { ElementUtils } from "./elementUtils";
import { RangeUtils } from "./rangeUtils";
import { TestCodeunitUtils } from "./testCodeunitUtils";
import { TestMethodUtils } from "./testMethodUtils";

export class ElementModificationUtils{
    public static async modifySomethingInCode(msg: MessageUpdate): Promise<boolean> {
        let document: TextDocument = await workspace.openTextDocument(msg.FsPath);
        let scenarioName: string = msg.Type == TypeChanged.ScenarioName ? msg.OldValue : msg.Scenario
        let scenarioRange: Range | undefined = ElementUtils.getRangeOfScenario(document, scenarioName);
        if (!scenarioRange)
            return false;

        let syntaxTree: SyntaxTree = await SyntaxTree.getInstance(document);
        let methodTreeNode: ALFullSyntaxTreeNode | undefined = SyntaxTreeExt.getMethodOrTriggerTreeNodeOfCurrentPosition(syntaxTree, scenarioRange.start);
        if (!methodTreeNode)
            return false;
        let methodRange: Range = RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(methodTreeNode.fullSpan));

        let edit: WorkspaceEdit
        if ([TypeChanged.Given, TypeChanged.When, TypeChanged.When].includes(msg.Type)) {
            edit = await ElementModificationUtils.modifyElement(document, methodRange, msg);
        } else if (msg.Type == TypeChanged.ScenarioName) {
            edit = await ElementModificationUtils.modifyScenario(document, methodTreeNode, msg);
        } else {
            throw new Error('Unexpected type that\'s modified.');
        }
        let successful: boolean = await workspace.applyEdit(edit);
        await document.save();
        return successful;
    }
    private static async modifyElement(document: TextDocument, methodRange: Range, msg: MessageUpdate): Promise<WorkspaceEdit> {
        if (!msg.ArrayIndex && msg.ArrayIndex != 0)
            throw new Error('ArrayIndex not passed')
        let rangeOfOldElement: Range | undefined = ElementUtils.getRangeOfElementInsideMethodRange(document, methodRange, msg.Type, msg.ArrayIndex);
        if (!rangeOfOldElement)
            throw new Error('Element to be renamed wasn\'t found.');

        let edit: WorkspaceEdit = new WorkspaceEdit();
        let newProcedureName = TestMethodUtils.getProcedureName(msg.Type, msg.NewValue);
        let oldProcedureName = TestMethodUtils.getProcedureName(msg.Type, msg.OldValue);
        if (await ElementUtils.existsAppropriateProcedureCallToElementValue(document, rangeOfOldElement.start, msg.Type, msg.OldValue)) {
            let identifierOfOldProcedureCall: ALFullSyntaxTreeNode = <ALFullSyntaxTreeNode>await ElementUtils.getAppropriateProcedureCallToElementValue(document, rangeOfOldElement.start, msg.Type, msg.OldValue);
            let rangeOfOldIdentifier: Range = RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(identifierOfOldProcedureCall.fullSpan));
            let oldMethodTreeNode: ALFullSyntaxTreeNode | undefined = await SyntaxTreeExt.getMethodTreeNodeByCallPosition(document, rangeOfOldIdentifier.end);

            let alreadyRenamed: boolean = false;
            //add procedure similar to old one
            if (oldMethodTreeNode) {
                let parameterTypes: string[] = TestMethodUtils.getParameterTypesOfMethod(oldMethodTreeNode, document);
                if (!(await TestCodeunitUtils.isProcedureAlreadyDeclared(document, newProcedureName, parameterTypes))) {
                    let references: Location[] | undefined = await commands.executeCommand('vscode.executeReferenceProvider', document.uri, rangeOfOldIdentifier.end);
                    if (references && references.length == 2) {
                        await TestMethodUtils.renameMethod(edit, oldMethodTreeNode, document, newProcedureName);
                        alreadyRenamed = true;
                    } else {
                        let procedureHeaderOfOldMethod = TestMethodUtils.getProcedureHeaderOfMethod(oldMethodTreeNode, document);
                        let procedureHeaderOfNewMethod: string = procedureHeaderOfOldMethod.replace(new RegExp("procedure " + oldProcedureName, 'i'), 'procedure ' + newProcedureName);
                        await TestCodeunitUtils.addProcedureWithSpecificHeader(edit, document, newProcedureName, procedureHeaderOfNewMethod);
                    }
                }
            } else {
                //only happens if procedure call to old procedure exists, but no implementation to that one.
                if (!(await TestCodeunitUtils.isProcedureAlreadyDeclared(document, newProcedureName, [])))
                    TestCodeunitUtils.addProcedure(edit, document, newProcedureName);
            }
            //rename procedurecall and element
            edit.replace(document.uri, rangeOfOldElement, ElementUtils.getElementComment(msg.Type, msg.NewValue));
            if (!alreadyRenamed && msg.UpdateProcedureCall)
                ElementModificationUtils.renameProcedureCall(edit, document, rangeOfOldIdentifier, newProcedureName);
        } else {
            let newElementComment: string = ElementUtils.getElementComment(msg.Type, msg.NewValue);
            edit.replace(document.uri, rangeOfOldElement, newElementComment);
            ElementInsertionUtils.addProcedureCall(edit, document, rangeOfOldElement.start.translate(0, newElementComment.length), newProcedureName);
            if (!(await TestCodeunitUtils.isProcedureAlreadyDeclared(document, newProcedureName, [])))
                await TestCodeunitUtils.addProcedure(edit, document, newProcedureName);
        }
        if (msg.ProceduresToDelete)
            await ElementDeletionUtils.deleteProcedures(edit, document, msg.ProceduresToDelete);
        return edit;
    }
    static async modifyScenario(document: TextDocument, methodTreeNode: ALFullSyntaxTreeNode, msg: MessageUpdate): Promise<WorkspaceEdit> {
        let newScenarioName = TestMethodUtils.getProcedureName(msg.Type, msg.NewValue);
        let edit: WorkspaceEdit = new WorkspaceEdit();
        await TestMethodUtils.renameMethod(edit, methodTreeNode, document, newScenarioName);

        ElementModificationUtils.renameScenarioComment(methodTreeNode, document, edit, msg);
        return edit;
    }

    private static renameScenarioComment(methodTreeNode: ALFullSyntaxTreeNode, document: TextDocument, edit: WorkspaceEdit, msg: MessageUpdate): void {
        let methodRange: Range = TextRangeExt.createVSCodeRange(methodTreeNode.fullSpan);
        let regexScenario: RegExp = /\[Scenario\s*(?:#?(?<id>\d+))?\]\s*(?<content>.+)\s*/i;
        let commentOfScenarioRange: Range | undefined = RangeUtils.getRangeOfTextInsideRange(document, methodRange, regexScenario);
        if (commentOfScenarioRange) {
            let scenarioTextRange: Range | undefined = RangeUtils.getRangeOfTextInsideRange(document, commentOfScenarioRange, /\].*/);
            if (scenarioTextRange) {
                scenarioTextRange = scenarioTextRange.with(scenarioTextRange.start.translate(0, 1));
                edit.replace(document.uri, scenarioTextRange, ' ' + msg.NewValue);
            }
        }
    }
    public static renameProcedureCall(edit: WorkspaceEdit, document: TextDocument, rangeToReplace: Range, newProcedureName: string) {
        edit.replace(document.uri, rangeToReplace, newProcedureName);
    }
}