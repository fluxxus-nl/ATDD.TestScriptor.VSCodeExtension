import { commands, Location, Position, Range, TextDocument, Uri, window, WorkspaceEdit } from "vscode";
import { TypeChanged } from "../../typings/types";
import { ALFullSyntaxTreeNodeExt } from "../AL Code Outline Ext/alFullSyntaxTreeNodeExt";
import { FullSyntaxTreeNodeKind } from "../AL Code Outline Ext/fullSyntaxTreeNodeKind";
import { TextRangeExt } from "../AL Code Outline Ext/textRangeExt";
import { ALFullSyntaxTreeNode } from "../AL Code Outline/alFullSyntaxTreeNode";
import { SyntaxTree } from "../AL Code Outline/syntaxTree";
import { Config } from "./config";
import { RangeUtils } from "./rangeUtils";
import { StringUtils } from "./stringUtils";

export class TestMethodUtils {
    public static getProcedureName(type: TypeChanged, name: string): string {
        let nameTitleCase: string = new StringUtils(name).titleCase().removeSpecialChars().value();

        let prefix: string = '';
        let uri: Uri | undefined = window.activeTextEditor?.document.uri;
        switch (type) {
            case TypeChanged.Given:
                prefix = Config.getPrefixGiven(uri);
                break;
            case TypeChanged.When:
                prefix = Config.getPrefixWhen(uri);
                break;
            case TypeChanged.Then:
                prefix = Config.getPrefixThen(uri);
                break;
            case TypeChanged.ScenarioName:
                break; //no prefix
        }
        return prefix + nameTitleCase;
    }
    public static getProcedureHeaderOfMethod(method: ALFullSyntaxTreeNode, document: TextDocument) {
        let identifierOfMethod: ALFullSyntaxTreeNode = <ALFullSyntaxTreeNode>ALFullSyntaxTreeNodeExt.getFirstChildNodeOfKind(method, FullSyntaxTreeNodeKind.getIdentifierName(), false);
        let fullRangeOfIdentifier: Range = TextRangeExt.createVSCodeRange(identifierOfMethod.fullSpan);
        let positionStartCopying: Position = fullRangeOfIdentifier.start.with({ character: 0 });
        let positionEndCopying: Position;
        let returnValueTreeNode: ALFullSyntaxTreeNode | undefined = ALFullSyntaxTreeNodeExt.getFirstChildNodeOfKind(method, FullSyntaxTreeNodeKind.getReturnValue(), false);
        if (returnValueTreeNode)
            positionEndCopying = RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(returnValueTreeNode.fullSpan)).end;
        else {
            let parameterListTreeNode: ALFullSyntaxTreeNode = <ALFullSyntaxTreeNode>ALFullSyntaxTreeNodeExt.getFirstChildNodeOfKind(method, FullSyntaxTreeNodeKind.getParameterList(), false);
            positionEndCopying = RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(parameterListTreeNode.fullSpan)).end;
        }
        let procedureHeader: string = document.getText(new Range(positionStartCopying, positionEndCopying));
        return procedureHeader;
    }
    public static getParameterTypesOfMethod(method: ALFullSyntaxTreeNode, document: TextDocument): string[] {
        let parameterListTreeNode: ALFullSyntaxTreeNode | undefined = ALFullSyntaxTreeNodeExt.getFirstChildNodeOfKind(method, FullSyntaxTreeNodeKind.getParameterList(), false);
        let parameterTypes: string[] = [];
        if (parameterListTreeNode) {
            if (parameterListTreeNode.childNodes) {
                parameterListTreeNode.childNodes.forEach(parameterTreeNode => {
                    if (parameterTreeNode.childNodes && parameterTreeNode.childNodes.length == 2) {
                        let rangeOfParameterType: Range = RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(parameterTreeNode.childNodes[1].fullSpan));
                        parameterTypes.push(document.getText(rangeOfParameterType));
                    }
                });
            }
        }
        return parameterTypes;
    }
    static async renameMethod(edit: WorkspaceEdit, oldMethodTreeNode: ALFullSyntaxTreeNode, document: TextDocument, newProcedureName: string) {
        let identifierTreeNode: ALFullSyntaxTreeNode | undefined = ALFullSyntaxTreeNodeExt.getFirstChildNodeOfKind(oldMethodTreeNode, FullSyntaxTreeNodeKind.getIdentifierName(), false);
        if (!identifierTreeNode)
            return;
        let rangeOfIdentifier: Range = RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(identifierTreeNode.fullSpan));
        let oldProcedureName: string = document.getText(rangeOfIdentifier);
        let references: Location[] | undefined = await commands.executeCommand('vscode.executeReferenceProvider', document.uri, rangeOfIdentifier.start);
        if (references) {
            references = references.sort((a, b) => a.uri.fsPath.toString().localeCompare(b.uri.fsPath.toString()));
            for (let i = 0; i < references.length; i++) {
                edit.replace(references[i].uri, references[i].range, newProcedureName);
            }
        }
        //replace old procedure name in comments of procedure
        let blockTreeNode: ALFullSyntaxTreeNode | undefined = ALFullSyntaxTreeNodeExt.getFirstChildNodeOfKind(oldMethodTreeNode, FullSyntaxTreeNodeKind.getBlock(), false);
        if (blockTreeNode) {
            let blockRange: Range = RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(blockTreeNode.fullSpan));
            let regex: RegExp = new RegExp("(.*)\\b" + oldProcedureName + "\\b");
            for (let line = blockRange.start.line; line <= blockRange.end.line; line++) {
                let lineText: string = document.lineAt(line).text;
                let matchArr: RegExpMatchArray | null = lineText.match(new RegExp(regex, 'i'));
                if (matchArr) {
                    let rangeToReplace: Range = new Range(line, matchArr[1].length, line, matchArr[1].length + oldProcedureName.length)
                    edit.replace(document.uri, rangeToReplace, newProcedureName);
                }
            }
        }
    }
    static async getHandlerFunctions(document: TextDocument, scenarioMethodTreeNode: ALFullSyntaxTreeNode): Promise<ALFullSyntaxTreeNode[]> {
        let handlerFunctionTreeNodes: ALFullSyntaxTreeNode[] = [];

        let memberAttributes: ALFullSyntaxTreeNode[] = [];
        ALFullSyntaxTreeNodeExt.collectChildNodes(scenarioMethodTreeNode, FullSyntaxTreeNodeKind.getMemberAttribute(), false, memberAttributes)
        let handlerFunctionMemberAttribute: ALFullSyntaxTreeNode | undefined = memberAttributes.find(m => document.getText(RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(m.fullSpan))).toLowerCase().includes('handlerfunctions'));
        if (handlerFunctionMemberAttribute) {
            let literalAttributeTreeNode: ALFullSyntaxTreeNode = ALFullSyntaxTreeNodeExt.getFirstChildNodeOfKind(handlerFunctionMemberAttribute, FullSyntaxTreeNodeKind.getLiteralAttributeArgument(), true) as ALFullSyntaxTreeNode;
            let range: Range = RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(literalAttributeTreeNode.fullSpan));
            range = range.with(range.start.translate(0, 1), range.end.translate(0, -1));
            let handlerFunctionNames: string = document.getText(range);
            let handlerFunctionNamesArr: string[] = handlerFunctionNames.split(',');
            let startChar = range.start.character;
            let functionNameRanges: Range[] = [];
            for (let i = 0; i < handlerFunctionNamesArr.length; i++) {
                functionNameRanges.push(new Range(range.start.line, startChar, range.end.line, startChar + handlerFunctionNamesArr[i].length));
                startChar += handlerFunctionNamesArr[i].length + 1;
            }
            for (let i = 0; i < functionNameRanges.length; i++) {
                let locations: Location[] | undefined = await commands.executeCommand('vscode.executeDefinitionProvider', document.uri, functionNameRanges[i].start);
                if (locations) {
                    let syntaxTree: SyntaxTree = await SyntaxTree.getInstance(document);
                    let methodTreeNode: ALFullSyntaxTreeNode = syntaxTree.findTreeNode(locations[0].range.start, [FullSyntaxTreeNodeKind.getMethodDeclaration()]) as ALFullSyntaxTreeNode;
                    handlerFunctionTreeNodes.push(methodTreeNode);
                }
            }
        }
        return handlerFunctionTreeNodes;
    }
    public static procedureAlreadyExistsInProcedureList(procedureToCheck: { procedureName: string; parameterTypes: string[]; }, procedureList: Array<{ procedureName: string; parameterTypes: string[]; }>): boolean {
        return procedureList.some(proc => proc.procedureName == procedureToCheck?.procedureName && proc.parameterTypes.toString() == procedureToCheck.parameterTypes.toString())
    }
}