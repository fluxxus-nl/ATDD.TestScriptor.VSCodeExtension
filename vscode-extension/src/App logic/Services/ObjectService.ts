import { commands, Range, TextDocument, Uri, workspace, WorkspaceConfiguration } from 'vscode';
import { Message, MessageState, MessageUpdate, TypeChanged } from "../../typings/types";
import { TextRangeExt } from '../AL Code Outline Ext/textRangeExt';
import { ALFullSyntaxTreeNode } from '../AL Code Outline/alFullSyntaxTreeNode';
import { RangeUtils } from '../Utils/rangeUtils';
import { ElementUtils } from '../Utils/elementUtils';
import { ObjectToMessageUtils } from '../Utils/objectToMessageUtils';
import { TestCodeunitUtils } from '../Utils/testCodeunitUtils';
import { ElementService } from './elementService';

export class ObjectService {

    public async getObjects(paths: string[]): Promise<Message[]> {
        let messages: Message[] = [];
        let testUris: Uri[] = await TestCodeunitUtils.getTestUrisOfWorkspaces();
        for (let i = 0; i < testUris.length; i++) {
            let document: TextDocument = await workspace.openTextDocument(testUris[i].fsPath);
            let testMethods: ALFullSyntaxTreeNode[] = await TestCodeunitUtils.getTestMethodsOfDocument(document);
            for (let a = 0; a < testMethods.length; a++)
                messages.push(await ObjectToMessageUtils.testMethodsToMessage(document, testMethods[a]));
        }
        return messages;
    }
    public async checkSaveChanges(msg: MessageUpdate, config: WorkspaceConfiguration): Promise<boolean> {
        let procedureCanBeRemovedAfterwards: boolean = false;
        if ([TypeChanged.Given, TypeChanged.When, TypeChanged.Then].includes(msg.Type) && [MessageState.Deleted, MessageState.Modified].includes(msg.State)) {
            let document: TextDocument = await workspace.openTextDocument(msg.FsPath);
            let elementValue: string = msg.State == MessageState.Deleted ? msg.NewValue : msg.OldValue;
            let elementRange: Range | undefined = await ElementUtils.getRangeOfElement(document, msg.Scenario, msg.Type, elementValue);
            if (!elementRange) {
                //TODO: What if the element is not found?
                throw new Error('Element not found.');
            } else {
                let identifierTreeNodeOfInvocation: ALFullSyntaxTreeNode | undefined = await ElementUtils.getProcedureCallToElementValue(document, elementRange.start, msg.Type, elementValue);
                if (identifierTreeNodeOfInvocation) {
                    let references: Location[] | undefined = await commands.executeCommand('vscode.executeReferenceProvider', document.uri, RangeUtils.trimRange(document, TextRangeExt.createVSCodeRange(identifierTreeNodeOfInvocation.fullSpan)).start);
                    if (references)
                        procedureCanBeRemovedAfterwards = references.length <= 2; //call + declaration
                }
            }
        }
        return procedureCanBeRemovedAfterwards;
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

}