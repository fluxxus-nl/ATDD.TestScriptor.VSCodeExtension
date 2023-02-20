import { Uri, workspace } from 'vscode';
import { UserInteraction, UserInteractionMock } from '../App logic/Utils/userInteraction';
import { MessageState, MessageUpdate, TypeChanged } from '../typings/types';
import { TestHelper } from './testHelper';


suite('Remove Scenario', function () {
	this.beforeAll(async function () {
		await TestHelper.resetFiles();
	})
	this.beforeEach(async function () {
		await TestHelper.resetConfigurations();
	});

	test('Scenario 058 - Remove Scenario step 3a', async () => {
		//Given Test function with valid Given-When-Then structure
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')
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
		let userInteractionMock = new UserInteractionMock();
		userInteractionMock.configure(UserInteraction.questionDeleteScenario(), 'Yes')
		userInteractionMock.configure(UserInteraction.questionDeleteProcedure('CreateValidGiven'), 'Yes')
		userInteractionMock.configure(UserInteraction.questionDeleteProcedure('ValidWhen'), 'Yes')
		userInteractionMock.configure(UserInteraction.questionDeleteProcedure('VerifyValidThen'), 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock))
			await TestHelper.verifyResult(messageUpdate, 'scenario058.al');
	})
	test('Scenario 059 - Remove Scenario step 2b', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')
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
		let userInteractionMock = new UserInteractionMock();
		let confirmDeletionOfScenarioQuestion: string = 'Do you want to delete this scenario?';
		userInteractionMock.configure(confirmDeletionOfScenarioQuestion, 'No')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock)
	})
	test('Scenario 060 - Remove Scenario step 3b', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')
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
		let userInteractionMock = new UserInteractionMock();
		userInteractionMock.configure(UserInteraction.questionDeleteScenario(), 'Yes')
		userInteractionMock.configure(UserInteraction.questionDeleteProcedure('ValidWhen'), 'No')
		userInteractionMock.configure(UserInteraction.questionDeleteProcedure('CreateValidGiven'), 'No')
		userInteractionMock.configure(UserInteraction.questionDeleteProcedure('VerifyValidThen'), 'No')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock))
			await TestHelper.verifyResult(messageUpdate, 'scenario060.al');
	})
	test('Scenario 068 - Remove Scenario with Initialize', async () => {
		//Given Test codeunit with one test function with valid Given-When-Then structure and call to Initialize
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectWithInitialize.Codeunit.al')
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
		let userInteractionMock = new UserInteractionMock();
		userInteractionMock.configure(UserInteraction.questionDeleteScenario(), 'Yes')
		userInteractionMock.configure(UserInteraction.questionDeleteProcedure('CreateValidGiven'), 'Yes')
		userInteractionMock.configure(UserInteraction.questionDeleteProcedure('ValidWhen'), 'Yes')
		userInteractionMock.configure(UserInteraction.questionDeleteProcedure('VerifyValidThen'), 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock))
			await TestHelper.verifyResult(messageUpdate, 'scenario068.al');
	})
	test('Scenario 069 - Remove Scenario with UI Handler', async () => {
		//Given Test codeunit with one test function with valid Given-When-Then structure and UI Handler
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectWithUIHandler.Codeunit.al')
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
		let userInteractionMock = new UserInteractionMock();
		userInteractionMock.configure(UserInteraction.questionDeleteScenario(), 'Yes')
		userInteractionMock.configure(UserInteraction.questionDeleteProcedure('CreateValidGiven'), 'Yes')
		userInteractionMock.configure(UserInteraction.questionDeleteProcedure('ValidWhen'), 'Yes')
		userInteractionMock.configure(UserInteraction.questionDeleteProcedure('VerifyValidThen'), 'Yes')
		userInteractionMock.configure(UserInteraction.questionDeleteProcedure('AMessageHandler'), 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock))
			await TestHelper.verifyResult(messageUpdate, 'scenario069.al');
	})
	test('Scenario 070 - Remove Scenario with UI Handler 2', async () => {
		//Given Test codeunit with one test function with valid Given-When-Then structure and UI Handler
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectWithUIHandler.Codeunit.al')
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
		let userInteractionMock = new UserInteractionMock();
		userInteractionMock.configure(UserInteraction.questionDeleteScenario(), 'Yes')
		userInteractionMock.configure(UserInteraction.questionDeleteProcedure('CreateValidGiven'), 'Yes')
		userInteractionMock.configure(UserInteraction.questionDeleteProcedure('ValidWhen'), 'Yes')
		userInteractionMock.configure(UserInteraction.questionDeleteProcedure('VerifyValidThen'), 'Yes')
		userInteractionMock.configure(UserInteraction.questionDeleteProcedure('AMessageHandler'), 'No')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock))
			await TestHelper.verifyResult(messageUpdate, 'scenario070.al');
	})
	test('Scenario 071 - Removal Mode "No confirmation, but removal"', async () => {
		//Given Test codeunit with one test function with valid Given-When-Then structure and call to Initialize
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectWithInitialize.Codeunit.al')
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
		let userInteractionMock = new UserInteractionMock();
		let confirmDeletionOfScenarioQuestion: string = 'Do you want to delete this scenario?';
		userInteractionMock.configure(confirmDeletionOfScenarioQuestion, 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock))
			await TestHelper.verifyResult(messageUpdate, 'scenario071.al');
	})
	test('Scenario 072 - Removal Mode "No confirmation & no removal"', async () => {
		//Given Test codeunit with one test function with valid Given-When-Then structure and call to Initialize
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectWithInitialize.Codeunit.al')
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
		let userInteractionMock = new UserInteractionMock();
		let confirmDeletionOfScenarioQuestion: string = 'Do you want to delete this scenario?';
		userInteractionMock.configure(confirmDeletionOfScenarioQuestion, 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock))
			await TestHelper.verifyResult(messageUpdate, 'scenario072.al');
	})
});

