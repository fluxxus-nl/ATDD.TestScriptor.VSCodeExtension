import * as vscode from 'vscode';
import { Config } from './config';

export interface UserInteraction {
    ask(question: string, options: string[], defaultOption: string): Promise<string | undefined>;
}
export class VSCodeInformationOutput implements UserInteraction {
    async ask(question: string, options: string[], defaultOption: string): Promise<string | undefined> {
        if (options.length > 0 && !Config.getShowConfirmations(vscode.window.activeTextEditor?.document.uri))
            return defaultOption
            
        switch (options.length) {
            case 0:
                vscode.window.showInformationMessage(question);
                return undefined;
            case 1:
                return await vscode.window.showInformationMessage(question, options[0]);
            case 2:
                return await vscode.window.showInformationMessage(question, options[0], options[1]);
            case 3:
                return await vscode.window.showInformationMessage(question, options[0], options[1], options[2]);
            default:
                throw new Error('Unexpected')
        }
    }
}
export class UserInteractionMock implements UserInteraction {
    private resultMap: Map<string, string> = new Map();
    private askedQuestions: { question: string, options: string[] }[] = [];
    private notConfiguredQuestionExists: boolean = false;
    configure(question: string, response: string) {
        this.resultMap.set(question, response);
    }
    async ask(question: string, options: string[], defaultOption: string): Promise<string | undefined> {
        this.askedQuestions.push({ question, options })
        if (this.resultMap.has(question))
            return this.resultMap.get(question);
        this.notConfiguredQuestionExists = true
        return undefined;
    }
    getAskedQuestions(): { question: string, options: string[] }[] {
        return this.askedQuestions
    }
    validate(): boolean {
        let allQuestionsWereAsked = this.askedQuestions.length == this.resultMap.size
        if (allQuestionsWereAsked && !this.notConfiguredQuestionExists)
            return true
        return false
    }
}