import { Application } from '../Application';
import { singleton, autoinject } from 'aurelia-dependency-injection';
import { ExcelService } from './ExcelService';
import { MiddlewareService } from './MiddlewareService';
import { VSCommandService, VSCommandType, VSDependency } from './VSCommandService';
import { WebPanel } from '../WebPanel';
import { IMessageBase, Message, MessageUpdate, TypeChanged, MessageState } from '../typings/IMessageBase';
import { workspace, window, TextDocument, ViewColumn, TextEditorRevealType, Selection, Range } from 'vscode';

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

        if (entry.State === MessageState.Deleted && [TypeChanged.Given, TypeChanged.When, TypeChanged.Then].includes(entry.Type)) {
            let confirmedDeletionOfElement: string | undefined = await window.showInformationMessage('Do you want to delete this element?', 'Yes', 'No');
            if (confirmedDeletionOfElement === 'Yes') {
                let couldHelperFunctionBeDeleted: boolean = await this.middlewareService.checkSaveChanges(entry, config);
                if (couldHelperFunctionBeDeleted) {
                    let confirmedDeletionOfProcedure: string | undefined = await window.showInformationMessage('Do you want to delete the helper function?', 'Yes', 'No');
                    entry.DeleteProcedure = confirmedDeletionOfProcedure === 'Yes';
                }
            } else {
                WebPanel.postMessage(null);
                return;
            }
        }
        await this.middlewareService.saveChanges(entry, config);
        WebPanel.postMessage(null);
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