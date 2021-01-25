import { Uri, TextDocument, workspace } from "vscode";
import { Message } from "../../typings/types";
import { ALFullSyntaxTreeNode } from "../AL Code Outline/alFullSyntaxTreeNode";
import { ObjectToMessageUtils } from "./objectToMessageUtils";
import { TestCodeunitUtils } from "./testCodeunitUtils";

export class MessageParser{
    public static async extractMessageObjectFromTestUris(testUris: Uri[], i: number): Promise<Message[]> {
        let newMesssages: Message[] = [];
        let document: TextDocument = await workspace.openTextDocument(testUris[i].fsPath);
        let testMethods: ALFullSyntaxTreeNode[] = await TestCodeunitUtils.getTestMethodsOfDocument(document);
        let featureCodeunitLevel: string | undefined;
        if (testMethods.length > 0) {
            featureCodeunitLevel = ObjectToMessageUtils.getUniqueFeature(document, testMethods[0]);
        }
        for (let a = 0; a < testMethods.length; a++)
            newMesssages.push(await ObjectToMessageUtils.testMethodToMessage(document, testMethods[a], featureCodeunitLevel));
        return newMesssages;
    }
}