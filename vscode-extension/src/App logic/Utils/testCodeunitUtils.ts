import { readFileSync } from 'fs';
import { Position, Range, RelativePattern, TextDocument, Uri, workspace, WorkspaceEdit, WorkspaceFolder } from 'vscode';
import { TypeChanged } from '../../typings/types';
import { ALFullSyntaxTreeNodeExt } from '../AL Code Outline Ext/alFullSyntaxTreeNodeExt';
import { FullSyntaxTreeNodeKind } from '../AL Code Outline Ext/fullSyntaxTreeNodeKind';
import { SyntaxTreeExt } from '../AL Code Outline Ext/syntaxTreeExt';
import { TextRangeExt } from '../AL Code Outline Ext/textRangeExt';
import { ALFullSyntaxTreeNode } from '../AL Code Outline/alFullSyntaxTreeNode';
import { SyntaxTree } from '../AL Code Outline/syntaxTree';
import { Config } from './config';
import { RangeUtils } from './rangeUtils';
import { TestMethodUtils } from './testMethodUtils';

export class TestCodeunitUtils {
    public static async getTestUrisOfWorkspaces(paths: string[]): Promise<Uri[]> {
        let uris: Uri[] = []
        for (let i = 0; i < paths.length; i++) {
            uris = uris.concat(await workspace.findFiles(new RelativePattern(paths[i], '**/*.al')))
        }
        let testUris: Uri[] = [];
        for (let i = 0; i < uris.length; i++) {
            let fileContent: string = readFileSync(uris[i].fsPath, { encoding: 'utf8', flag: 'r' });
            let regex: RegExp = /^.*codeunit \d+.*Subtype\s+=\s+Test;.*/is;
            if (regex.test(fileContent)) {
                testUris.push(uris[i]);
            }
        }
        return testUris;
    }
    public static async getTestMethodsOfDocument(document: TextDocument): Promise<ALFullSyntaxTreeNode[]> {
        let syntaxTree: SyntaxTree = await SyntaxTree.getInstance(document);
        let methods: ALFullSyntaxTreeNode[] = syntaxTree.collectNodesOfKindXInWholeDocument(FullSyntaxTreeNodeKind.getMethodDeclaration());
        let testMethods: ALFullSyntaxTreeNode[] = [];
        for (let i = 0; i < methods.length; i++) {
            let memberAttributes: ALFullSyntaxTreeNode[] = [];
            ALFullSyntaxTreeNodeExt.collectChildNodes(methods[i], FullSyntaxTreeNodeKind.getMemberAttribute(), false, memberAttributes);
            if (memberAttributes.some(attribute => document.getText(TextRangeExt.createVSCodeRange(attribute.fullSpan)).trim().toLowerCase().includes('[test]'))) {
                testMethods.push(methods[i]);
            }
        }
        return testMethods;
    }
    static async getObjectName(document: TextDocument, somePositionInsideObject: Position): Promise<string> {
        let syntaxTree: SyntaxTree = await SyntaxTree.getInstance(document);
        let objectTreeNode: ALFullSyntaxTreeNode = SyntaxTreeExt.getObjectTreeNodeUnsafe(syntaxTree, somePositionInsideObject);
        return ALFullSyntaxTreeNodeExt.findIdentifierAndGetValueOfTreeNode(document, objectTreeNode).replace(/"/g, '');
    }
    public static async getAppNameOfDocument(document: TextDocument): Promise<string> {
        let workspaceFolder: WorkspaceFolder | undefined = workspace.getWorkspaceFolder(document.uri);
        if (!workspaceFolder) {
            throw new Error('File should be inside a workspace');
        }
        let appUris: Uri[] = await workspace.findFiles(new RelativePattern(workspaceFolder, 'app.json'));
        if (appUris.length == 1) {
            let appDoc: TextDocument = await workspace.openTextDocument(appUris[0]);
            let appJson = JSON.parse(appDoc.getText());
            return appJson.name;
        }
        return '';
    }
    static async addProcedure(edit: WorkspaceEdit, document: TextDocument, procedureName: string) {
        if (await this.isProcedureAlreadyDeclared(document, procedureName, []))
            return;
        await this.addProcedureWithSpecificHeader(edit, document, procedureName, '    local procedure ' + procedureName + "()");
    }
    static async addProcedureWithSpecificHeader(edit: WorkspaceEdit, document: TextDocument, procedureNameOnly: string, procedureHeader: string) {
        let syntaxTree: SyntaxTree = await SyntaxTree.getInstance(document);
        let methodTreeNodes: ALFullSyntaxTreeNode[] = syntaxTree.collectNodesOfKindXInWholeDocument(FullSyntaxTreeNodeKind.getMethodDeclaration());
        if (methodTreeNodes.length > 0) {
            let lastRange: Range = RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(methodTreeNodes[methodTreeNodes.length - 1].fullSpan));
            let textToAdd: string = '\r\n\r\n';
            textToAdd += procedureHeader + '\r\n';
            textToAdd += '    begin\r\n';
            if (Config.getAddException(document.uri))
                textToAdd += '        Error(\'Procedure ' + procedureNameOnly + ' not yet implemented.\');\r\n';
            textToAdd += '    end;'
            edit.insert(document.uri, lastRange.end, textToAdd);
        }
    }
    static deleteProcedure(edit: WorkspaceEdit, uri: Uri, methodTreeNode: ALFullSyntaxTreeNode) {
        let rangeToDelete = TextRangeExt.createVSCodeRange(methodTreeNode.fullSpan);
        edit.delete(uri, rangeToDelete);
    }

    public static async getProcedureDeclarations(document: TextDocument): Promise<Map<string, Array<string[]>>> {
        // Map: Key = Procedurename, Values: Parameters
        let procedureDeclarations: Map<string, Array<string[]>> = new Map();
        let syntaxTree: SyntaxTree = await SyntaxTree.getInstance(document);
        let methodTreeNodes: ALFullSyntaxTreeNode[] = syntaxTree.collectNodesOfKindXInWholeDocument(FullSyntaxTreeNodeKind.getMethodDeclaration());
        if (methodTreeNodes.length > 0) {
            for (let i = 0; i < methodTreeNodes.length; i++) {
                let methodName = ALFullSyntaxTreeNodeExt.findIdentifierAndGetValueOfTreeNode(document, methodTreeNodes[i]);
                if (!procedureDeclarations.get(methodName))
                    procedureDeclarations.set(methodName, []);
                let implementationsOfProcedure: Array<string[]> = procedureDeclarations.get(methodName) as Array<string[]>;
                let parameterTypesOfMethod: string[] = TestMethodUtils.getParameterTypesOfMethod(methodTreeNodes[i], document);
                implementationsOfProcedure.push(parameterTypesOfMethod);
                procedureDeclarations.set(methodName, implementationsOfProcedure);
            }
        }
        return procedureDeclarations;
    }

    public static async isProcedureAlreadyDeclared(document: TextDocument, procedureNameToSearch: string, parameterTypesToSearch: string[]): Promise<boolean> {
        let procedureDeclarations: Map<string, Array<string[]>> = await this.getProcedureDeclarations(document);
        let procedureNameExisting: string | undefined = Array.from(procedureDeclarations.keys()).find(procedureName => procedureName.toLowerCase() == procedureNameToSearch.toLowerCase());
        if (!procedureNameExisting)
            return false;
        else {
            let implementations: Array<string[]> = procedureDeclarations.get(procedureNameExisting) as Array<string[]>;
            let existsWithSameTypes: boolean = implementations.some(parameterTypes => {
                if (parameterTypes.length != parameterTypesToSearch.length)
                    return false;
                else {
                    for (let i = 0; i < parameterTypes.length; i++) {
                        if (parameterTypes[i].toLowerCase().trim() != parameterTypesToSearch[i].toLowerCase().trim())
                            return false;
                    }
                }
                return true;
            });
            return existsWithSameTypes;
        }
    }
    public static async isProcedureAlreadyDeclaredRegardlesOfParametersGenerally(document: TextDocument, procedureNameToSearch: string): Promise<boolean> {
        let procedureDeclarations: Map<string, Array<string[]>> = await this.getProcedureDeclarations(document);
        let procedureNameExisting: boolean = Array.from(procedureDeclarations.keys()).some(procedureName => procedureName.toLowerCase() == procedureNameToSearch.toLowerCase());
        return procedureNameExisting;
    }
    static async getGlobalVariableDeclaration(document: TextDocument, variableName: string, type: string): Promise<ALFullSyntaxTreeNode | undefined> {
        let syntaxTree: SyntaxTree = await SyntaxTree.getInstance(document);
        let objectTreeNode: ALFullSyntaxTreeNode | undefined = SyntaxTreeExt.getFirstObjectTreeNodeInDocument(syntaxTree);
        if (objectTreeNode) {
            let globalVarSection: ALFullSyntaxTreeNode | undefined = ALFullSyntaxTreeNodeExt.getFirstChildNodeOfKind(objectTreeNode, FullSyntaxTreeNodeKind.getGlobalVarSection(), false)
            if (globalVarSection) {
                let variables: ALFullSyntaxTreeNode[] = []
                ALFullSyntaxTreeNodeExt.collectChildNodesOfKindArr(globalVarSection, [FullSyntaxTreeNodeKind.getVariableDeclaration(), FullSyntaxTreeNodeKind.getVariableListDeclaration()], false, variables)
                let variablesOfSearchedType: ALFullSyntaxTreeNode[] = variables.filter(variable => document.getText(TextRangeExt.createVSCodeRange(variable.fullSpan)).toLowerCase().includes(': ' + type))
                let identifiers: ALFullSyntaxTreeNode[] = []
                for (const variableOfSearchedType of variablesOfSearchedType) {
                    ALFullSyntaxTreeNodeExt.collectChildNodes(variableOfSearchedType, FullSyntaxTreeNodeKind.getIdentifierName(), true, identifiers)
                }
                let identifierOfVariableSearched: ALFullSyntaxTreeNode | undefined = identifiers.find(identifier => document.getText(RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(identifier.fullSpan))).toLowerCase() == variableName.toLowerCase())
                if (identifierOfVariableSearched) {
                    return syntaxTree.findTreeNode(TextRangeExt.createVSCodeRange(identifierOfVariableSearched.fullSpan).start, [FullSyntaxTreeNodeKind.getVariableListDeclaration(), FullSyntaxTreeNodeKind.getVariableListDeclaration()])
                }
                return identifierOfVariableSearched;
            }
        }
        return undefined;
    }
    static async addGlobalVariable(document: TextDocument, variableName: string, variableTypeToAdd: string): Promise<{ positionToInsert: Position; textToInsert: string; }> {
        let syntaxTree: SyntaxTree = await SyntaxTree.getInstance(document);
        let objectTreeNode: ALFullSyntaxTreeNode | undefined = SyntaxTreeExt.getFirstObjectTreeNodeInDocument(syntaxTree);
        if (!objectTreeNode)
            throw new Error('Unable to find an object.');
        let globalVarSection: ALFullSyntaxTreeNode | undefined = ALFullSyntaxTreeNodeExt.getFirstChildNodeOfKind(objectTreeNode, FullSyntaxTreeNodeKind.getGlobalVarSection(), false)
        if (globalVarSection) {
            let variables: ALFullSyntaxTreeNode[] = []
            ALFullSyntaxTreeNodeExt.collectChildNodesOfKindArr(globalVarSection, [FullSyntaxTreeNodeKind.getVariableDeclaration(), FullSyntaxTreeNodeKind.getVariableListDeclaration()], false, variables)
            let variablesOfSearchedType: ALFullSyntaxTreeNode[] = variables.filter(variable => document.getText(TextRangeExt.createVSCodeRange(variable.fullSpan)).toLowerCase().includes(': ' + variableTypeToAdd))
            let addAfterVariable: ALFullSyntaxTreeNode | undefined;
            if (variablesOfSearchedType.length > 0)
                addAfterVariable = variablesOfSearchedType[variablesOfSearchedType.length - 1];
            else {
                let typeHierarchy: string[] = ['record', 'report', 'codeunit', 'xmlport', 'page', 'query', 'notification', 'bigtext', 'dateformula', 'recordid', 'recordref', 'fieldref', 'filterpagebuilder']
                if (typeHierarchy.includes(variableTypeToAdd.toLowerCase())) {
                    for (const type of typeHierarchy) {
                        let variablesOfHierarchy: ALFullSyntaxTreeNode[] = variables.filter(variable => document.getText(TextRangeExt.createVSCodeRange(variable.fullSpan)).toLowerCase().includes(': ' + type))
                        if (variablesOfHierarchy.length > 0)
                            addAfterVariable = variablesOfHierarchy[variablesOfHierarchy.length - 1];
                        if (type == variableTypeToAdd.toLowerCase())
                            break;
                    }
                } else
                    addAfterVariable = variables[variables.length - 1];
            }
            let positionToInsert: Position;
            if (addAfterVariable)
                positionToInsert = RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(addAfterVariable.fullSpan)).end;
            else
                positionToInsert = RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(globalVarSection.fullSpan)).start.translate(undefined, 'var'.length)
            let textToInsert: string = '\r\n        ' + variableName + ': ' + variableTypeToAdd + ';';
            return { positionToInsert: positionToInsert, textToInsert: textToInsert };
        } else {
            let propertyList: ALFullSyntaxTreeNode | undefined = ALFullSyntaxTreeNodeExt.getFirstChildNodeOfKind(objectTreeNode, FullSyntaxTreeNodeKind.getPropertyList(), false);
            if (!propertyList)
                throw new Error('Expected to find a PropertyList.')
            let positionToInsert: Position = RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(propertyList.fullSpan)).end;
            let textToInsert: string = '\r\n\r\n    var';
            textToInsert += '\r\n        ' + variableName + ': ' + variableTypeToAdd + ';';
            return { positionToInsert: positionToInsert, textToInsert: textToInsert };
        }
    }
    public static includesFeature(fileContent: string, feature: string): boolean {
        let regexFeature: RegExp = new RegExp('\\[Feature\\]\\s*' + feature + '\\s*\\\\r\\\\n', 'i');
        return regexFeature.test(fileContent);
    }
    public static getDefaultTestCodeunit(elementValue: string): string[] {
        let codeunitName: string = elementValue.includes(' ') ? '"' + elementValue + '"' : elementValue;
        return [
            'codeunit 0 ' + codeunitName,
            '{',
            '    Subtype = Test;',
            '',
            '    trigger OnRun()',
            '    begin',
            '        // [Feature] ' + elementValue,
            '    end;',
            '',
            '    [Test]',
            '    local procedure NewTestProcedure()',
            '    // [Feature] ' + elementValue,
            '    begin',
            '        // [Scenario #0001] New Test Procedure',
            '    end;',
            '}'
        ];
    }
    public static getDefaultTestMethod(feature: string, id: number | undefined, scenario: string, uri: Uri): string[] {
        let scenarioNameTitleCase: string = TestMethodUtils.getProcedureName(TypeChanged.ScenarioName, scenario);
        let idAsString: string = '';
        if (id)
            idAsString = ' #' + (id + '').padStart(4, '0');
        let procedure: string[] = [
            '    [Test]',
            '    procedure ' + scenarioNameTitleCase + '()',
            '    // [Feature] ' + feature,
            '    begin',
            '        // [Scenario' + idAsString + '] ' + scenario,
            '    end;'
        ];
        if (Config.getAddInitializeFunction(uri))
            procedure.splice(5, 0, '        Initialize();');
        return procedure;
    }
    static getInitializeMethod(nameOfCodeunit: string): string[] {
        return [
            '    local procedure Initialize()',
            '    var',
            '        LibraryTestInitialize: Codeunit "Library - Test Initialize";',
            '    begin',
            '        LibraryTestInitialize.OnTestInitialize(Codeunit::' + nameOfCodeunit + ');',

            '        if IsInitialized then',
            '            exit;',

            '        LibraryTestInitialize.OnBeforeTestSuiteInitialize(Codeunit::' + nameOfCodeunit + ');',

            '        IsInitialized:= true;',
            '        Commit();',

            '        LibraryTestInitialize.OnAfterTestSuiteInitialize(Codeunit::' + nameOfCodeunit + ');',
            '    end;'
        ]
    }
    static async getPositionToInsertForGlobalProcedure(document: TextDocument): Promise<Position> {
        let syntaxTree: SyntaxTree = await SyntaxTree.getInstance(document);
        let methodDeclarations: ALFullSyntaxTreeNode[] = syntaxTree.collectNodesOfKindXInWholeDocument(FullSyntaxTreeNodeKind.getMethodDeclaration())
        if (methodDeclarations.length > 0) {
            let localMethods: ALFullSyntaxTreeNode[] = methodDeclarations.filter(methodDeclaration => document.getText(RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(methodDeclaration.fullSpan))).toLowerCase().startsWith('local procedure'));
            if (localMethods.length > 0) {
                return RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(localMethods[localMethods.length - 1].fullSpan)).end;
            }
            let publicMethods: ALFullSyntaxTreeNode[] = methodDeclarations.filter(methodDeclaration => document.getText(RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(methodDeclaration.fullSpan))).toLowerCase().startsWith('procedure'));
            if (publicMethods.length > 0) {
                return RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(publicMethods[publicMethods.length - 1].fullSpan)).end;
            }
            return RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(methodDeclarations[methodDeclarations.length - 1].fullSpan)).end;
        } else {
            let triggerDeclarations: ALFullSyntaxTreeNode[] = syntaxTree.collectNodesOfKindXInWholeDocument(FullSyntaxTreeNodeKind.getTriggerDeclaration())
            if (triggerDeclarations.length > 0) {
                return RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(triggerDeclarations[triggerDeclarations.length - 1].fullSpan)).end;
            } else {
                let objectTreeNode: ALFullSyntaxTreeNode | undefined = SyntaxTreeExt.getFirstObjectTreeNodeInDocument(syntaxTree)
                if (!objectTreeNode)
                    throw new Error('Expected to find an AL object inside this file.');
                else {
                    if (objectTreeNode.childNodes) {
                        let lastChildNode: ALFullSyntaxTreeNode = objectTreeNode.childNodes[objectTreeNode.childNodes.length - 1];
                        return RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(lastChildNode.fullSpan)).end;
                    } else {
                        let objectRange: Range = RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(objectTreeNode.fullSpan));
                        let range: Range | undefined = RangeUtils.getRangeOfTextInsideRange(document, objectRange, /\{/);
                        if (range) {
                            return range.start.translate(undefined, 1);
                        }
                    }
                }
            }
        }
        throw new Error('Unable to find position to insert procedure.');
    }
}