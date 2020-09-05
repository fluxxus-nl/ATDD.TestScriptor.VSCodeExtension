import { Range, RelativePattern, TextDocument, Uri, workspace, WorkspaceEdit, WorkspaceFolder } from 'vscode';
import { ALFullSyntaxTreeNodeExt } from '../AL Code Outline Ext/alFullSyntaxTreeNodeExt';
import { FullSyntaxTreeNodeKind } from '../AL Code Outline Ext/fullSyntaxTreeNodeKind';
import { SyntaxTreeExt } from '../AL Code Outline Ext/syntaxTreeExt';
import { TextRangeExt } from '../AL Code Outline Ext/textRangeExt';
import { ALFullSyntaxTreeNode } from '../AL Code Outline/alFullSyntaxTreeNode';
import { SyntaxTree } from '../AL Code Outline/syntaxTree';
import { RangeUtils } from './rangeUtils';
import { TestMethodUtils } from './testMethodUtils';

export class TestCodeunitUtils {
    public static async getTestUrisOfWorkspaces(): Promise<Uri[]> {
        let uris: Uri[] = await workspace.findFiles('**/*.al');
        let testUris: Uri[] = [];
        for (let i = 0; i < uris.length; i++) {
            let document: TextDocument = await workspace.openTextDocument(uris[i].fsPath);
            let fileContent: string = document.getText();
            // let fileContent: string = fs.readFileSync(uris[i].fsPath, { encoding: 'utf8', flag: 'r' });
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
    static getObjectName(syntaxTree: SyntaxTree, testMethod: ALFullSyntaxTreeNode, document: TextDocument): string {
        let objectTreeNode: ALFullSyntaxTreeNode = SyntaxTreeExt.getObjectTreeNodeUnsafe(syntaxTree, TextRangeExt.createVSCodeRange(testMethod.fullSpan).start);
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
            if (workspace.getConfiguration('atddTestScriptor', document.uri).get<boolean>('addException', false))
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
            '        // [SCENARIO #0001] New Test Procedure',
            '    end;',
            '}'
        ];
    }
}