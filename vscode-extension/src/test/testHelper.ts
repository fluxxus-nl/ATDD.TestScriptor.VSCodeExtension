import assert = require("assert");
import { copyFileSync, existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { Range, Uri, workspace, WorkspaceEdit } from "vscode";
import { SyntaxTree } from "../App logic/AL Code Outline/syntaxTree";
import { ObjectService } from "../App logic/Services/ObjectService";
import { TestInformationOutput } from "../App logic/Utils/informationsOutput";
import { PreChecks } from "../App logic/Utils/preChecks";
import { Application } from "../Application";
import { WebPanelCommandService } from "../Services/WebPanelCommandService";
import { MessageUpdate } from "../typings/types";

export class TestHelper {
	static pathOfTestProject: string = join(__dirname, '..', '..', '..', 'test', 'test-project')
	static pathOfTestResults: string = join(__dirname, '..', '..', 'src', 'test', 'results')

	public static async verifyChangeIsValid(messageUpdate: MessageUpdate, isValid: boolean = true) {
		//Then change is valid
		let validResult: { valid: boolean; reason: string; } = await PreChecks.isChangeValid(messageUpdate);
		assert.strictEqual(validResult.valid, isValid, isValid ? 'Change should be valid' : 'Change should be invalid');
	}
	public static async verifyUserQuestions(messageUpdate: MessageUpdate, informationOutput: TestInformationOutput): Promise<boolean> {
		Application.instance;
		let result: { wantsToContinue: boolean, wantsProceduresToBeDeleted: Array<{ procedureName: string, parameterTypes: string[] }>, updateProcedureCall: boolean } =
			await Application.container.get(WebPanelCommandService).askUserForConfirmationsToProceed(messageUpdate, informationOutput);
		if (result.wantsToContinue) {
			messageUpdate.ProceduresToDelete = result.wantsProceduresToBeDeleted
			messageUpdate.UpdateProcedureCall = result.updateProcedureCall
		}
		//Then questions popped up match with configured questions
		assert.strictEqual(informationOutput.validate(), true, 'configured questions should match with the questions which popped up')
		return result.wantsToContinue;
	}
	public static async verifyResult(messageUpdate: MessageUpdate, resultFsPath: string) {
		//Then save changes is valid
		let successful: boolean = await new ObjectService().saveChanges(messageUpdate);
		assert.strictEqual(successful, true, 'saveChanges() should run successfully.');
		//Then File content is as expected.
		let resultFilename: string = TestHelper.getFsPathOfResults(resultFsPath);
		let expectedResult: string = readFileSync(resultFilename, { encoding: 'utf8' });
		let actualResult: string = readFileSync(messageUpdate.FsPath, { encoding: 'utf8' });
		assert.strictEqual(actualResult, expectedResult, 'fileContent should be identical.');
	}
	public static async resetConfigurations(): Promise<void> {
		let config = workspace.getConfiguration('atddTestScriptor', Uri.file(TestHelper.pathOfTestProject))
		await config.update('prefixGiven', 'Create')
		await config.update('prefixWhen', '')
		await config.update('prefixThen', 'Verify')
		await config.update('prefixGivenHistory', [])
		await config.update('prefixWhenHistory', [])
		await config.update('prefixThenHistory', [])

		await config.update('addException', true)
		await config.update('addInitializeFunction', true)
		await config.update('removalMode', 'Ask for confirmation')
		await config.update('testDirectory', 'src')
	}
	public static getFsPathOfTestProject(filename: string): string {
		return join(TestHelper.pathOfTestProject, 'src', 'codeunit', filename);
	}
	public static getFsPathOfResults(filename: string): string {
		return join(TestHelper.pathOfTestResults, filename)
	}


	public static async resetFiles(): Promise<void> {
		let orgsFolder: string = join(__dirname, '..', '..', 'src', 'test', 'orgs')
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectFLX.Codeunit.al')
		let pathParts: string[] = fsPath.split(/[/\\]/)
		pathParts.pop();
		let actualFolder: string = pathParts.join('\\')
		let fileNames: string[] = readdirSync(orgsFolder)
		for (const fileName of fileNames)
			copyFileSync(join(orgsFolder, fileName), join(actualFolder, fileName))

		for (const textDoc of workspace.textDocuments) {
			if (!existsSync(textDoc.uri.fsPath))
				continue
			let edit = new WorkspaceEdit();
			edit.replace(textDoc.uri,
				new Range(0, 0, textDoc.lineCount - 1, textDoc.lineAt(textDoc.lineCount - 1).text.length),
				readFileSync(textDoc.uri.fsPath, { encoding: 'utf8' })
			)
			await workspace.applyEdit(edit);
			SyntaxTree.clearInstance(textDoc)
		}
	}
}