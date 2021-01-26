import { commands, Position, Range, TextDocument, workspace, WorkspaceEdit } from "vscode";
import { MessageUpdate, TypeChanged } from "../../typings/types";
import { ALFullSyntaxTreeNodeExt } from "../AL Code Outline Ext/alFullSyntaxTreeNodeExt";
import { FullSyntaxTreeNodeKind } from "../AL Code Outline Ext/fullSyntaxTreeNodeKind";
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

export class ElementModificationUtils {
    public static async modifySomethingInCode(msg: MessageUpdate): Promise<boolean> {
        if (msg.Type == TypeChanged.Feature) {
            throw new Error('Not supported yet to rename a feature.')
        }
        let document: TextDocument = await workspace.openTextDocument(msg.FsPath);
        let methodTreeNode: ALFullSyntaxTreeNode | undefined = await ElementModificationUtils.getMethodTreeNode(msg, document);
        if (!methodTreeNode)
            return false;

        let edit: WorkspaceEdit
        if ([TypeChanged.Given, TypeChanged.When, TypeChanged.Then].includes(msg.Type)) {
            let methodRange: Range = RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(methodTreeNode.fullSpan));
            edit = await ElementModificationUtils.modifyElement(document, methodRange, msg);
        } else if (msg.Type == TypeChanged.ScenarioName) {
            edit = await ElementModificationUtils.modifyScenario(document, methodTreeNode, msg);
            msg.MethodName = TestMethodUtils.getProcedureName(TypeChanged.ScenarioName, msg.NewValue);
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
        let newProcedureName: string = TestMethodUtils.getProcedureName(msg.Type, msg.NewValue);
        if (await ElementUtils.existsAppropriateProcedureCallToElementValue(document, rangeOfOldElement.start, msg.Type, msg.OldValue)) {
            let identifierOfOldProcedureCall: ALFullSyntaxTreeNode = <ALFullSyntaxTreeNode>await ElementUtils.getAppropriateProcedureCallToElementValue(document, rangeOfOldElement.start, msg.Type, msg.OldValue);
            let rangeOfOldIdentifier: Range = RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(identifierOfOldProcedureCall.fullSpan));
            let oldMethodTreeNode: ALFullSyntaxTreeNode | undefined = await SyntaxTreeExt.getMethodTreeNodeByCallPosition(document, rangeOfOldIdentifier.end);

            let alreadyRenamed: boolean = false;
            //add procedure similar to old one
            if (oldMethodTreeNode) {
                let parameterTypes: string[] = TestMethodUtils.getParameterTypesOfMethod(oldMethodTreeNode, document);
                let procedureDeclaredResult: { alreadyDeclared: boolean, procedureName: string } = await TestCodeunitUtils.isProcedureOfElementAlreadyDeclared(document, msg.Type, msg.NewValue, parameterTypes)
                if (procedureDeclaredResult.alreadyDeclared)
                    newProcedureName = procedureDeclaredResult.procedureName
                else {
                    let references: Location[] | undefined = await commands.executeCommand('vscode.executeReferenceProvider', document.uri, rangeOfOldIdentifier.end);
                    if (references && references.length == 2) {
                        await TestMethodUtils.renameMethod(edit, oldMethodTreeNode, document, newProcedureName);
                        alreadyRenamed = true;
                    } else {
                        let procedureHeaderOfOldMethod = TestMethodUtils.getProcedureHeaderOfMethod(oldMethodTreeNode, document);
                        let oldProcedureName: string = ALFullSyntaxTreeNodeExt.findIdentifierAndGetValueOfTreeNode(document, oldMethodTreeNode);
                        let procedureHeaderOfNewMethod: string = procedureHeaderOfOldMethod.replace(new RegExp("procedure " + oldProcedureName, 'i'), 'procedure ' + newProcedureName);
                        await TestCodeunitUtils.addProcedureWithSpecificHeader(edit, document, newProcedureName, procedureHeaderOfNewMethod);
                    }
                }
            } else {
                //only happens if procedure call to old procedure exists, but no implementation to that one.
                let procedureDeclaredResult: { alreadyDeclared: boolean, procedureName: string } = await TestCodeunitUtils.isProcedureOfElementAlreadyDeclared(document, msg.Type, msg.NewValue, [])
                if (procedureDeclaredResult.alreadyDeclared)
                    newProcedureName = procedureDeclaredResult.procedureName
                else
                    TestCodeunitUtils.addProcedure(edit, document, newProcedureName);
            }
            //rename procedurecall and element
            edit.replace(document.uri, rangeOfOldElement, ElementUtils.getElementComment(msg.Type, msg.NewValue));
            if (!alreadyRenamed && msg.UpdateProcedureCall)
                ElementModificationUtils.renameProcedureCall(edit, document, rangeOfOldIdentifier, newProcedureName);
        } else {
            let newElementComment: string = ElementUtils.getElementComment(msg.Type, msg.NewValue);
            edit.replace(document.uri, rangeOfOldElement, newElementComment);
            let procedureDeclaredResult: { alreadyDeclared: boolean, procedureName: string } = await TestCodeunitUtils.isProcedureOfElementAlreadyDeclared(document, msg.Type, msg.NewValue, [])
            if (procedureDeclaredResult.alreadyDeclared)
                newProcedureName = procedureDeclaredResult.procedureName
            else
                await TestCodeunitUtils.addProcedure(edit, document, newProcedureName);
            ElementInsertionUtils.addProcedureCall(edit, document, rangeOfOldElement.start.translate(0, newElementComment.length), newProcedureName);
        }
        if (msg.ProceduresToDelete)
            await ElementDeletionUtils.deleteProcedures(edit, document, msg.ProceduresToDelete);
        return edit;
    }
    static async modifyScenario(document: TextDocument, methodTreeNode: ALFullSyntaxTreeNode, msg: MessageUpdate): Promise<WorkspaceEdit> {
        let newScenarioName = TestMethodUtils.getProcedureName(msg.Type, msg.NewValue);
        let edit: WorkspaceEdit = new WorkspaceEdit();
        await TestMethodUtils.renameMethod(edit, methodTreeNode, document, newScenarioName);

        ElementModificationUtils.renameOrAddScenarioComment(methodTreeNode, document, edit, msg);
        return edit;
    }

    private static async getMethodTreeNode(msg: MessageUpdate, document: TextDocument): Promise<ALFullSyntaxTreeNode | undefined> {
        let methodTreeNode: ALFullSyntaxTreeNode | undefined
        let scenarioName: string = msg.Type == TypeChanged.ScenarioName ? msg.OldValue : msg.Scenario;
        let scenarioRange: Range | undefined = ElementUtils.getRangeOfScenario(document, scenarioName);
        if (scenarioRange) {
            let syntaxTree: SyntaxTree = await SyntaxTree.getInstance(document);
            methodTreeNode = SyntaxTreeExt.getMethodOrTriggerTreeNodeOfCurrentPosition(syntaxTree, scenarioRange.start);
        } else if (msg.Type == TypeChanged.ScenarioName) {
            let syntaxTree: SyntaxTree = await SyntaxTree.getInstance(document);
            methodTreeNode = syntaxTree.collectNodesOfKindXInWholeDocument(FullSyntaxTreeNodeKind.getMethodDeclaration()).find(node => node.name == msg.OldValue);
        }
        return methodTreeNode;
    }
    private static renameOrAddScenarioComment(methodTreeNode: ALFullSyntaxTreeNode, document: TextDocument, edit: WorkspaceEdit, msg: MessageUpdate): void {
        let methodRange: Range = TextRangeExt.createVSCodeRange(methodTreeNode.fullSpan);
        let regexScenario: RegExp = /\[Scenario\s*(?:#?(?<id>\d+))?\]\s*(?<content>.+)\s*/i;
        let commentOfScenarioRange: Range | undefined = RangeUtils.getRangeOfTextInsideRange(document, methodRange, regexScenario);
        if (commentOfScenarioRange) {
            let scenarioTextRange: Range | undefined = RangeUtils.getRangeOfTextInsideRange(document, commentOfScenarioRange, /\].*/);
            if (scenarioTextRange) {
                scenarioTextRange = scenarioTextRange.with(scenarioTextRange.start.translate(0, 1));
                edit.replace(document.uri, scenarioTextRange, ' ' + msg.NewValue);
            }
        } else {
            let blockNode: ALFullSyntaxTreeNode = ALFullSyntaxTreeNodeExt.getFirstChildNodeOfKind(methodTreeNode, FullSyntaxTreeNodeKind.getBlock(), false)!
            let blockRange: Range = RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(blockNode.fullSpan))
            edit.insert(document.uri, new Position(blockRange.start.line + 1, 0), ''.padStart(8, ' ') + '// [Scenario] ' + msg.NewValue + '\r\n')
        }
    }
    public static renameProcedureCall(edit: WorkspaceEdit, document: TextDocument, rangeToReplace: Range, newProcedureName: string) {
        edit.replace(document.uri, rangeToReplace, newProcedureName);
    }
}