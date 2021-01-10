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

	test('Scenario030', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectFLX.Codeunit.al')

		//When Remove "Valid Given"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Given,
			State: MessageState.Deleted,
			OldValue: 'Valid Given',
			NewValue: '',
			ArrayIndex: 0,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let informationOutput = new TestInformationOutput();
		let confirmDeletionOfElementQuestion: string = 'Do you want to delete this element?';
		let confirmDeletionOfProcedureVariableQuestion = (procName: string) => `Do you want to delete the procedure '${procName}' ?`;
		informationOutput.configure(confirmDeletionOfElementQuestion, 'Yes')
		informationOutput.configure(confirmDeletionOfProcedureVariableQuestion('CreateValidGiven'), 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, informationOutput))
			await TestHelper.verifyResult(messageUpdate, 'scenario030.al', fsPath)
	})
	test('Scenario036', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectFLX.Codeunit.al')

		//When Remove "Valid Given"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Given,
			State: MessageState.Deleted,
			OldValue: 'Valid Given',
			NewValue: '',
			ArrayIndex: 0,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let informationOutput = new TestInformationOutput();
		let confirmDeletionOfElementQuestion: string = 'Do you want to delete this element?';
		informationOutput.configure(confirmDeletionOfElementQuestion, 'No')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		await TestHelper.verifyUserQuestions(messageUpdate, informationOutput);
	})
	test('Scenario032', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectFLX.Codeunit.al')

		//When Remove "Valid Given"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Given,
			State: MessageState.Deleted,
			OldValue: 'Valid Given',
			NewValue: '',
			ArrayIndex: 0,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let informationOutput = new TestInformationOutput();
		let confirmDeletionOfElementQuestion: string = 'Do you want to delete this element?';
		informationOutput.configure(confirmDeletionOfElementQuestion, 'Yes')
		let confirmDeletionOfProcedureVariableQuestion = (procName: string) => `Do you want to delete the procedure '${procName}' ?`;
		informationOutput.configure(confirmDeletionOfProcedureVariableQuestion('CreateValidGiven'), 'No')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, informationOutput))
			await TestHelper.verifyResult(messageUpdate, 'scenario032.al', fsPath)
	})
	test('Scenario038', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectFLX.Codeunit.al');

		//Given Duplicate "Valid Given"
		let messageUpdate1: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Given,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'Valid Given',
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		await new ObjectService().saveChanges(messageUpdate1);

		//When Removal of duplicate Given
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Given,
			State: MessageState.Deleted,
			OldValue: 'Valid Given',
			NewValue: '',
			ArrayIndex: 1,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let informationOutput = new TestInformationOutput();
		let confirmDeletionOfElementQuestion: string = 'Do you want to delete this element?';
		informationOutput.configure(confirmDeletionOfElementQuestion, 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, informationOutput))
			await TestHelper.verifyResult(messageUpdate, 'scenario038.al', fsPath)
	})
	test('Scenario040', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectFLX.Codeunit.al');

		//Given "New Given !@#$%^&*()"
		let messageUpdate1: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Given,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'New Given !@#$%^&*()',
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		await new ObjectService().saveChanges(messageUpdate1);

		//When Removed "New Given !@#$%^&*()"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Given,
			State: MessageState.Deleted,
			OldValue: 'New Given !@#$%^&*()',
			NewValue: '',
			ArrayIndex: 1,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let informationOutput = new TestInformationOutput();
		let confirmDeletionOfElementQuestion: string = 'Do you want to delete this element?';
		informationOutput.configure(confirmDeletionOfElementQuestion, 'Yes')
		let confirmDeletionOfProcedureVariableQuestion = (procName: string) => `Do you want to delete the procedure '${procName}' ?`;
		informationOutput.configure(confirmDeletionOfProcedureVariableQuestion('CreateNewGiven'), 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, informationOutput))
			await TestHelper.verifyResult(messageUpdate, 'scenario040.al', fsPath)
	})
	test('Scenario041', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectFLX.Codeunit.al');

		//Given "New Given !@#$%^&*()"
		let messageUpdate1: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Given,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'New Given !@#$%^&*()',
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		await new ObjectService().saveChanges(messageUpdate1);

		//When Removed "New Given !@#$%^&*()"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Given,
			State: MessageState.Deleted,
			OldValue: 'New Given !@#$%^&*()',
			NewValue: '',
			ArrayIndex: 1,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let informationOutput = new TestInformationOutput();
		let confirmDeletionOfElementQuestion: string = 'Do you want to delete this element?';
		informationOutput.configure(confirmDeletionOfElementQuestion, 'No')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, informationOutput))
			await TestHelper.verifyResult(messageUpdate, 'scenario041.al', fsPath)
	})


	test('Scenario035', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectFLX.Codeunit.al')

		//When Remove "Valid Then"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Then,
			State: MessageState.Deleted,
			OldValue: 'Valid Then',
			NewValue: '',
			ArrayIndex: 0,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let informationOutput = new TestInformationOutput();
		let confirmDeletionOfElementQuestion: string = 'Do you want to delete this element?';
		informationOutput.configure(confirmDeletionOfElementQuestion, 'Yes')
		let confirmDeletionOfProcedureVariableQuestion = (procName: string) => `Do you want to delete the procedure '${procName}' ?`;
		informationOutput.configure(confirmDeletionOfProcedureVariableQuestion('VerifyValidThen'), 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, informationOutput))
			await TestHelper.verifyResult(messageUpdate, 'scenario035.al', fsPath)
	})
	test('Scenario036', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectFLX.Codeunit.al')

		//When Remove "Valid Then"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Then,
			State: MessageState.Deleted,
			OldValue: 'Valid Then',
			NewValue: '',
			ArrayIndex: 0,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let informationOutput = new TestInformationOutput();
		let confirmDeletionOfElementQuestion: string = 'Do you want to delete this element?';
		informationOutput.configure(confirmDeletionOfElementQuestion, 'No')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		await TestHelper.verifyUserQuestions(messageUpdate, informationOutput)
	})
	test('Scenario037', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectFLX.Codeunit.al')

		//When Remove "Valid Then"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Then,
			State: MessageState.Deleted,
			OldValue: 'Valid Then',
			NewValue: '',
			ArrayIndex: 0,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let informationOutput = new TestInformationOutput();
		let confirmDeletionOfElementQuestion: string = 'Do you want to delete this element?';
		informationOutput.configure(confirmDeletionOfElementQuestion, 'Yes')
		let confirmDeletionOfProcedureVariableQuestion = (procName: string) => `Do you want to delete the procedure '${procName}' ?`;
		informationOutput.configure(confirmDeletionOfProcedureVariableQuestion('VerifyValidThen'), 'No')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, informationOutput))
			await TestHelper.verifyResult(messageUpdate, 'scenario037.al', fsPath)
	})
	test('Scenario039', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectFLX.Codeunit.al');

		//Given Duplicate Given "Valid Then"
		let messageUpdate1: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Then,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'Valid Then',
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		await new ObjectService().saveChanges(messageUpdate1);

		//When Removal of duplicate Then
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Then,
			State: MessageState.Deleted,
			OldValue: 'Valid Then',
			NewValue: '',
			ArrayIndex: 1,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let informationOutput = new TestInformationOutput();
		let confirmDeletionOfElementQuestion: string = 'Do you want to delete this element?';
		informationOutput.configure(confirmDeletionOfElementQuestion, 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, informationOutput))
			await TestHelper.verifyResult(messageUpdate, 'scenario039.al', fsPath)
	})
	test('Scenario042', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectFLX.Codeunit.al');

		//Given "New Then !@#$%^&*()"
		let messageUpdate1: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Then,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'New Then !@#$%^&*()',
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		await new ObjectService().saveChanges(messageUpdate1);

		//When Removed "New Then !@#$%^&*()"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Then,
			State: MessageState.Deleted,
			OldValue: 'New Then !@#$%^&*()',
			NewValue: '',
			ArrayIndex: 1,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let informationOutput = new TestInformationOutput();
		let confirmDeletionOfElementQuestion: string = 'Do you want to delete this element?';
		informationOutput.configure(confirmDeletionOfElementQuestion, 'Yes')
		let confirmDeletionOfProcedureVariableQuestion = (procName: string) => `Do you want to delete the procedure '${procName}' ?`;
		informationOutput.configure(confirmDeletionOfProcedureVariableQuestion('VerifyNewThen'), 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, informationOutput))
			await TestHelper.verifyResult(messageUpdate, 'scenario042.al', fsPath)
	})
	test('Scenario043', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectFLX.Codeunit.al');

		//Given "New Then !@#$%^&*()"
		let messageUpdate1: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Then,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'New Then !@#$%^&*()',
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		await new ObjectService().saveChanges(messageUpdate1);

		//When Removed "New Then !@#$%^&*()"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Then,
			State: MessageState.Deleted,
			OldValue: 'New Then !@#$%^&*()',
			NewValue: '',
			ArrayIndex: 1,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let informationOutput = new TestInformationOutput();
		let confirmDeletionOfElementQuestion: string = 'Do you want to delete this element?';
		informationOutput.configure(confirmDeletionOfElementQuestion, 'No')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		await TestHelper.verifyUserQuestions(messageUpdate, informationOutput)
	})
});

