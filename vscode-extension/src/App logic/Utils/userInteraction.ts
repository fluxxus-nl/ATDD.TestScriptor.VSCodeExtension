import * as vscode from 'vscode';
import { Config } from './config';


export abstract class UserInteraction {
    abstract ask(question: string, options: string[], defaultOption: string): Promise<string | undefined>;

    static questionDeleteElement(): string { return this.confirmDeletion('this element') }
    static questionDeleteScenario(): string { return this.confirmDeletion('this scenario') }
    static questionDeleteFeature(): string { return this.confirmDeletion('this feature') }
    static questionDeleteProcedure(procedure: string): string { return this.confirmDeletion('the procedure \'' + procedure + '\'') }

    static questionUpdateElement(): string { return this.confirmUpdate('this element') }
    static questionUpdateScenario(): string { return this.confirmUpdate('this scenario') }
    static questionUpdateFeature(): string { return this.confirmUpdate('this feature') }
    static questionUpdateProcedure(procedure: string): string { return this.confirmUpdate('the procedure \'' + procedure + '\'') }

    static questionWhichProcedureToTake: string = 'To the new naming exists already a helper function with the same parameters. Which one to take?';
    static responseYes: string = 'Yes';
    static responseNo: string = 'No';

    private static confirmDeletion(thing: string): string { return `Do you want to delete ${thing}?` }
    private static confirmUpdate(thing: string): string { return `Do you want to update ${thing}?` }
}
export class VSCodeInformationOutput extends UserInteraction {
    async ask(question: string, options: string[], defaultOption: string): Promise<string | undefined> {
        if (options.length > 0 && !Config.getShowConfirmations())
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
export class UserInteractionMock extends UserInteraction {
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