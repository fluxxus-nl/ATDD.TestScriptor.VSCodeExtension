import { TextDocument } from 'vscode';
import { ALTestRunnerResult, Message, MessageState } from '../../typings/types';
import { ALFullSyntaxTreeNodeExt } from '../AL Code Outline Ext/alFullSyntaxTreeNodeExt';
import { TextRangeExt } from '../AL Code Outline Ext/textRangeExt';
import { ALFullSyntaxTreeNode } from '../AL Code Outline/alFullSyntaxTreeNode';
import { MessageDetailsImpl } from '../Entities/messageDetailsImpl';
import { MessageImpl } from '../Entities/messageImpl';
import { RangeUtils } from './rangeUtils';
import { TestCodeunitUtils } from './testCodeunitUtils';

export class ObjectToMessageUtils {
    public static async testMethodToMessage(document: TextDocument, testMethod: ALFullSyntaxTreeNode): Promise<Message> {
        let message: MessageImpl = new MessageImpl();
        message.Codeunit = await TestCodeunitUtils.getObjectName(document, TextRangeExt.createVSCodeRange(testMethod.fullSpan).start);
        ObjectToMessageUtils.getMessageDetails(document, testMethod, message);
        message.MethodName = ALFullSyntaxTreeNodeExt.findIdentifierAndGetValueOfTreeNode(document, testMethod);
        message.Project = await TestCodeunitUtils.getAppNameOfDocument(document);
        message.FsPath = document.uri.fsPath;
        message.IsDirty = false;
        message.State = MessageState.Unchanged
        message.TestRunnerResult = ALTestRunnerResult.NoInfo;
        return message;
    }
    public static getMessageDetails(document: TextDocument, testMethod: ALFullSyntaxTreeNode, message: MessageImpl) {
        message.Details = new MessageDetailsImpl();
        let methodText: string = document.getText(RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(testMethod.fullSpan)));
        let regexFeature: RegExp = /\[Feature\]\s*(?<content>.+)\s*/i;
        let regexScenario: RegExp = /\[Scenario\s*(?:#?(?<id>\d+))?\]\s*(?<content>.+)\s*/i;
        let givenPattern: RegExp = /\[Given\]\s*(?<content>.+)\s*/i;
        let regexWhen: RegExp = /\[When\]\s*(?<content>.+)\s*/i;
        let thenPattern: RegExp = /\[Then\]\s*(?<content>.+)\s*/i;
        let matchArr: RegExpMatchArray | null = methodText.match(regexFeature);

        if (matchArr && matchArr.groups) {
            message.Feature = matchArr.groups['content'];
            message.Details.feature = message.Feature;
        }

        matchArr = methodText.match(regexScenario);
        if (matchArr && matchArr.groups) {
            message.Scenario = matchArr.groups['content'];
            message.Details.name = message.Scenario;
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