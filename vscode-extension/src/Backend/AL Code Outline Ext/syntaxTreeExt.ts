import * as vscode from 'vscode';
import { SyntaxTree } from "../AL Code Outline/syntaxTree";
import { ALFullSyntaxTreeNode } from '../AL Code Outline/alFullSyntaxTreeNode';
import { FullSyntaxTreeNodeKind } from './fullSyntaxTreeNodeKind';

export class SyntaxTreeExt {
    private constructor() {

    }

    static getObjectTreeNode(syntaxTree: SyntaxTree, position: vscode.Position): ALFullSyntaxTreeNode | undefined {
        let kinds: string[] = [
            FullSyntaxTreeNodeKind.getTableObject(),
            FullSyntaxTreeNodeKind.getTableExtensionObject(),
            FullSyntaxTreeNodeKind.getPageObject(),
            FullSyntaxTreeNodeKind.getPageExtensionObject(),
            FullSyntaxTreeNodeKind.getCodeunitObject(),
            FullSyntaxTreeNodeKind.getReportObject(),
            FullSyntaxTreeNodeKind.getXmlPortObject(),
            FullSyntaxTreeNodeKind.getQueryObject(),
            FullSyntaxTreeNodeKind.getEnumType(),
            FullSyntaxTreeNodeKind.getEnumExtensionType(),
            FullSyntaxTreeNodeKind.getInterface()
        ];
        let objectTreeNode: ALFullSyntaxTreeNode | undefined = syntaxTree.findTreeNode(position, kinds);
        return objectTreeNode;
    }
    static getObjectTreeNodeUnsafe(syntaxTree: SyntaxTree, position: vscode.Position): ALFullSyntaxTreeNode {
        let objectTreeNode: ALFullSyntaxTreeNode | undefined = this.getObjectTreeNode(syntaxTree, position);
        if (!objectTreeNode) {
            throw new Error('No Object Tree Node found.');
        }
        return objectTreeNode;
    }

    static getMethodOrTriggerTreeNodeOfCurrentPosition(syntaxTree: SyntaxTree, position: vscode.Position): ALFullSyntaxTreeNode | undefined {
        let methodOrTriggerTreeNode: ALFullSyntaxTreeNode | undefined = syntaxTree.findTreeNode(position, [FullSyntaxTreeNodeKind.getMethodDeclaration(), FullSyntaxTreeNodeKind.getTriggerDeclaration()]);
        return methodOrTriggerTreeNode;
    }
    static async getMethodTreeNodeByCallPosition(document: vscode.TextDocument, positionOfProcedureCall: vscode.Position): Promise<ALFullSyntaxTreeNode | undefined> {
        let syntaxTree: SyntaxTree = await SyntaxTree.getInstance(document);
        let locations: vscode.Location[] | undefined = await vscode.commands.executeCommand('vscode.executeDefinitionProvider', document.uri, positionOfProcedureCall);
        if (locations) {
            let methodTreeNode: ALFullSyntaxTreeNode | undefined = syntaxTree.findTreeNode(locations[0].range.start, [FullSyntaxTreeNodeKind.getMethodDeclaration()]);
            return methodTreeNode;
        }
        return undefined;
    }
}