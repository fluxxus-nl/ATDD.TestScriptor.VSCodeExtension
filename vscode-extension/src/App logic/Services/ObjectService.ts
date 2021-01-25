import { readFileSync } from 'fs';
import { commands, Location, Range, RelativePattern, TextDocument, Uri, workspace } from 'vscode';
import { Message, MessageState, MessageUpdate, TypeChanged } from "../../typings/types";
import { ALFullSyntaxTreeNodeExt } from '../AL Code Outline Ext/alFullSyntaxTreeNodeExt';
import { FullSyntaxTreeNodeKind } from '../AL Code Outline Ext/fullSyntaxTreeNodeKind';
import { SyntaxTreeExt } from '../AL Code Outline Ext/syntaxTreeExt';
import { TextRangeExt } from '../AL Code Outline Ext/textRangeExt';
import { ALFullSyntaxTreeNode } from '../AL Code Outline/alFullSyntaxTreeNode';
import { SyntaxTree } from '../AL Code Outline/syntaxTree';
import { ElementDeletionUtils } from '../Utils/elementDeletionUtils';
import { ElementInsertionUtils } from '../Utils/elementInsertionUtils';
import { ElementModificationUtils } from '../Utils/elementModificationUtils';
import { ElementUtils } from '../Utils/elementUtils';
import { ObjectToMessageUtils } from '../Utils/objectToMessageUtils';
import { RangeUtils } from '../Utils/rangeUtils';
import { TestCodeunitUtils } from '../Utils/testCodeunitUtils';
import { TestMethodUtils } from '../Utils/testMethodUtils';

export class ObjectService {
    async getProjects(): Promise<string[]> {
        if (!workspace.workspaceFolders)
            return [];
        let appJsons: string[] = [];
        for (let i = 0; i < workspace.workspaceFolders.length; i++) {
            let files: Uri[] = await workspace.findFiles(new RelativePattern(workspace.workspaceFolders[i], 'app.json'));
            for (let a = 0; a < files.length; a++) {
                let appDocText: string = readFileSync(files[a].fsPath, { encoding: 'utf8' })
                let appJson = JSON.parse(appDocText);
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
            let featureCodeunitLevel: string | undefined
            if (testMethods.length > 0) {
                featureCodeunitLevel = ObjectToMessageUtils.getUniqueFeature(document, testMethods[0]);
            }
            for (let a = 0; a < testMethods.length; a++)
                messages.push(await ObjectToMessageUtils.testMethodToMessage(document, testMethods[a], featureCodeunitLevel));
        }
        return messages.sort((a, b) => {
            if (a.Project != b.Project)
                return a.Project && b.Project ? a.Project.localeCompare(b.Project) : a.Project ? -1 : 1
            if (a.Feature != b.Feature)
                return a.Feature && b.Feature ? a.Feature.localeCompare(b.Feature) : a.Feature ? -1 : 1
            if (a.Id || b.Id)
                return a.Id && b.Id ? a.Id - b.Id : a.Id ? -1 : 1
            return a.Scenario && b.Scenario ? a.Scenario.localeCompare(b.Scenario) : a.Scenario ? -1 : 1
        });
    }
    public async getProceduresWhichCouldBeDeletedAfterwards(msg: MessageUpdate): Promise<Array<{ procedureName: string, parameterTypes: string[] }>> {
        let document: TextDocument = await workspace.openTextDocument(msg.FsPath);
        if ([TypeChanged.Given, TypeChanged.When, TypeChanged.Then].includes(msg.Type) &&
            (msg.State == MessageState.Deleted || (msg.State == MessageState.Modified && await this.checkIfOldAndNewProcedureExists(msg)))) {
            if (!msg.ArrayIndex && msg.ArrayIndex != 0)
                throw new Error('ArrayIndex not passed')
            let procedureToDelete: { procedureName: string, parameterTypes: string[] } | undefined = await this.getProcedureWhichCouldBeDeletedAfterwardsOfElement(document, msg.Scenario, msg.OldValue, msg.ArrayIndex, msg.Type);
            if (procedureToDelete)
                return [procedureToDelete];
        } else if (TypeChanged.ScenarioName == msg.Type && MessageState.Deleted == msg.State) {
            return await this.getProceduresWhichCouldBeDeletedAfterwardsOfScenario(document, msg);
        }
        return [];
    }
    public async checkIfOldAndNewProcedureExists(msg: MessageUpdate): Promise<boolean> {
        let document: TextDocument = await workspace.openTextDocument(msg.FsPath);
        if (![TypeChanged.Given, TypeChanged.When, TypeChanged.Then].includes(msg.Type))
            return false;
        if (!msg.ArrayIndex && msg.ArrayIndex != 0)
            throw new Error('ArrayIndex not passed')

        let elementRange: Range | undefined = await ElementUtils.getRangeOfElement(document, msg.Scenario, msg.Type, msg.ArrayIndex) as Range;
        let identifierTreeNodeOfOldInvocation: ALFullSyntaxTreeNode | undefined = await ElementUtils.getAppropriateProcedureCallToElementValue(document, elementRange.start, msg.Type, msg.OldValue);
        if (!identifierTreeNodeOfOldInvocation)
            return false;

        let rangeOfOldIdentifier: Range = RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(identifierTreeNodeOfOldInvocation.fullSpan));
        let oldMethodTreeNode: ALFullSyntaxTreeNode | undefined = await SyntaxTreeExt.getMethodTreeNodeByCallPosition(document, rangeOfOldIdentifier.end);

        if (!oldMethodTreeNode)
            return false;

        let parameterTypes: string[] = TestMethodUtils.getParameterTypesOfMethod(oldMethodTreeNode, document);
        let newProcedureName: string = TestMethodUtils.getProcedureName(msg.Type, msg.NewValue);
        if (await TestCodeunitUtils.isProcedureAlreadyDeclared(document, newProcedureName, parameterTypes))
            return true;
        let newHistoricalProcedureNames: string[] = TestMethodUtils.getProcedureNameHistory(msg.Type, msg.NewValue)
        for (const newHistoricalProcedureName of newHistoricalProcedureNames) {
            if (await TestCodeunitUtils.isProcedureAlreadyDeclared(document, newHistoricalProcedureName, parameterTypes))
                return true;
        }
        return false;
    }

    private async getProceduresWhichCouldBeDeletedAfterwardsOfScenario(document: TextDocument, msg: MessageUpdate): Promise<Array<{ procedureName: string, parameterTypes: string[] }>> {
        let proceduresWhichCouldBeDeleted: Array<{ procedureName: string; parameterTypes: string[]; }> = [];
        let rangeOfScenario: Range | undefined = ElementUtils.getRangeOfScenario(document, msg.OldValue, msg.Id);
        if (rangeOfScenario) {
            let syntaxTree: SyntaxTree = await SyntaxTree.getInstance(document);
            let scenarioMethodTreeNode: ALFullSyntaxTreeNode | undefined = SyntaxTreeExt.getMethodOrTriggerTreeNodeOfCurrentPosition(syntaxTree, rangeOfScenario.start);
            if (scenarioMethodTreeNode) {
                let scenarioMethodRange: Range = TextRangeExt.createVSCodeRange(scenarioMethodTreeNode.fullSpan);
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
                    let procedureToDelete: { procedureName: string; parameterTypes: string[]; } | undefined = await this.getProcedureWhichCouldBeDeletedAfterwardsOfElement(document, msg.Scenario, message.Details.given[i], i, TypeChanged.Given, scenarioMethodRange);
                    if (procedureToDelete)
                        if (!TestMethodUtils.procedureAlreadyExistsInProcedureList(procedureToDelete, proceduresWhichCouldBeDeleted))
                            proceduresWhichCouldBeDeleted.push(procedureToDelete);
                }
                for (let i = 0; i < message.Details.when.length; i++) {
                    if (message.Details.when[i] != '') {
                        let procedureToDelete: { procedureName: string; parameterTypes: string[]; } | undefined = await this.getProcedureWhichCouldBeDeletedAfterwardsOfElement(document, msg.Scenario, message.Details.when[i], i, TypeChanged.When, scenarioMethodRange);
                        if (procedureToDelete)
                            if (!TestMethodUtils.procedureAlreadyExistsInProcedureList(procedureToDelete, proceduresWhichCouldBeDeleted))
                                proceduresWhichCouldBeDeleted.push(procedureToDelete);
                    }
                }
                for (let i = 0; i < message.Details.then.length; i++) {
                    let procedureToDelete: { procedureName: string; parameterTypes: string[]; } | undefined = await this.getProcedureWhichCouldBeDeletedAfterwardsOfElement(document, msg.Scenario, message.Details.then[i], i, TypeChanged.Then, scenarioMethodRange);
                    if (procedureToDelete)
                        if (!TestMethodUtils.procedureAlreadyExistsInProcedureList(procedureToDelete, proceduresWhichCouldBeDeleted))
                            proceduresWhichCouldBeDeleted.push(procedureToDelete);
                }
                let handlerFunctions: ALFullSyntaxTreeNode[] = await TestMethodUtils.getHandlerFunctions(document, scenarioMethodTreeNode);
                for (const handlerFunction of handlerFunctions) {
                    let identifierTreeNode: ALFullSyntaxTreeNode = ALFullSyntaxTreeNodeExt.getFirstChildNodeOfKind(handlerFunction, FullSyntaxTreeNodeKind.getIdentifierName(), false) as ALFullSyntaxTreeNode;
                    let rangeOfIdentifier: Range = RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(identifierTreeNode.fullSpan));
                    let locations: Location[] | undefined = await commands.executeCommand('vscode.executeReferenceProvider', document.uri, rangeOfIdentifier.start);
                    if (locations && locations.length <= 2) { //call & declaration
                        let procedureName: string = ALFullSyntaxTreeNodeExt.findIdentifierAndGetValueOfTreeNode(document, handlerFunction);
                        let parameterTypes: string[] = TestMethodUtils.getParameterTypesOfMethod(handlerFunction, document);
                        proceduresWhichCouldBeDeleted.push({ procedureName: procedureName, parameterTypes: parameterTypes });
                    }
                }
            }
        }
        return proceduresWhichCouldBeDeleted;
    }

    private async getProcedureWhichCouldBeDeletedAfterwardsOfElement(document: TextDocument, scenario: string, elementValue: string, elementId: number, elementType: TypeChanged, rangeToDeleteInTotal?: Range): Promise<{ procedureName: string, parameterTypes: string[] } | undefined> {
        let elementRange: Range | undefined = await ElementUtils.getRangeOfElement(document, scenario, elementType, elementId) as Range;

        let identifierTreeNodeOfInvocation: ALFullSyntaxTreeNode | undefined = await ElementUtils.getAppropriateProcedureCallToElementValue(document, elementRange.start, elementType, elementValue);
        if (identifierTreeNodeOfInvocation) {
            let rangeOfProcedureCall: Range = RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(identifierTreeNodeOfInvocation.fullSpan));
            let references: Location[] | undefined = await commands.executeCommand('vscode.executeReferenceProvider', document.uri, rangeOfProcedureCall.start);
            let procedureCouldBeDeleted: boolean = false;
            if (references) {
                if (references.length == 2)
                    procedureCouldBeDeleted = true;
                else if (references.length > 2 && rangeToDeleteInTotal) {
                    let referencesInsideRangeToDelete: Location[] = references.filter(reference => reference.uri.fsPath == document.uri.fsPath && rangeToDeleteInTotal.contains(reference.range));
                    if (referencesInsideRangeToDelete.length == references.length - 1) //minus declaration
                        procedureCouldBeDeleted = true;
                }
            }
            if (procedureCouldBeDeleted) {
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
    public async saveChanges(msg: MessageUpdate): Promise<boolean> {
        switch (msg.State) {
            case MessageState.New:
                return ElementInsertionUtils.addSomethingNewToCode(msg);
            case MessageState.Modified:
                return ElementModificationUtils.modifySomethingInCode(msg);
            case MessageState.Deleted:
                return ElementDeletionUtils.deleteSomethingFromCode(msg);
            default:
                return false;
        }
    }
    async isChangeValid(msg: MessageUpdate): Promise<{ valid: boolean, reason: string }> {
        if (msg.Type == TypeChanged.ScenarioName && [MessageState.New, MessageState.Modified].includes(msg.State)) {
            let fsPath: string = await ElementUtils.getFSPathOfFeature(msg.Project, msg.Feature);
            let document: TextDocument = await workspace.openTextDocument(fsPath);
            let scenarioProcedureName = TestMethodUtils.getProcedureName(TypeChanged.ScenarioName, msg.NewValue);
            if (await TestCodeunitUtils.isProcedureAlreadyDeclared(document, scenarioProcedureName, [])) {
                return {
                    valid: false,
                    reason: 'Scenario already exists. Please update your scenario definition so it is unique.'
                };
            }
        }
        if ([TypeChanged.Given, TypeChanged.When, TypeChanged.Then].includes(msg.Type) && [MessageState.Modified, MessageState.Deleted].includes(msg.State)) {
            if (!msg.ArrayIndex && msg.ArrayIndex != 0)
                throw new Error('ArrayIndex not passed')
            let fsPath: string = await ElementUtils.getFSPathOfFeature(msg.Project, msg.Feature);
            let document: TextDocument = await workspace.openTextDocument(fsPath);
            if (!await ElementUtils.getRangeOfElement(document, msg.Scenario, msg.Type, msg.ArrayIndex)) {
                return {
                    valid: false,
                    reason: TypeChanged[TypeChanged.Given] + ' \'' + msg.OldValue + '\' not found.'
                }
            }
        }
        return { valid: true, reason: '' };
    }
}