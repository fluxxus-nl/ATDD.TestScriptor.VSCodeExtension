import { commands, Range, RelativePattern, TextDocument, Uri, workspace, WorkspaceConfiguration } from 'vscode';
import { Message, MessageState, MessageUpdate, TypeChanged } from "../../typings/types";
import { ALFullSyntaxTreeNodeExt } from '../AL Code Outline Ext/alFullSyntaxTreeNodeExt';
import { FullSyntaxTreeNodeKind } from '../AL Code Outline Ext/fullSyntaxTreeNodeKind';
import { SyntaxTreeExt } from '../AL Code Outline Ext/syntaxTreeExt';
import { TextRangeExt } from '../AL Code Outline Ext/textRangeExt';
import { ALFullSyntaxTreeNode } from '../AL Code Outline/alFullSyntaxTreeNode';
import { SyntaxTree } from '../AL Code Outline/syntaxTree';
import { ElementUtils } from '../Utils/elementUtils';
import { ObjectToMessageUtils } from '../Utils/objectToMessageUtils';
import { RangeUtils } from '../Utils/rangeUtils';
import { TestCodeunitUtils } from '../Utils/testCodeunitUtils';
import { TestMethodUtils } from '../Utils/testMethodUtils';
import { ElementService } from './elementService';

export class ObjectService {
    async getProjects(): Promise<string[]> {
        if (!workspace.workspaceFolders)
            return [];
        let appJsons: string[] = [];
        for (let i = 0; i < workspace.workspaceFolders.length; i++) {
            let files: Uri[] = await workspace.findFiles(new RelativePattern(workspace.workspaceFolders[i], 'app.json'));
            for (let a = 0; a < files.length; a++) {
                let appDoc: TextDocument = await workspace.openTextDocument(files[a]);
                let appJson = JSON.parse(appDoc.getText());
                appJson.FilePath = workspace.workspaceFolders[i].uri.fsPath;
                appJsons.push(appJson);
            }
        }
        return appJsons;
    }

    public async getObjects(paths: string[]): Promise<Message[]> {
        let messages: Message[] = [];
        let testUris: Uri[] = await TestCodeunitUtils.getTestUrisOfWorkspaces(paths);
        for (let i = 0; i < testUris.length; i++) {
            let document: TextDocument = await workspace.openTextDocument(testUris[i].fsPath);
            let testMethods: ALFullSyntaxTreeNode[] = await TestCodeunitUtils.getTestMethodsOfDocument(document);
            for (let a = 0; a < testMethods.length; a++)
                messages.push(await ObjectToMessageUtils.testMethodToMessage(document, testMethods[a]));
        }
        return messages.sort((a, b) => a.Id && b.Id ? (a.Id - b.Id) : (a.MethodName.localeCompare(b.MethodName)));
    }
    public async getProceduresWhichCouldBeDeletedAfterwards(msg: MessageUpdate, config: WorkspaceConfiguration): Promise<Array<{ procedureName: string, parameterTypes: string[] }>> {
        let document: TextDocument = await workspace.openTextDocument(msg.FsPath);
        if ([TypeChanged.Given, TypeChanged.When, TypeChanged.Then].includes(msg.Type) && [MessageState.Deleted, MessageState.Modified].includes(msg.State)) {
            let procedureToDelete: { procedureName: string, parameterTypes: string[] } | undefined = await this.getProcedureWhichCouldBeDeletedAfterwardsOfElement(document, msg.Scenario, msg.OldValue, msg.Type);
            if (procedureToDelete)
                return [procedureToDelete];
        } else if (TypeChanged.ScenarioName == msg.Type && MessageState.Deleted == msg.State) {
            return await this.getProceduresWhichCouldBeDeletedAfterwardsOfScenario(document, msg);
        }
        return [];
    }
    private async getProceduresWhichCouldBeDeletedAfterwardsOfScenario(document: TextDocument, msg: MessageUpdate): Promise<Array<{ procedureName: string, parameterTypes: string[] }>> {
        let proceduresWhichCouldBeDeleted: Array<{ procedureName: string; parameterTypes: string[]; }> = [];
        let rangeOfScenario: Range | undefined = ElementUtils.getRangeOfScenario(document, msg.Scenario, msg.Id);
        if (rangeOfScenario) {
            let syntaxTree: SyntaxTree = await SyntaxTree.getInstance(document);
            let scenarioMethodTreeNode: ALFullSyntaxTreeNode | undefined = SyntaxTreeExt.getMethodOrTriggerTreeNodeOfCurrentPosition(syntaxTree, rangeOfScenario.start);
            if (scenarioMethodTreeNode) {

                let identifier: ALFullSyntaxTreeNode = ALFullSyntaxTreeNodeExt.getFirstChildNodeOfKind(scenarioMethodTreeNode, FullSyntaxTreeNodeKind.getIdentifierName(), false) as ALFullSyntaxTreeNode;
                let rangeOfIdentifier: Range = RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(identifier.fullSpan));
                let references: Location[] | undefined = await commands.executeCommand('vscode.executeReferenceProvider', document.uri, rangeOfIdentifier.start);
                if (references && references.length == 1) { //declaration
                    let procedureName: string = ALFullSyntaxTreeNodeExt.findIdentifierAndGetValueOfTreeNode(document, scenarioMethodTreeNode);
                    let parameterTypes: string[] = TestMethodUtils.getParameterTypesOfMethod(scenarioMethodTreeNode, document);
                    proceduresWhichCouldBeDeleted.push({ procedureName: procedureName, parameterTypes: parameterTypes });
                }


                let message: Message = await ObjectToMessageUtils.testMethodToMessage(document, scenarioMethodTreeNode);
                for (let i = 0; i < message.Details.given.length; i++) {
                    let procedureToDelete: { procedureName: string; parameterTypes: string[]; } | undefined = await this.getProcedureWhichCouldBeDeletedAfterwardsOfElement(document, msg.Scenario, message.Details.given[i], TypeChanged.Given);
                    if (procedureToDelete)
                        proceduresWhichCouldBeDeleted.push(procedureToDelete);
                }
                for (let i = 0; i < message.Details.when.length; i++) {
                    if (message.Details.when[i] != '') {
                        let procedureToDelete: { procedureName: string; parameterTypes: string[]; } | undefined = await this.getProcedureWhichCouldBeDeletedAfterwardsOfElement(document, msg.Scenario, message.Details.when[i], TypeChanged.When);
                        if (procedureToDelete)
                            proceduresWhichCouldBeDeleted.push(procedureToDelete);
                    }
                }
                for (let i = 0; i < message.Details.then.length; i++) {
                    let procedureToDelete: { procedureName: string; parameterTypes: string[]; } | undefined = await this.getProcedureWhichCouldBeDeletedAfterwardsOfElement(document, msg.Scenario, message.Details.then[i], TypeChanged.Then);
                    if (procedureToDelete)
                        proceduresWhichCouldBeDeleted.push(procedureToDelete);
                }

                let handlerFunctions: ALFullSyntaxTreeNode[] = await TestMethodUtils.getHandlerFunctions(document, scenarioMethodTreeNode);
                for (let i = 0; i < handlerFunctions.length; i++) {
                    let identifierTreeNode: ALFullSyntaxTreeNode = ALFullSyntaxTreeNodeExt.getFirstChildNodeOfKind(handlerFunctions[i], FullSyntaxTreeNodeKind.getIdentifierName(), false) as ALFullSyntaxTreeNode;
                    let rangeOfIdentifier: Range = RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(identifierTreeNode.fullSpan));
                    let locations: Location[] | undefined = await commands.executeCommand('vscode.executeReferenceProvider', document.uri, rangeOfIdentifier.start);
                    if (locations && locations.length <= 2) { //call & declaration
                        let procedureName: string = ALFullSyntaxTreeNodeExt.findIdentifierAndGetValueOfTreeNode(document, handlerFunctions[i]);
                        let parameterTypes: string[] = TestMethodUtils.getParameterTypesOfMethod(handlerFunctions[i], document);
                        proceduresWhichCouldBeDeleted.push({ procedureName: procedureName, parameterTypes: parameterTypes });
                    }
                }
            }
        }
        return proceduresWhichCouldBeDeleted;
    }

    private async getProcedureWhichCouldBeDeletedAfterwardsOfElement(document: TextDocument, scenario: string, elementValue: string, elementType: TypeChanged): Promise<{ procedureName: string, parameterTypes: string[] } | undefined> {
        let elementRange: Range | undefined = await ElementUtils.getRangeOfElement(document, scenario, elementType, elementValue) as Range;
        let identifierTreeNodeOfInvocation: ALFullSyntaxTreeNode | undefined = await ElementUtils.getProcedureCallToElementValue(document, elementRange.start, elementType, elementValue);
        if (identifierTreeNodeOfInvocation) {
            let rangeOfProcedureCall: Range = RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(identifierTreeNodeOfInvocation.fullSpan));
            let references: Location[] | undefined = await commands.executeCommand('vscode.executeReferenceProvider', document.uri, rangeOfProcedureCall.start);
            if (references && references.length <= 2) { //call + declaration
                let methodTreeNode: ALFullSyntaxTreeNode | undefined = await SyntaxTreeExt.getMethodTreeNodeByCallPosition(document, rangeOfProcedureCall.start);
                if (methodTreeNode) {
                    let procedureName: string = ALFullSyntaxTreeNodeExt.findIdentifierAndGetValueOfTreeNode(document, methodTreeNode);
                    let parameterTypes: string[] = TestMethodUtils.getParameterTypesOfMethod(methodTreeNode, document);
                    return { procedureName: procedureName, parameterTypes: parameterTypes };
                }
            }
        }
        return undefined;
    }
    public async saveChanges(msg: MessageUpdate, config: WorkspaceConfiguration): Promise<boolean> {
        switch (msg.State) {
            case MessageState.New:
                return ElementService.addNewElementToCode(msg);
            case MessageState.Modified:
                return ElementService.modifyElementInCode(msg);
            case MessageState.Deleted:
                return ElementService.deleteElementFromCode(msg);
            default:
                return false;
        }
    }
    async isChangeValid(entry: MessageUpdate, config: WorkspaceConfiguration): Promise<{ valid: boolean, reason: string }> {
        if (entry.Type == TypeChanged.ScenarioName && entry.State == MessageState.New) {
            let fsPath: string = await ElementService.getFSPathOfFeature(entry.Project, entry.Feature);
            let document: TextDocument = await workspace.openTextDocument(fsPath);
            let scenarioProcedureName = TestMethodUtils.getProcedureName(TypeChanged.ScenarioName, entry.NewValue);
            if (await TestCodeunitUtils.isProcedureAlreadyDeclared(document, scenarioProcedureName, [])) {
                return {
                    valid: false,
                    reason: 'Scenario already exists. Please update your scenario definition so it is unique.'
                };
            }
        }
        return { valid: true, reason: '' };
    }
}