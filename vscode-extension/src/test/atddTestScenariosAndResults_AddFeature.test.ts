import { Uri, workspace } from 'vscode';
import { MessageState, MessageUpdate, TypeChanged } from '../typings/types';
import { TestHelper } from './testHelper';


suite('Extension Test Suite', async function () {
	this.beforeAll(async function () {
		await TestHelper.resetFiles();
	})
	this.beforeEach(async function () {
		await TestHelper.resetConfigurations();
	});

	test('Scenario086', async () => {
		//Given Test Directory
		await workspace.getConfiguration('atddTestScriptor', Uri.file(TestHelper.pathOfTestProject)).update('testDirectory', 'src/codeunit')
		//When User selects "Add Scenario" action
		let messageUpdate: MessageUpdate = {
			Scenario: '',
			Feature: '',
			Type: TypeChanged.Feature,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'New Feature',
			FsPath: '',
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		await TestHelper.verifyChangeIsValid(messageUpdate);
		await TestHelper.verifyResult(messageUpdate, 'scenario086.al');
	})
});
