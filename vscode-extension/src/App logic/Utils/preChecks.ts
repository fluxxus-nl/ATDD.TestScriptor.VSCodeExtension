import { Uri, TextDocument, workspace } from "vscode";
import { Application } from "../../Application";
import { MessageUpdate, TypeChanged, MessageState } from "../../typings/types";
import { Config } from "./config";
import { ElementUtils } from "./elementUtils";
import { TestCodeunitUtils } from "./testCodeunitUtils";
import { TestMethodUtils } from "./testMethodUtils";

export class PreChecks {
    static async isChangeValid(msg: MessageUpdate): Promise<{ valid: boolean, reason: string }> {
        if (msg.Type == TypeChanged.Feature && [MessageState.New, MessageState.Modified].includes(msg.State)) {
            return await PreChecks.isChangeValid_Feature(msg);
        }
        if (msg.Type == TypeChanged.ScenarioName && [MessageState.New, MessageState.Modified].includes(msg.State)) {
            return await PreChecks.isChangeValid_Scenario(msg)
        }
        if ([TypeChanged.Given, TypeChanged.When, TypeChanged.Then].includes(msg.Type) && [MessageState.Modified, MessageState.Deleted].includes(msg.State)) {
            return await PreChecks.isChangeValid_Element(msg)
        }
        return { valid: true, reason: '' };
    }
    static async isChangeValid_Feature(msg: MessageUpdate): Promise<{ valid: boolean, reason: string }> {
        if (msg.State == MessageState.Modified)
            return {
                valid: false,
                reason: 'Not supported yet to rename a feature.'
            }
        let srcFolder: string | undefined = Config.getTestSrcFolder();
        if (!srcFolder)
            return {
                valid: false,
                reason: 'Please specify the source folder for your tests in the settings.'
            };
        let existingFeatures: Map<string, Uri[]> = await ElementUtils.getFeaturesOfDirectories(Application.getWorkspacePaths())
        if (existingFeatures.has(msg.NewValue))
            return {
                valid: false,
                reason: 'A feature with the same name exists already.'
            };
        return { valid: true, reason: '' }
    }
    static async isChangeValid_Scenario(msg: MessageUpdate): Promise<{ valid: boolean, reason: string }> {
        let fsPath: string = msg.FsPath;
        if (fsPath == '')
            fsPath = await ElementUtils.getFSPathOfFeature(msg.Project, msg.Feature);
        let document: TextDocument = await workspace.openTextDocument(fsPath);
        let scenarioProcedureName = TestMethodUtils.getProcedureName(TypeChanged.ScenarioName, msg.NewValue);
        if (await TestCodeunitUtils.isProcedureAlreadyDeclared(document, scenarioProcedureName, [])) {
            return {
                valid: false,
                reason: 'Scenario already exists. Please update your scenario definition so it is unique.'
            };
        }
        return { valid: true, reason: '' }
    }
    static async isChangeValid_Element(msg: MessageUpdate): Promise<{ valid: boolean, reason: string }> {
        if (!msg.ArrayIndex && msg.ArrayIndex != 0)
            throw new Error('ArrayIndex not passed')
        if (msg.State == MessageState.Deleted && msg.OldValue == '') {
            return { valid: false, reason: '' }
        }
        let fsPath: string = msg.FsPath
        if (fsPath == '')
            fsPath = await ElementUtils.getFSPathOfFeature(msg.Project, msg.Feature);
        let document: TextDocument = await workspace.openTextDocument(fsPath);
        if (!await ElementUtils.getRangeOfElement(document, msg.Scenario, msg.Id, msg.Type, msg.ArrayIndex)) {
            return {
                valid: false,
                reason: TypeChanged[TypeChanged.Given] + ' \'' + msg.OldValue + '\' not found.'
            }
        }
        return { valid: true, reason: '' }
    }
}