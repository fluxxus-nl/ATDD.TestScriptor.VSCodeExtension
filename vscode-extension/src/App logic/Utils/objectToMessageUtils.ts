import { TextDocument, Range } from 'vscode';
import { ALTestRunnerResult, Message, MessageState } from '../../typings/types';
import { ALFullSyntaxTreeNodeExt } from '../AL Code Outline Ext/alFullSyntaxTreeNodeExt';
import { FullSyntaxTreeNodeKind } from '../AL Code Outline Ext/fullSyntaxTreeNodeKind';
import { TextRangeExt } from '../AL Code Outline Ext/textRangeExt';
import { ALFullSyntaxTreeNode } from '../AL Code Outline/alFullSyntaxTreeNode';
import { MessageDetailsImpl } from '../Entities/messageDetailsImpl';
import { MessageImpl } from '../Entities/messageImpl';
import { RangeUtils } from './rangeUtils';
import { TestCodeunitUtils } from './testCodeunitUtils';

export class ObjectToMessageUtils {
    public static async testMethodToMessage(document: TextDocument, testMethod: ALFullSyntaxTreeNode, featureCodeunitLevel?: string | undefined): Promise<Message> {
        let message: MessageImpl = new MessageImpl();
        message.Codeunit = await TestCodeunitUtils.getObjectName(document, TextRangeExt.createVSCodeRange(testMethod.fullSpan).start);
        ObjectToMessageUtils.getMessageDetails(document, testMethod, message, featureCodeunitLevel);
        message.MethodName = ALFullSyntaxTreeNodeExt.findIdentifierAndGetValueOfTreeNode(document, testMethod);
        message.Project = await TestCodeunitUtils.getAppNameOfDocument(document);
        message.FsPath = document.uri.fsPath;
        message.IsDirty = false;
        message.State = MessageState.Unchanged
        message.TestRunnerResult = ALTestRunnerResult.NoInfo;
        return message;
    }
    static getUniqueFeature(document: TextDocument, testMethod: ALFullSyntaxTreeNode): string | undefined {
        if (!testMethod.parentNode)
            return undefined
        let objectTreeNode: ALFullSyntaxTreeNode = testMethod.parentNode
        let firstMethodTreeNode: ALFullSyntaxTreeNode = (objectTreeNode.childNodes as ALFullSyntaxTreeNode[]).find(childNode => childNode.kind == FullSyntaxTreeNodeKind.getMethodDeclaration()) as ALFullSyntaxTreeNode
        let objectRange: Range = TextRangeExt.createVSCodeRange(objectTreeNode.fullSpan)
        let firstMethodRange: Range = TextRangeExt.createVSCodeRange(firstMethodTreeNode.fullSpan)
        let rangeUntilFirstMethodNode: Range = new Range(objectRange.start, firstMethodRange.start)
        let textUntilFirstMethodNode: string = document.getText(rangeUntilFirstMethodNode)
        let regexFeature: RegExp = /\[Feature\]\s*(?<content>.+)\s*/;
        let matchArr: RegExpMatchArray | null = textUntilFirstMethodNode.match(new RegExp(regexFeature, 'ig'));
        if (matchArr && matchArr.length == 1) {
            let matchArr: RegExpMatchArray | null = textUntilFirstMethodNode.match(new RegExp(regexFeature, 'i'));
            if (matchArr && matchArr.groups) {
                return matchArr.groups['content'];
            }
        }
        return undefined
    }
    public static getMessageDetails(document: TextDocument, testMethod: ALFullSyntaxTreeNode, message: MessageImpl, featureCodeunitLevel: string | undefined) {
        message.Details = new MessageDetailsImpl();
        let methodText: string = document.getText(RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(testMethod.fullSpan)));
        let regexFeature: RegExp = /\[Feature\]\s*(?<content>.+)\s*/i;
        let regexScenario: RegExp = /\[Scenario\s*(?:#?(?<id>\d+))?\]\s*(?<content>.+)\s*/i;
        let givenPattern: RegExp = /\[Given\]\s*(?<content>.+)\s*/i;
        let regexWhen: RegExp = /\[When\]\s*(?<content>.+)\s*/i;
        let thenPattern: RegExp = /\[Then\]\s*(?<content>.+)\s*/i;

        let matchArr: RegExpMatchArray | null = methodText.match(regexFeature);
        if (matchArr && matchArr.groups)
            message.Feature = matchArr.groups['content'];
        else if (featureCodeunitLevel)
            message.Feature = featureCodeunitLevel

        matchArr = methodText.match(regexScenario);
        if (matchArr && matchArr.groups) {
            message.Scenario = matchArr.groups['content'];
            if (matchArr.length == 3 && matchArr.groups['id']) //0, id and content
                message.Id = Number(matchArr.groups['id']);
        }

        //Given
        matchArr = methodText.match(new RegExp(givenPattern, 'ig'));
        if (matchArr) {
            matchArr.forEach(match => {
                let matchArr2: RegExpMatchArray | null = match.match(givenPattern);
                if (matchArr2 && matchArr2.groups)
                    message.Details.given.push(matchArr2.groups['content'])
            });
        }
        //When
        matchArr = methodText.match(regexWhen);
        if (matchArr && matchArr.groups)
            message.Details.when.push(matchArr.groups['content']);
        else
            message.Details.when.push('');
        //Then
        matchArr = methodText.match(new RegExp(thenPattern, 'ig'));
        if (matchArr) {
            matchArr.forEach(match => {
                let matchArr2: RegExpMatchArray | null = match.match(thenPattern);
                if (matchArr2 && matchArr2.groups)
                    message.Details.then.push(matchArr2.groups['content'])
            });
        }
    }
}