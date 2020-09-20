import { autoinject, singleton } from 'aurelia-dependency-injection';
import { Range, Selection, TextDocument, TextEditorRevealType, ViewColumn, window, workspace, WorkspaceConfiguration } from 'vscode';
import { Application } from '../Application';
import { IMessageBase, Message, MessageState, MessageUpdate, TypeChanged } from '../typings/types';
import { WebPanel } from '../WebPanel';
import { ExcelService } from './ExcelService';
import { MiddlewareService } from './MiddlewareService';
import { VSCommandService, VSCommandType, VSDependency } from './VSCommandService';

@singleton(true)
@autoinject()
export class WebPanelCommandService {
    public constructor(private middlewareService: MiddlewareService, private vsCommandService: VSCommandService, private excelService: ExcelService) {
    }

    public async dispatch(message: IMessageBase) {
        let functionName: string = `${message.Command}Command`;

        if (Object.keys(this)) {
            //@ts-ignore
            await this[functionName](message);
        } else {
            await Application.ui.info(`'${message.Command}' command was not found.`);
        }
    }

    async LoadProjectsCommand(message: IMessageBase) {
        let paths = Application.getWorkspacePaths();
        let projects = await this.middlewareService.getProjects(paths);
        WebPanel.postMessage({ Command: 'LoadProjects', Data: projects });
    }

    async LoadTestsCommand(message?: IMessageBase) {
        await this.vsCommandService.executeCommand(VSCommandType.Discover);
        WebPanel.postMessage({ Command: 'LoadTests', Data: WebPanel.testList });
    }

    async RunTestsCommand(message?: IMessageBase) {
        if (!Application.checkExtension(VSDependency.ALTestRunner)) {
            await Application.ui.error(`"${VSDependency.ALTestRunner}" extension is not installed or disabled.`);
            return;
        }

        // TODO:        
        let allTests = message?.Params.AllTests === true;
        let entry: Message = message?.Data;
        let fileName = entry.FsPath;
        let functionName = entry.MethodName;

        if (allTests === true) {
            await this.vsCommandService.executeCommand(VSCommandType.RunAllTests, '', entry.Project);
        } else {
            await this.vsCommandService.executeCommand(VSCommandType.RunTest, fileName, functionName);
        }

        WebPanel.postMessage({ Command: 'LoadTests', Data: WebPanel.testList });
    }

    async SaveChangesCommand(message: IMessageBase) {
        let config = Application.clone(Application.config) as any;
        let entry = message.Data as MessageUpdate;
        let validationResult: { valid: boolean, reason: string } = await this.middlewareService.isChangeValid(entry, config);
        let somethingIsChanged: boolean = false;;
        if (!validationResult.valid) {
            window.showErrorMessage(validationResult.reason);
        } else {
            let userResponses: { wantsToContinue: boolean, wantsProceduresToBeDeleted: Array<{ procedureName: string, parameterTypes: string[] }> } =
                await this.askUserForConfirmationsToProceed(entry, config);
            if (userResponses.wantsToContinue) {
                entry.ProceduresToDelete = userResponses.wantsProceduresToBeDeleted;
                await this.middlewareService.saveChanges(entry, config);
                somethingIsChanged = true;
            }
        }
        WebPanel.postMessage({ Command: 'SaveChanges', Data: somethingIsChanged });
    }
    async askUserForConfirmationsToProceed(entry: MessageUpdate, config: WorkspaceConfiguration): Promise<{ wantsToContinue: boolean, wantsProceduresToBeDeleted: Array<{ procedureName: string, parameterTypes: string[] }> }> {
        let confirmDeletionOfScenarioQuestion: string = 'Do you want to delete this scenario?';
        let confirmDeletionOfElementQuestion: string = 'Do you want to delete this element?';
        let confirmDeletionOfProcedureVariableQuestion = (procName: string) => `Do you want to delete the procedure '${procName}' ?`;
        let confirmUpdateOfElementQuestion: string = 'Do you want to update this element?';
        let optionYes: string = 'Yes';
        let optionNo: string = 'No';
        if ([TypeChanged.Given, TypeChanged.When, TypeChanged.Then].includes(entry.Type)) {
            if (entry.State === MessageState.Deleted) {
                let responseElementShouldBeDeleted: string | undefined = await window.showInformationMessage(confirmDeletionOfElementQuestion, optionYes, optionNo);
                if (responseElementShouldBeDeleted === optionYes) {
                    let helperFunctionsWhichCouldBeDeleted: Array<{ procedureName: string, parameterTypes: string[] }> =
                        await this.middlewareService.getProceduresWhichCouldBeDeletedAfterwards(entry, config);
                    let proceduresToDelete: Array<{ procedureName: string, parameterTypes: string[] }> = [];
                    if (helperFunctionsWhichCouldBeDeleted.length == 1) {
                        let responseHelperFunctionShouldBeDeleted: string | undefined = await window.showInformationMessage(confirmDeletionOfProcedureVariableQuestion(helperFunctionsWhichCouldBeDeleted[0].procedureName), optionYes, optionNo);
                        if (responseHelperFunctionShouldBeDeleted === optionYes)
                            proceduresToDelete = helperFunctionsWhichCouldBeDeleted;
                        else
                            proceduresToDelete = [];
                    }
                    return { wantsToContinue: true, wantsProceduresToBeDeleted: proceduresToDelete }
                } else {
                    return { wantsToContinue: false, wantsProceduresToBeDeleted: [] };
                }
            } else if (entry.State === MessageState.Modified) {
                let confirmedUpdateOfElement: string | undefined = await window.showInformationMessage(confirmUpdateOfElementQuestion, optionYes, optionNo);
                if (confirmedUpdateOfElement === optionNo)
                    return { wantsToContinue: false, wantsProceduresToBeDeleted: [] };
                else
                    return { wantsToContinue: true, wantsProceduresToBeDeleted: [] };
            }
        } else if (TypeChanged.ScenarioName == entry.Type) {
            if (entry.State == MessageState.Deleted) {
                let responseScenarioShouldBeDeleted: string | undefined = await window.showInformationMessage(confirmDeletionOfScenarioQuestion, optionYes, optionNo);
                if (responseScenarioShouldBeDeleted === optionYes) {
                    let proceduresWhichCouldBeDeleted: Array<{ procedureName: string, parameterTypes: string[] }> =
                        await this.middlewareService.getProceduresWhichCouldBeDeletedAfterwards(entry, config);
                    let proceduresToDelete: Array<{ procedureName: string, parameterTypes: string[] }> = [];
                    for (let i = 1; i < proceduresWhichCouldBeDeleted.length; i++) { //i = 1 because scenario-Testprocedure is also inside this this array
                        let responseHelperFunctionShouldBeDeleted: string | undefined = await window.showInformationMessage(confirmDeletionOfProcedureVariableQuestion(proceduresWhichCouldBeDeleted[i].procedureName), optionYes, optionNo);
                        if (responseHelperFunctionShouldBeDeleted === optionYes) {
                            proceduresToDelete.push(proceduresWhichCouldBeDeleted[i]);
                        }
                    }
                    return { wantsToContinue: true, wantsProceduresToBeDeleted: proceduresToDelete };
                } else {
                    return { wantsToContinue: false, wantsProceduresToBeDeleted: [] };
                }
            }
        }
        return { wantsToContinue: true, wantsProceduresToBeDeleted: [] };
    }

    async ViewSourceCommand(message: IMessageBase) {
        let entry: Message = message.Data;
        let doc: TextDocument = await workspace.openTextDocument(entry.FsPath);
        let editor = await window.showTextDocument(doc, ViewColumn.Beside);

        let text = editor.document.getText();

        let itemIndex = text.indexOf(entry.MethodName);
        let x = editor.document.positionAt(itemIndex);
        editor.selection = new Selection(x, x);
        editor.revealRange(new Range(x, x), TextEditorRevealType.InCenter);

        WebPanel.postMessage(null);
    }

    async ExportCommand(message: IMessageBase) {
        let entries = message.Data as Array<Message>;
        await this.excelService.export(entries);
        WebPanel.postMessage(null);
    }

}