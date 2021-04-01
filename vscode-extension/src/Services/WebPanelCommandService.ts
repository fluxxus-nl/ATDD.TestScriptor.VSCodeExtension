import { autoinject, singleton } from 'aurelia-dependency-injection';
import { Range, Selection, TextDocument, TextEditorRevealType, Uri, ViewColumn, window, workspace } from 'vscode';
import { Config } from '../App logic/Utils/config';
import { InformationOutput, VSCodeInformationOutput } from '../App logic/Utils/informationsOutput';
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
        let entry = message.Data as MessageUpdate;
        let validationResult: { valid: boolean, reason: string } = await this.middlewareService.isChangeValid(entry);
        let somethingIsChanged: boolean = false;
        if (!validationResult.valid) {
            window.showErrorMessage(validationResult.reason);
        } else {
            let userResponses: { wantsToContinue: boolean, wantsProceduresToBeDeleted: Array<{ procedureName: string, parameterTypes: string[] }>, updateProcedureCall: boolean } =
                await this.askUserForConfirmationsToProceed(entry);
            if (userResponses.wantsToContinue) {
                entry.ProceduresToDelete = userResponses.wantsProceduresToBeDeleted;
                entry.UpdateProcedureCall = userResponses.updateProcedureCall;
                await this.middlewareService.saveChanges(entry);
                somethingIsChanged = true;
            }
        }
        if (!entry.internalCall)
            WebPanel.postMessage({ Command: 'SaveChanges', Data: { success: somethingIsChanged, fsPath: entry.FsPath, methodName: entry.MethodName } });
    }
    async askUserForConfirmationsToProceed(entry: MessageUpdate, informationOutput: InformationOutput = new VSCodeInformationOutput()): Promise<{ wantsToContinue: boolean, wantsProceduresToBeDeleted: Array<{ procedureName: string, parameterTypes: string[] }>, updateProcedureCall: boolean }> {
        let confirmDeletion = (thing: string) => `Do you want to delete ${thing}?`;
        let confirmUpdate = (thing: string) => `Do you want to update ${thing}?`;
        let askWhichProcedureToTake: string = 'To the new naming exists already a helper function with the same parameters. Which one to take?';
        let optionYes: string = 'Yes';
        let optionNo: string = 'No';
        let removalMode: string = Config.getRemovalMode(entry.FsPath ? Uri.file(entry.FsPath) : undefined);
        if ([TypeChanged.Given, TypeChanged.When, TypeChanged.Then].includes(entry.Type)) {
            if ([MessageState.Deleted, MessageState.Modified].includes(entry.State)) {
                let response: string | undefined;
                if (entry.State == MessageState.Deleted)
                    response = await informationOutput.ask(confirmDeletion('this element'), [optionYes, optionNo], optionYes)
                else
                    response = await informationOutput.ask(confirmUpdate('this element'), [optionYes, optionNo], optionYes)
                if (response === optionYes) {
                    let useNewProcedure: boolean = true;
                    if (entry.State == MessageState.Modified) {
                        if (await this.middlewareService.checkIfOldAndNewProcedureExists(entry)) {
                            let optionKeepOld: string = 'Keep old';
                            let optionSwitchToNew: string = 'Switch to new one';
                            response = await informationOutput.ask(askWhichProcedureToTake, [optionKeepOld, optionSwitchToNew], optionSwitchToNew)
                            if (response === optionKeepOld)
                                useNewProcedure = false;
                        }
                    }
                    let proceduresToDelete: Array<{ procedureName: string, parameterTypes: string[] }> = [];
                    if (useNewProcedure) {
                        let helperFunctionsWhichCouldBeDeleted: Array<{ procedureName: string, parameterTypes: string[] }> =
                            await this.middlewareService.getProceduresWhichCouldBeDeletedAfterwards(entry);
                        if (helperFunctionsWhichCouldBeDeleted.length == 1) {
                            let responseHelperFunctionShouldBeDeleted: string | undefined;
                            if (removalMode == Config.removalModeConfirmation)
                                responseHelperFunctionShouldBeDeleted = await informationOutput.ask(confirmDeletion('the procedure \'' + helperFunctionsWhichCouldBeDeleted[0].procedureName) + '\'', [optionYes, optionNo], optionYes);
                            if (responseHelperFunctionShouldBeDeleted === optionYes || removalMode == Config.removalModeNoConfirmationButRemoval)
                                proceduresToDelete = helperFunctionsWhichCouldBeDeleted;
                            else
                                proceduresToDelete = [];
                        }
                    }
                    return { wantsToContinue: true, wantsProceduresToBeDeleted: proceduresToDelete, updateProcedureCall: useNewProcedure }
                } else {
                    return { wantsToContinue: false, wantsProceduresToBeDeleted: [], updateProcedureCall: false };
                }
            }
            return { wantsToContinue: true, wantsProceduresToBeDeleted: [], updateProcedureCall: true };
        } else if (TypeChanged.ScenarioName == entry.Type) {
            if (entry.State == MessageState.Deleted) {
                let responseScenarioShouldBeDeleted: string | undefined
                if (!entry.internalCall)
                    responseScenarioShouldBeDeleted = await informationOutput.ask(confirmDeletion('this scenario'), [optionYes, optionNo], optionYes);
                else
                    responseScenarioShouldBeDeleted = optionYes
                if (responseScenarioShouldBeDeleted === optionYes) {
                    let proceduresWhichCouldBeDeleted: Array<{ procedureName: string, parameterTypes: string[] }> =
                        await this.middlewareService.getProceduresWhichCouldBeDeletedAfterwards(entry);
                    let proceduresToDelete: Array<{ procedureName: string, parameterTypes: string[] }> = [];
                    proceduresToDelete.push(proceduresWhichCouldBeDeleted[0]);
                    for (let i = 1; i < proceduresWhichCouldBeDeleted.length; i++) { //i = 1 because scenario-Testprocedure is also inside this this array
                        let responseHelperFunctionShouldBeDeleted: string | undefined;
                        if (removalMode == Config.removalModeConfirmation)
                            responseHelperFunctionShouldBeDeleted = await informationOutput.ask(confirmDeletion('the procedure \'' + proceduresWhichCouldBeDeleted[i].procedureName) + '\'', [optionYes, optionNo], optionYes);
                        if (responseHelperFunctionShouldBeDeleted === optionYes || removalMode == Config.removalModeNoConfirmationButRemoval) {
                            proceduresToDelete.push(proceduresWhichCouldBeDeleted[i]);
                        }
                    }
                    return { wantsToContinue: true, wantsProceduresToBeDeleted: proceduresToDelete, updateProcedureCall: true };
                } else {
                    return { wantsToContinue: false, wantsProceduresToBeDeleted: [], updateProcedureCall: false };
                }
            } else if (entry.State == MessageState.Modified) {
                let responseScenarioShouldBeModified: string | undefined = await informationOutput.ask(confirmUpdate('this scenario'), [optionYes, optionNo], optionYes);
                if (responseScenarioShouldBeModified === optionNo) {
                    return { wantsToContinue: false, wantsProceduresToBeDeleted: [], updateProcedureCall: false };
                }
            }
            return { wantsToContinue: true, wantsProceduresToBeDeleted: [], updateProcedureCall: true };
        } else if (TypeChanged.Feature == entry.Type) {
            if (entry.State == MessageState.Deleted) {
                let responseScenarioShouldBeDeleted: string | undefined = await informationOutput.ask(confirmDeletion('this feature'), [optionYes, optionNo], optionYes);
                if (responseScenarioShouldBeDeleted == optionNo)
                    return { wantsToContinue: false, wantsProceduresToBeDeleted: [], updateProcedureCall: false };
            }
            return { wantsToContinue: true, wantsProceduresToBeDeleted: [], updateProcedureCall: true };
        }
        return { wantsToContinue: true, wantsProceduresToBeDeleted: [], updateProcedureCall: true };
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
    
    async GetConfigurationCommand(message: IMessageBase) {
        // TODO
        let setting = false;        
        WebPanel.postMessage({ Command: 'GetConfiguration', setting});
    }

    async SetConfigurationCommand(message: IMessageBase) {
        // TODO
        //let setting = message.Data as boolean;
        //
        WebPanel.postMessage({Command: 'SetConfiguration', Data: null});
    }
}