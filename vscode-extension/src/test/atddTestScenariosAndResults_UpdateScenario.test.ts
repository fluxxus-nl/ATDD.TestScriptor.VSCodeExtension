import { Uri, workspace } from 'vscode';
import { ObjectService } from '../App logic/Services/ObjectService';
import { TestInformationOutput } from '../App logic/Utils/informationsOutput';
import { MessageState, MessageUpdate, TypeChanged } from '../typings/types';
import { TestHelper } from './testHelper';


suite('Extension Test Suite', async function () {
	this.beforeAll(async function () {
		await TestHelper.resetFiles();
	})
	this.beforeEach(async function () {
		await TestHelper.resetConfigurations();
	});

	test('Scenario081', async () => {
		//Given Test function with valid Given-When-Then structure
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectFLX.Codeunit.al')
		//When Rename "First test function with valid Given-When-Then structure" to "Valid Given-When-Then structure"
		let messageUpdate: MessageUpdate = {
			Scenario: '',
			Feature: 'First test object',
			Type: TypeChanged.ScenarioName,
			State: MessageState.Modified,
			OldValue: 'First test function with valid Given-When-Then structure',
			NewValue: 'Valid Given-When-Then structure',
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then

		let informationOutput = new TestInformationOutput();
		let confirmUpdateOfScenarioQuestion: string = 'Do you want to update this scenario?';
		informationOutput.configure(confirmUpdateOfScenarioQuestion, 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, informationOutput))
			await TestHelper.verifyResult(messageUpdate, 'scenario081.al', fsPath);
	})
	test('Scenario082', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectFLX.Codeunit.al')
		//When Rename "First test function with valid Given-When-Then structure" to "Valid Given-When-Then structure"
		let messageUpdate: MessageUpdate = {
			Scenario: '',
			Feature: 'First test object',
			Type: TypeChanged.ScenarioName,
			State: MessageState.Modified,
			OldValue: 'First test function with valid Given-When-Then structure',
			NewValue: 'Valid Given-When-Then structure',
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let informationOutput = new TestInformationOutput();
		let confirmUpdateOfScenarioQuestion: string = 'Do you want to update this scenario?';
		informationOutput.configure(confirmUpdateOfScenarioQuestion, 'No')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		await TestHelper.verifyUserQuestions(messageUpdate, informationOutput)
	})
	test('Scenario083', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectFLX.Codeunit.al')
		//Given Test function SecondTestFunctionWithValidGivenWhenThenStructurewith valid Given-When-Then structure
		let messageUpdate: MessageUpdate = {
			Scenario: '',
			Feature: 'First test object',
			Type: TypeChanged.ScenarioName,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'Second test function with valid Given-When-Then structure',
			Id: 2,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		await new ObjectService().saveChanges(messageUpdate);
		//Given Other test function ThirdTestFunctionWithValidGivenWhenThenStructure with valid Given-When-Then structure
		messageUpdate.NewValue = 'Third test function with valid Given-When-Then structure'
		messageUpdate.Id = 3
		await new ObjectService().saveChanges(messageUpdate);

		//When Rename "Second test function with valid Given-When-Then structure" to "Third test function with valid Given-When-Then structure" and confirm
		messageUpdate.OldValue = 'Second test function with valid Given-When-Then structure'
		messageUpdate.Id = 2
		messageUpdate.State = MessageState.Modified
		//Then
		await TestHelper.verifyChangeIsValid(messageUpdate, false);
	})
	test('Scenario084', async () => {
		//Given Result from scenario 83
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectFLX.Codeunit.al')

		//When Change "Third test function with valid Given-When-Then structure" to "Another test function with valid Given-When-Then structure" to and confirm
		let messageUpdate: MessageUpdate = {
			Scenario: '',
			Feature: 'First test object',
			Type: TypeChanged.ScenarioName,
			State: MessageState.Modified,
			OldValue: 'Third test function with valid Given-When-Then structure',
			NewValue: 'Another test function with valid Given-When-Then structure',
			Id: 3,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}

		//Then
		let informationOutput = new TestInformationOutput();
		let confirmUpdateOfScenarioQuestion: string = 'Do you want to update this scenario?';
		informationOutput.configure(confirmUpdateOfScenarioQuestion, 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, informationOutput))
			await TestHelper.verifyResult(messageUpdate, 'scenario084.al', fsPath)
	})

});

