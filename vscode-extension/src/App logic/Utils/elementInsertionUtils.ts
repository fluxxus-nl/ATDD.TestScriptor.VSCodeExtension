import * as CRSApi from 'crs-al-language-extension-api';
import { readFileSync, renameSync, writeFileSync } from "fs-extra";
import { Extension, extensions, Position, Range, TextDocument, Uri, workspace, WorkspaceEdit } from "vscode";
import { MessageUpdate, TypeChanged } from "../../typings/types";
import { ALFullSyntaxTreeNodeExt } from "../AL Code Outline Ext/alFullSyntaxTreeNodeExt";
import { FullSyntaxTreeNodeKind } from "../AL Code Outline Ext/fullSyntaxTreeNodeKind";
import { TextRangeExt } from "../AL Code Outline Ext/textRangeExt";
import { ALFullSyntaxTreeNode } from "../AL Code Outline/alFullSyntaxTreeNode";
import { SyntaxTree } from "../AL Code Outline/syntaxTree";
import { Config } from "./config";
import { ElementUtils } from "./elementUtils";
import { RangeUtils } from "./rangeUtils";
import { StringUtils } from "./stringUtils";
import { TestCodeunitUtils } from "./testCodeunitUtils";
import { TestMethodUtils } from "./testMethodUtils";
import { WorkspaceUtils } from "./workspaceUtils";

export class ElementInsertionUtils {
    public static async addSomethingNewToCode(msg: MessageUpdate): Promise<boolean> {
        if (msg.Type == TypeChanged.Feature) {
            return await ElementInsertionUtils.addNewFeatureToCode(msg);
        } else if (msg.Type == TypeChanged.ScenarioName) {
            return await ElementInsertionUtils.addNewScenarioToCode(msg);
        }
        else {
            return await ElementInsertionUtils.addNewElementToCode(msg);
        }
    }

    private static async addNewFeatureToCode(msg: MessageUpdate): Promise<boolean> {
        let srcFolder: string | undefined = Config.getTestSrcFolder();
        if (!srcFolder)
            throw new Error('Please specify the source folder for your tests in the settings.');
        let objectName: string = new StringUtils(msg.NewValue).titleCase().removeSpecialChars().value();
        let fileName: string = objectName + '.al';
        msg.FsPath = WorkspaceUtils.getFullFsPathOfRelativePath(srcFolder, fileName);
        writeFileSync(msg.FsPath, (await TestCodeunitUtils.getDefaultTestCodeunit(msg.NewValue, Uri.file(msg.FsPath))).join('\r\n'), { encoding: 'utf8' });
        let id: string | undefined = await TestCodeunitUtils.getNextCodeunitId(msg.FsPath);
        if (id) {
            //TODO: Can be removed if API of Andrzej exists
            let fileContent = readFileSync(msg.FsPath, { encoding: 'utf8' });
            fileContent = 'codeunit ' + id + fileContent.substr('codeunit 0'.length)
            writeFileSync(msg.FsPath, fileContent, { encoding: 'utf8' });
        }
        let waldosExtension: Extension<any> | undefined = extensions.getExtension('waldo.crs-al-language-extension');
        if (waldosExtension && waldosExtension.isActive) {
            let waldosApi: CRSApi.ICRSExtensionPublicApi = waldosExtension.exports;
            let newFilename: string = waldosApi.ObjectNamesApi.GetObjectFileName('codeunit', id ? id : '', objectName)
            let newFileFullname: string = WorkspaceUtils.getFullFsPathOfRelativePath(srcFolder, newFilename);
            renameSync(msg.FsPath, newFileFullname)
            msg.FsPath = newFileFullname
        }

        return true;
    }

    static async addNewElementToCode(msg: MessageUpdate): Promise<boolean> {
        if (msg.FsPath == '' && msg.Feature !== '' && msg.Project !== '')
            msg.FsPath = await ElementUtils.getFSPathOfFeature(msg.Project, msg.Feature);
        let document: TextDocument = await workspace.openTextDocument(msg.FsPath);
        let scenarioRange: Range | undefined = ElementUtils.getRangeOfScenario(document, msg.Scenario);
        if (!scenarioRange)
            return false;

        let result: { addEmptyLine: boolean, endPositionOfPreviousLine: Position | undefined } = await ElementInsertionUtils.findPositionToInsertElement(document, scenarioRange, msg.Type);
        if (!result.endPositionOfPreviousLine)
            return false;

        let edit = new WorkspaceEdit();
        // if (result.addEmptyLine)
        //     edit.insert(document.uri, result.endPositionOfPreviousLine, '\r\n')

        ElementInsertionUtils.addElement(edit, document, result.endPositionOfPreviousLine, msg.Type, msg.NewValue);
        let procedureName: string = TestMethodUtils.getProcedureName(msg.Type, msg.NewValue);
        ElementInsertionUtils.addProcedureCall(edit, document, result.endPositionOfPreviousLine, procedureName);
        // let currentLineText: string = document.lineAt(positionToInsert.line + 1).text.trim();
        // if (currentLineText != '' && currentLineText != 'end;')
        //     textToAdd += '\r\n';
        await TestCodeunitUtils.addProcedure(edit, document, procedureName);

        let successful: boolean = await workspace.applyEdit(edit);
        await document.save();
        return successful;
    }

    private static async addNewScenarioToCode(msg: MessageUpdate): Promise<boolean> {
        let fsPath: string = await ElementUtils.getFSPathOfFeature(msg.Project, msg.Feature);
        let document: TextDocument = await workspace.openTextDocument(fsPath);

        let positionToInsert: Position = await ElementInsertionUtils.getPositionToInsertForScenario(document);
        let edit: WorkspaceEdit = new WorkspaceEdit();
        
        if (Config.getAddInitializeFunction(document.uri)) {
            await ElementInsertionUtils.addInitializeProcedureToDocument(document, positionToInsert, edit);
        }
        edit.insert(document.uri, positionToInsert, '\r\n\r\n' + TestCodeunitUtils.getDefaultTestMethod(msg.Feature, msg.Id, msg.NewValue, document.uri).join('\r\n'));
        msg.MethodName = TestMethodUtils.getProcedureName(TypeChanged.ScenarioName, msg.NewValue);
        msg.FsPath = fsPath;
        let success = await workspace.applyEdit(edit);
        success = success && await document.save();
        return success;
    }

    private static async addInitializeProcedureToDocument(document: TextDocument, positionInsideDocument: Position, edit: WorkspaceEdit) {
        let addInitializeFunction: boolean = !await TestCodeunitUtils.isProcedureAlreadyDeclaredRegardlesOfParametersGenerally(document, 'Initialize');
        if (addInitializeFunction) {
            let codeunitName: string = await TestCodeunitUtils.getObjectName(document, positionInsideDocument);
            let initializeProcAsTextArr: string[] = TestCodeunitUtils.getInitializeMethod(codeunitName);
            let positionToInsertForInitialize: Position = await TestCodeunitUtils.getPositionToInsertForGlobalProcedure(document);
            edit.insert(document.uri, positionToInsertForInitialize, '\r\n\r\n' + initializeProcAsTextArr.join('\r\n'));
            let variable: ALFullSyntaxTreeNode | undefined = await TestCodeunitUtils.getGlobalVariableDeclaration(document, 'IsInitialized', 'Boolean');
            if (!variable) {
                let editValues: { positionToInsert: Position; textToInsert: string; } = await TestCodeunitUtils.addGlobalVariable(document, 'IsInitialized', 'Boolean');
                edit.insert(document.uri, editValues.positionToInsert, editValues.textToInsert);
            }
        }
    }

    private static async getPositionToInsertForScenario(document: TextDocument): Promise<Position> {
        let syntaxTree: SyntaxTree = await SyntaxTree.getInstance(document);
        let methodTreeNodes: ALFullSyntaxTreeNode[] = syntaxTree.collectNodesOfKindXInWholeDocument(FullSyntaxTreeNodeKind.getMethodDeclaration());
        let testMethodTreeNodes = methodTreeNodes.filter(methodTreeNode => {
            let memberAttributes: ALFullSyntaxTreeNode[] = [];
            ALFullSyntaxTreeNodeExt.collectChildNodes(methodTreeNode, FullSyntaxTreeNodeKind.getMemberAttribute(), false, memberAttributes);
            let containsTestMemberAttribute: boolean = memberAttributes.some(memberAttribute => document.getText(TextRangeExt.createVSCodeRange(memberAttribute.fullSpan)).toLowerCase().includes('[test]'));
            return containsTestMemberAttribute;
        });
        testMethodTreeNodes = testMethodTreeNodes.sort((a, b) => a.fullSpan && a.fullSpan.end && b.fullSpan && b.fullSpan.end ? a.fullSpan?.end?.line - b.fullSpan?.end?.line : 0);
        let lastTestMethodTreeNode: ALFullSyntaxTreeNode = testMethodTreeNodes[testMethodTreeNodes.length - 1];
        let positionToInsert: Position = RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(lastTestMethodTreeNode.fullSpan)).end;
        return positionToInsert;
    }
    public static async findPositionToInsertElement(document: TextDocument, scenarioRange: Range, type: TypeChanged): Promise<{ addEmptyLine: boolean; endPositionOfPreviousLine: Position | undefined }> {
        let syntaxTree: SyntaxTree = await SyntaxTree.getInstance(document);

        let typeRanges: Map<TypeChanged, Range[]> | undefined = await ElementUtils.getRangesOfElementsOfProcedure(scenarioRange.start, document);
        if (!typeRanges)
            throw new Error('Scenario comment is expected to be inside a procedure.');

        let typesToSearch: TypeChanged[] = [TypeChanged.Given, TypeChanged.When, TypeChanged.Then];
        let startIndex = type == TypeChanged.Given ? 0 : type == TypeChanged.When ? 1 : 2;
        let addEmptyLine: boolean = false;
        for (; startIndex >= 0; startIndex--) {
            let rangesOfType: Range[] | undefined = typeRanges.get(typesToSearch[startIndex]);
            if (rangesOfType && rangesOfType.length > 0) {
                let lastRangeOfType: Range = rangesOfType[rangesOfType.length - 1]
                let statementTreeNode: ALFullSyntaxTreeNode | undefined = syntaxTree.findTreeNode(lastRangeOfType.end, FullSyntaxTreeNodeKind.getAllStatementKinds())
                if (statementTreeNode)
                    return { addEmptyLine: addEmptyLine, endPositionOfPreviousLine: RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(statementTreeNode.fullSpan)).end };
                else
                    return { addEmptyLine: addEmptyLine, endPositionOfPreviousLine: RangeUtils.trimRange(document, lastRangeOfType).end };
            }
            addEmptyLine = true;
        }
        let methodTreeNode: ALFullSyntaxTreeNode | undefined = syntaxTree.findTreeNode(scenarioRange.end, [FullSyntaxTreeNodeKind.getMethodDeclaration()])
        if (methodTreeNode) {
            let blockTreeNode: ALFullSyntaxTreeNode | undefined = ALFullSyntaxTreeNodeExt.getFirstChildNodeOfKind(methodTreeNode, FullSyntaxTreeNodeKind.getBlock(), false);
            if (blockTreeNode) {
                let firstExpressionStatement: ALFullSyntaxTreeNode | undefined = ALFullSyntaxTreeNodeExt.getFirstChildNodeOfKind(blockTreeNode, FullSyntaxTreeNodeKind.getExpressionStatement(), false)
                if (firstExpressionStatement) {
                    let firstInvocationStatement: ALFullSyntaxTreeNode | undefined = ALFullSyntaxTreeNodeExt.getFirstChildNodeOfKind(firstExpressionStatement, FullSyntaxTreeNodeKind.getInvocationExpression(), false)
                    if (firstInvocationStatement) {
                        if (ALFullSyntaxTreeNodeExt.findIdentifierAndGetValueOfTreeNode(document, firstInvocationStatement).toLowerCase() == 'initialize')
                            return { addEmptyLine: true, endPositionOfPreviousLine: RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(firstExpressionStatement.fullSpan)).end };
                    }
                }
            }
        }
        return { addEmptyLine: true, endPositionOfPreviousLine: scenarioRange.end };
    }

    public static addElement(edit: WorkspaceEdit, document: TextDocument, positionToInsert: Position, type: TypeChanged, elementValue: string) {
        let textToAdd: string = '\r\n';
        textToAdd += '        ' + ElementUtils.getElementComment(type, elementValue);
        edit.insert(document.uri, positionToInsert, textToAdd);
    }
    public static addProcedureCall(edit: WorkspaceEdit, document: TextDocument, positionToInsert: Position, procedureName: string) {
        let textToAdd: string = '\r\n';
        textToAdd += '        ' + procedureName + '();';
        edit.insert(document.uri, positionToInsert, textToAdd);
    }
}