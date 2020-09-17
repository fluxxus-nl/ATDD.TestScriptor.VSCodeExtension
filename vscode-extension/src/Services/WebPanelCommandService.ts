import { Application } from '../Application';
import { singleton, autoinject } from 'aurelia-dependency-injection';
import { ExcelService } from './ExcelService';
import { MiddlewareService } from './MiddlewareService';
import { VSCommandService, VSCommandType, VSDependency } from './VSCommandService';
import { WebPanel } from '../WebPanel';
import { IMessageBase, Message, MessageUpdate, TypeChanged, MessageState } from '../typings/types';
import { workspace, window, TextDocument, ViewColumn, TextEditorRevealType, Selection, Range, WorkspaceConfiguration } from 'vscode';
import { TestMethodUtils } from '../App logic/Utils/testMethodUtils';
import { TestCodeunitUtils } from '../App logic/Utils/testCodeunitUtils';

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
        let proceed: boolean = await this.askUserForConfirmations(entry, config);
        if (proceed) {
            await this.middlewareService.saveChanges(entry, config);
        }
        WebPanel.postMessage({ Command: 'SaveChanges', Data: proceed });
    }
    async askUserForConfirmations(entry: MessageUpdate, config: WorkspaceConfiguration): Promise<boolean> {
        entry.DeleteProcedure = false;
        let confirmDeletionOfElementQuestion: string = 'Do you want to delete this element?';
        let confirmDeletionOfProcedureQuestion: string = 'Do you want to delete the helper function?';
        let confirmUpdateOfElementQuestion: string = 'Do you want to update this element?';
        let optionYes: string = 'Yes';
        let optionNo: string = 'No';
        if ([TypeChanged.Given, TypeChanged.When, TypeChanged.Then].includes(entry.Type)) {
            if (entry.State === MessageState.Deleted) {
                let confirmedDeletionOfElement: string | undefined = await window.showInformationMessage(confirmDeletionOfElementQuestion, optionYes, optionNo);
                if (confirmedDeletionOfElement === optionYes) {

                    let couldHelperFunctionBeDeleted: boolean = await this.middlewareService.checkSaveChanges(entry, config);
                    if (couldHelperFunctionBeDeleted) {
                        let confirmedDeletionOfProcedure: string | undefined = await window.showInformationMessage(confirmDeletionOfProcedureQuestion, optionYes, optionNo);
                        entry.DeleteProcedure = confirmedDeletionOfProcedure === optionYes;
                    }
                } else {
                    return false;
                }
            } else if (entry.State === MessageState.Modified) {
                let confirmedUpdateOfElement: string | undefined = await window.showInformationMessage(confirmUpdateOfElementQuestion, optionYes, optionNo);
                if (confirmedUpdateOfElement === optionNo) {
                    return false;
                }
            }
        } else if (entry.Type == TypeChanged.ScenarioName && entry.State == MessageState.New) {
            let document: TextDocument = await workspace.openTextDocument(entry.FsPath);
            let scenarioProcedureName = TestMethodUtils.getProcedureName(TypeChanged.ScenarioName, entry.NewValue);
            if (await TestCodeunitUtils.isProcedureAlreadyDeclared(document, scenarioProcedureName, [])) {
                window.showErrorMessage('Scenario already exists. Please update your scenario definition so it is unique.');
                return false;
            }
        }
        return true;
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