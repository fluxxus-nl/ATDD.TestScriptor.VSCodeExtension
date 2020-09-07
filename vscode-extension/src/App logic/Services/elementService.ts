import { writeFileSync } from "fs-extra";
import { Position, Range, TextDocument, workspace, WorkspaceEdit } from "vscode";
import { MessageUpdate, TypeChanged } from "../../typings/types";
import { SyntaxTreeExt } from "../AL Code Outline Ext/syntaxTreeExt";
import { TextRangeExt } from "../AL Code Outline Ext/textRangeExt";
import { ALFullSyntaxTreeNode } from "../AL Code Outline/alFullSyntaxTreeNode";
import { SyntaxTree } from "../AL Code Outline/syntaxTree";
import { ElementUtils } from "../Utils/elementUtils";
import { RangeUtils } from "../Utils/rangeUtils";
import { TestCodeunitUtils } from "../Utils/testCodeunitUtils";
import { TestMethodUtils } from "../Utils/testMethodUtils";

export class ElementService {
    public static async addNewElementToCode(msg: MessageUpdate): Promise<boolean> {
        if (msg.Type == TypeChanged.Feature) {
            writeFileSync(msg.FsPath, TestCodeunitUtils.getDefaultTestCodeunit(msg.NewValue), { encoding: 'utf8' });
            return true;
        }
        else {
            let document: TextDocument = await workspace.openTextDocument(msg.FsPath);
            let scenarioRange: Range | undefined = ElementUtils.getRangeOfScenario(document, msg.Scenario);
            if (!scenarioRange)
                return false;

            let positionToInsert: Position | undefined = await ElementUtils.findPositionToInsertElement(document, scenarioRange, msg.Type);
            if (!positionToInsert)
                return false;

            let edit = new WorkspaceEdit();
            ElementUtils.addElement(edit, document, positionToInsert, msg.Type, msg.NewValue);
            let procedureName: string = TestMethodUtils.getProcedureName(msg.Type, msg.NewValue);
            ElementUtils.addProcedureCall(edit, document, positionToInsert, procedureName);
            await TestCodeunitUtils.addProcedure(edit, document, procedureName);

            let successful: boolean = await workspace.applyEdit(edit);
            await document.save();
            return successful;
        }
    }

    public static async modifyElementInCode(msg: MessageUpdate): Promise<boolean> {
        let document: TextDocument = await workspace.openTextDocument(msg.FsPath);
        let scenarioRange: Range | undefined = ElementUtils.getRangeOfScenario(document, msg.Scenario);
        if (!scenarioRange)
            return false;

        let syntaxTree: SyntaxTree = await SyntaxTree.getInstance(document);
        let methodTreeNode: ALFullSyntaxTreeNode | undefined = SyntaxTreeExt.getMethodOrTriggerTreeNodeOfCurrentPosition(syntaxTree, scenarioRange.start);
        if (!methodTreeNode)
            return false;
        let methodRange: Range = RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(methodTreeNode.fullSpan));

        let rangeOfOldElement: Range | undefined = ElementUtils.getRangeOfElementInsideMethodRange(document, methodRange, msg.Type, msg.OldValue);
        if (!rangeOfOldElement)
            throw new Error('Element to be renamed wasn\'t found.');

        let edit: WorkspaceEdit = new WorkspaceEdit();
        let newProcedureName = TestMethodUtils.getProcedureName(msg.Type, msg.NewValue);
        let oldProcedureName = TestMethodUtils.getProcedureName(msg.Type, msg.OldValue);
        if (await ElementUtils.existsProcedureCallToElementValue(document, methodRange.start, msg.Type, msg.OldValue)) {
            let identifierOfOldProcedureCall: ALFullSyntaxTreeNode = <ALFullSyntaxTreeNode>await ElementUtils.getProcedureCallToElementValue(document, rangeOfOldElement.start, msg.Type, msg.OldValue)
            let rangeOfOldIdentifier: Range = RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(identifierOfOldProcedureCall.fullSpan));
            let oldMethodTreeNode: ALFullSyntaxTreeNode | undefined = await SyntaxTreeExt.getMethodTreeNodeByCallPosition(document, TextRangeExt.createVSCodeRange(identifierOfOldProcedureCall.fullSpan).end);
            //delete old procedure eventually
            if (msg.DeleteProcedure && oldMethodTreeNode)
                TestCodeunitUtils.deleteProcedure(edit, document.uri, oldMethodTreeNode);
            //rename procedurecall
            ElementUtils.renameProcedureCall(edit, document, rangeOfOldIdentifier, newProcedureName);
            //add procedure similar to old one
            if (oldMethodTreeNode) {
                let parameterTypes: string[] = TestMethodUtils.getParameterTypesOfMethod(oldMethodTreeNode, document);
                if (!(await TestCodeunitUtils.isProcedureAlreadyDeclared(document, newProcedureName, parameterTypes))) {
                    let procedureHeaderOfOldMethod = TestMethodUtils.getProcedureHeaderOfMethod(oldMethodTreeNode, document);
                    let procedureHeaderOfNewMethod: string = procedureHeaderOfOldMethod.replace(new RegExp("procedure " + oldProcedureName, 'i'), 'procedure ' + newProcedureName);
                    await TestCodeunitUtils.addProcedureWithSpecificHeader(edit, document, newProcedureName, procedureHeaderOfNewMethod);
                }
            } else {
                //only happens if procedure call to old procedure exists, but no implementation to that one.
                if (!(await TestCodeunitUtils.isProcedureAlreadyDeclared(document, newProcedureName, [])))
                    TestCodeunitUtils.addProcedure(edit, document, newProcedureName);
            }
        } else {
            ElementUtils.deleteElement(edit, document, rangeOfOldElement);
            ElementUtils.addProcedureCall(edit, document, rangeOfOldElement.start, newProcedureName);
            ElementUtils.addElement(edit, document, rangeOfOldElement.start, msg.Type, msg.NewValue);
            if (!(await TestCodeunitUtils.isProcedureAlreadyDeclared(document, newProcedureName, [])))
                TestCodeunitUtils.addProcedure(edit, document, newProcedureName);
        }

        let successful: boolean = await workspace.applyEdit(edit);
        await document.save();
        return successful;
    }

    public static async deleteElementFromCode(msg: MessageUpdate): Promise<boolean> {
        let edit: WorkspaceEdit = new WorkspaceEdit();
        let document: TextDocument = await workspace.openTextDocument(msg.FsPath);
        ElementUtils.deleteElementWithProcedureCall(edit, msg, document);
        let successful: boolean = await workspace.applyEdit(edit);
        await document.save();
        return successful;
    }
}