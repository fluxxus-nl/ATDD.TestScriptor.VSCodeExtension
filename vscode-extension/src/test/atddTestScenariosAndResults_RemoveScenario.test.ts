import { Uri, workspace } from 'vscode';
import { TestInformationOutput } from '../App logic/Utils/informationsOutput';
import { MessageState, MessageUpdate, TypeChanged } from '../typings/types';
import { TestHelper } from './testHelper';


suite('Remove Scenario', function () {
	this.beforeAll(async function () {
		await TestHelper.resetFiles();
	})
	this.beforeEach(async function () {
		await TestHelper.resetConfigurations();
	});

	test('Scenario058', async () => {
		//Given Test function with valid Given-When-Then structure
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectFLX.Codeunit.al')
		//When Remove Scenario
		let messageUpdate: MessageUpdate = {
			Scenario: '',
			Feature: 'First test object',
			Type: TypeChanged.ScenarioName,
			State: MessageState.Deleted,
			OldValue: 'First test function with valid Given-When-Then structure',
			NewValue: '',
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let informationOutput = new TestInformationOutput();
		let confirmDeletionOfScenarioQuestion: string = 'Do you want to delete this scenario?';
		informationOutput.configure(confirmDeletionOfScenarioQuestion, 'Yes')
		let confirmDeletionOfProcedureVariableQuestion = (procName: string) => `Do you want to delete the procedure '${procName}'?`;
		informationOutput.configure(confirmDeletionOfProcedureVariableQuestion('CreateValidGiven'), 'Yes')
		informationOutput.configure(confirmDeletionOfProcedureVariableQuestion('ValidWhen'), 'Yes')
		informationOutput.configure(confirmDeletionOfProcedureVariableQuestion('VerifyValidThen'), 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, informationOutput))
			await TestHelper.verifyResult(messageUpdate, 'scenario058.al');
	})
	test('Scenario059', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectFLX.Codeunit.al')
		//When Remove Scenario
		let messageUpdate: MessageUpdate = {
			Scenario: '',
			Feature: 'First test object',
			Type: TypeChanged.ScenarioName,
			State: MessageState.Deleted,
			OldValue: 'First test function with valid Given-When-Then structure',
			NewValue: '',
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let informationOutput = new TestInformationOutput();
		let confirmDeletionOfScenarioQuestion: string = 'Do you want to delete this scenario?';
		informationOutput.configure(confirmDeletionOfScenarioQuestion, 'No')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		await TestHelper.verifyUserQuestions(messageUpdate, informationOutput)
	})
	test('Scenario060', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectFLX.Codeunit.al')
		//When Remove Scenario
		let messageUpdate: MessageUpdate = {
			Scenario: '',
			Feature: 'First test object',
			Type: TypeChanged.ScenarioName,
			State: MessageState.Deleted,
			OldValue: 'First test function with valid Given-When-Then structure',
			NewValue: '',
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let informationOutput = new TestInformationOutput();
		let confirmDeletionOfScenarioQuestion: string = 'Do you want to delete this scenario?';
		informationOutput.configure(confirmDeletionOfScenarioQuestion, 'Yes')
		let confirmDeletionOfProcedureVariableQuestion = (procName: string) => `Do you want to delete the procedure '${procName}'?`;
		informationOutput.configure(confirmDeletionOfProcedureVariableQuestion('CreateValidGiven'), 'No')
		informationOutput.configure(confirmDeletionOfProcedureVariableQuestion('ValidWhen'), 'No')
		informationOutput.configure(confirmDeletionOfProcedureVariableQuestion('VerifyValidThen'), 'No')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, informationOutput))
			await TestHelper.verifyResult(messageUpdate, 'scenario060.al');
	})
	test('Scenario068', async () => {
		//Given Test codeunit with one test function with valid Given-When-Then structure and call to Initialize
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectWithInitializeFLX.Codeunit.al')
		//When Remove Scenario
		let messageUpdate: MessageUpdate = {
			Scenario: '',
			Feature: 'First test object',
			Type: TypeChanged.ScenarioName,
			State: MessageState.Deleted,
			OldValue: 'Fourth test function with valid Given-When-Then structure and Initialize',
			Id: 4,
			NewValue: '',
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let informationOutput = new TestInformationOutput();
		let confirmDeletionOfScenarioQuestion: string = 'Do you want to delete this scenario?';
		informationOutput.configure(confirmDeletionOfScenarioQuestion, 'Yes')
		let confirmDeletionOfProcedureVariableQuestion = (procName: string) => `Do you want to delete the procedure '${procName}'?`;
		informationOutput.configure(confirmDeletionOfProcedureVariableQuestion('CreateValidGiven'), 'Yes')
		informationOutput.configure(confirmDeletionOfProcedureVariableQuestion('ValidWhen'), 'Yes')
		informationOutput.configure(confirmDeletionOfProcedureVariableQuestion('VerifyValidThen'), 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, informationOutput))
			await TestHelper.verifyResult(messageUpdate, 'scenario068.al');
	})
	test('Scenario069', async () => {
		//Given Test codeunit with one test function with valid Given-When-Then structure and UI Handler
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectWithUIHandlerFLX.Codeunit.al')
		//When Remove Scenario
		let messageUpdate: MessageUpdate = {
			Scenario: '',
			Feature: 'First test object',
			Type: TypeChanged.ScenarioName,
			State: MessageState.Deleted,
			OldValue: 'Fifth test function with valid Given-When-Then structure and UI handler',
			Id: 5,
			NewValue: '',
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let informationOutput = new TestInformationOutput();
		let confirmDeletionOfScenarioQuestion: string = 'Do you want to delete this scenario?';
		informationOutput.configure(confirmDeletionOfScenarioQuestion, 'Yes')
		let confirmDeletionOfProcedureVariableQuestion = (procName: string) => `Do you want to delete the procedure '${procName}'?`;
		informationOutput.configure(confirmDeletionOfProcedureVariableQuestion('CreateValidGiven'), 'Yes')
		informationOutput.configure(confirmDeletionOfProcedureVariableQuestion('ValidWhen'), 'Yes')
		informationOutput.configure(confirmDeletionOfProcedureVariableQuestion('VerifyValidThen'), 'Yes')
		informationOutput.configure(confirmDeletionOfProcedureVariableQuestion('AMessageHandler'), 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, informationOutput))
			await TestHelper.verifyResult(messageUpdate, 'scenario069.al');
	})
	test('Scenario070', async () => {
		//Given Test codeunit with one test function with valid Given-When-Then structure and UI Handler
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectWithUIHandlerFLX.Codeunit.al')
		//When Remove Scenario
		let messageUpdate: MessageUpdate = {
			Scenario: '',
			Feature: 'First test object',
			Type: TypeChanged.ScenarioName,
			State: MessageState.Deleted,
			OldValue: 'Fifth test function with valid Given-When-Then structure and UI handler',
			Id: 5,
			NewValue: '',
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let informationOutput = new TestInformationOutput();
		let confirmDeletionOfScenarioQuestion: string = 'Do you want to delete this scenario?';
		informationOutput.configure(confirmDeletionOfScenarioQuestion, 'Yes')
		let confirmDeletionOfProcedureVariableQuestion = (procName: string) => `Do you want to delete the procedure '${procName}'?`;
		informationOutput.configure(confirmDeletionOfProcedureVariableQuestion('CreateValidGiven'), 'Yes')
		informationOutput.configure(confirmDeletionOfProcedureVariableQuestion('ValidWhen'), 'Yes')
		informationOutput.configure(confirmDeletionOfProcedureVariableQuestion('VerifyValidThen'), 'Yes')
		informationOutput.configure(confirmDeletionOfProcedureVariableQuestion('AMessageHandler'), 'No')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, informationOutput))
			await TestHelper.verifyResult(messageUpdate, 'scenario070.al');
	})
	test('Scenario071', async () => {
		//Given Test codeunit with one test function with valid Given-When-Then structure and call to Initialize
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectWithInitializeFLX.Codeunit.al')
		//Given Setting atddTestScriptor.removalMode equals "No confirmation, but removal"
		await workspace.getConfiguration('atddTestScriptor', Uri.file(TestHelper.pathOfTestProject)).update('removalMode', 'No confirmation, but removal');

		//When Remove Scenario
		let messageUpdate: MessageUpdate = {
			Scenario: '',
			Feature: 'First test object',
			Type: TypeChanged.ScenarioName,
			State: MessageState.Deleted,
			OldValue: 'Fourth test function with valid Given-When-Then structure and Initialize',
			Id: 4,
			NewValue: '',
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let informationOutput = new TestInformationOutput();
		let confirmDeletionOfScenarioQuestion: string = 'Do you want to delete this scenario?';
		informationOutput.configure(confirmDeletionOfScenarioQuestion, 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, informationOutput))
			await TestHelper.verifyResult(messageUpdate, 'scenario071.al');
	})
	test('Scenario072', async () => {
		//Given Test codeunit with one test function with valid Given-When-Then structure and call to Initialize
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectWithInitializeFLX.Codeunit.al')
		//Given Setting atddTestScriptor.removalMode equals "No confirmation, but removal"
		await workspace.getConfiguration('atddTestScriptor', Uri.file(TestHelper.pathOfTestProject)).update('removalMode', 'No confirmation & no removal');

		//When Remove Scenario
		let messageUpdate: MessageUpdate = {
			Scenario: '',
			Feature: 'First test object',
			Type: TypeChanged.ScenarioName,
			State: MessageState.Deleted,
			OldValue: 'Fourth test function with valid Given-When-Then structure and Initialize',
			Id: 4,
			NewValue: '',
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let informationOutput = new TestInformationOutput();
		let confirmDeletionOfScenarioQuestion: string = 'Do you want to delete this scenario?';
		informationOutput.configure(confirmDeletionOfScenarioQuestion, 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, informationOutput))
			await TestHelper.verifyResult(messageUpdate, 'scenario072.al');
	})
});

