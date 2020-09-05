import { TypeChanged } from "../../typings/types";
import { workspace, window, WorkspaceConfiguration, TextDocument, Range, Position } from "vscode";
import { ALFullSyntaxTreeNode } from "../AL Code Outline/alFullSyntaxTreeNode";
import { ALFullSyntaxTreeNodeExt } from "../AL Code Outline Ext/alFullSyntaxTreeNodeExt";
import { FullSyntaxTreeNodeKind } from "../AL Code Outline Ext/fullSyntaxTreeNodeKind";
import { TextRangeExt } from "../AL Code Outline Ext/textRangeExt";
import { RangeUtils } from "./rangeUtils";
import { SyntaxTree } from "../AL Code Outline/syntaxTree";

export class TestMethodUtils {
    public static getProcedureName(type: TypeChanged, name: string): string {
        let nameTitleCase: string = name.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
        nameTitleCase = nameTitleCase.replace(/\s/g, '');

        let prefix: string = '';
        let config: WorkspaceConfiguration = workspace.getConfiguration('atddTestScriptor', window.activeTextEditor?.document.uri);
        let prefixGiven: string | undefined = config.get('prefixGiven');
        let prefixWhen: string | undefined = config.get('prefixWhen');
        let prefixThen: string | undefined = config.get('prefixThen');
        switch (type) {
            case TypeChanged.Given:
                if (prefixGiven)
                    prefix = prefixGiven;
                break;
            case TypeChanged.When:
                if (prefixWhen)
                    prefix = prefixWhen;
                break;
            case TypeChanged.Then:
                if (prefixThen)
                    prefix = prefixThen;
                break;
        }
        return prefix + nameTitleCase;
    }
    public static getProcedureHeaderOfMethod(oldMethod: ALFullSyntaxTreeNode, document: TextDocument) {
        let identifierOfMethod: ALFullSyntaxTreeNode = <ALFullSyntaxTreeNode>ALFullSyntaxTreeNodeExt.getFirstChildNodeOfKind(oldMethod, FullSyntaxTreeNodeKind.getIdentifierName(), false);
        let fullRangeOfIdentifier: Range = TextRangeExt.createVSCodeRange(identifierOfMethod.fullSpan);
        let positionStartCopying: Position = fullRangeOfIdentifier.start.with({ character: 0 });
        let positionEndCopying: Position;
        let returnValueTreeNode: ALFullSyntaxTreeNode | undefined = ALFullSyntaxTreeNodeExt.getFirstChildNodeOfKind(oldMethod, FullSyntaxTreeNodeKind.getReturnValue(), false);
        if (returnValueTreeNode)
            positionEndCopying = RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(returnValueTreeNode.fullSpan)).end;
        else {
            let parameterListTreeNode: ALFullSyntaxTreeNode = <ALFullSyntaxTreeNode>ALFullSyntaxTreeNodeExt.getFirstChildNodeOfKind(oldMethod, FullSyntaxTreeNodeKind.getParameterList(), false);
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
}