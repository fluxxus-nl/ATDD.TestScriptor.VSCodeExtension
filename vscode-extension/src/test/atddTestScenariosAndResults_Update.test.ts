import { Uri, workspace } from 'vscode';
import { ObjectService } from '../App logic/Services/ObjectService';
import { UserInteractionMock } from '../App logic/Utils/userInteraction';
import { MessageState, MessageUpdate, TypeChanged } from '../typings/types';
import { TestHelper } from './testHelper';


suite('Update', function () {

	this.beforeAll(async function () {
		await TestHelper.resetFiles();
	})
	this.beforeEach(async function () {
		await TestHelper.resetConfigurations();
	});

	// Given
	test('Scenario 016 - Rename "Valid Given" to "Renamed Valid Given"', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')

		//When Rename "Valid Given" to "Renamed Valid Given"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Given,
			State: MessageState.Modified,
			OldValue: 'Valid Given',
			NewValue: 'Renamed Valid Given',
			ArrayIndex: 0,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let userInteractionMock = new UserInteractionMock();
		let confirmUpdateOfElementQuestion: string = 'Do you want to update this element?';
		userInteractionMock.configure(confirmUpdateOfElementQuestion, 'No')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock)
	})
	test('Scenario 017 - Rename "Valid Given" to "Renamed Valid Given" step 2a', async () => {
		//Given Result from scenario 16
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')

		//When User confirms update
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Given,
			State: MessageState.Modified,
			OldValue: 'Valid Given',
			NewValue: 'Renamed Valid Given',
			ArrayIndex: 0,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let userInteractionMock = new UserInteractionMock();
		let confirmUpdateOfElementQuestion: string = 'Do you want to update this element?';
		userInteractionMock.configure(confirmUpdateOfElementQuestion, 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock))
			await TestHelper.verifyResult(messageUpdate, 'scenario017.al')
	})
	test('Scenario 019 - Revert Rename of Given step 2', async () => {
		//Given Result from scenario 16
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')

		//When User confirms update
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Given,
			State: MessageState.Modified,
			OldValue: 'Renamed Valid Given',
			NewValue: 'Valid Given',
			ArrayIndex: 0,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let userInteractionMock = new UserInteractionMock();
		let confirmUpdateOfElementQuestion: string = 'Do you want to update this element?';
		userInteractionMock.configure(confirmUpdateOfElementQuestion, 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock))
			await TestHelper.verifyResult(messageUpdate, 'scenario019.al')
	})
	test('Scenario 044 - Rename with other prefix', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')
		//Given Setting atddTestScriptor.prefixGiven equals Make
		await workspace.getConfiguration('atddTestScriptor', Uri.file(TestHelper.pathOfTestProject)).update('prefixGiven', 'Make');
		//Given Setting atddTestScriptor.prefixGivenHistory contains Create
		await workspace.getConfiguration('atddTestScriptor', Uri.file(TestHelper.pathOfTestProject)).update('prefixGivenHistory', ['Create']);

		//When Renamed "Valid Given" to "Renamed Valid Given"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Given,
			State: MessageState.Modified,
			OldValue: 'Valid Given',
			NewValue: 'Renamed Valid Given',
			ArrayIndex: 0,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let userInteractionMock = new UserInteractionMock();
		let confirmUpdateOfElementQuestion: string = 'Do you want to update this element?';
		userInteractionMock.configure(confirmUpdateOfElementQuestion, 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock))
			await TestHelper.verifyResult(messageUpdate, 'scenario044.al')
	})
	test('Scenario 087 - Rename with other prefix 2', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')
		//Given Setting atddTestScriptor.prefixGiven equals Make
		await workspace.getConfiguration('atddTestScriptor', Uri.file(TestHelper.pathOfTestProject)).update('prefixGiven', 'Make');
		//Given Setting atddTestScriptor.prefixGivenHistory does not contain Create
		//settings are reset in beforeeach

		//When Renamed "Valid Given" to "Renamed Valid Given"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Given,
			State: MessageState.Modified,
			OldValue: 'Valid Given',
			NewValue: 'Renamed Valid Given',
			ArrayIndex: 0,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let userInteractionMock = new UserInteractionMock();
		let confirmUpdateOfElementQuestion: string = 'Do you want to update this element?';
		userInteractionMock.configure(confirmUpdateOfElementQuestion, 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock))
			await TestHelper.verifyResult(messageUpdate, 'scenario087.al')
	})
	test('Scenario 051 - Rename duplicate Given', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al');

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

		//When Renamed "Valid Given" to "Renamed Valid Given"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Given,
			State: MessageState.Modified,
			OldValue: 'Valid Given',
			NewValue: 'Renamed Valid Given',
			ArrayIndex: 1,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let userInteractionMock = new UserInteractionMock();
		let confirmUpdateOfElementQuestion: string = 'Do you want to update this element?';
		userInteractionMock.configure(confirmUpdateOfElementQuestion, 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock))
			await TestHelper.verifyResult(messageUpdate, 'scenario051.al')
	})

	//When
	test('Scenario 021 - Rename "Valid When" to "Renamed Valid When" step 2a', async () => {
		//Given Result from scenario 20
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')

		//When Renamed "Valid When" to "Renamed Valid When"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.When,
			State: MessageState.Modified,
			OldValue: 'Valid When',
			NewValue: 'Renamed Valid When',
			ArrayIndex: 0,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let userInteractionMock = new UserInteractionMock();
		let confirmUpdateOfElementQuestion: string = 'Do you want to update this element?';
		userInteractionMock.configure(confirmUpdateOfElementQuestion, 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock))
			await TestHelper.verifyResult(messageUpdate, 'scenario021.al')
	})
	test('Scenario 023 - Revert Rename of When step 2', async () => {
		//Given Result from scenario 21
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')

		//When Renamed "Renamed Valid When" to "Valid When"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.When,
			State: MessageState.Modified,
			OldValue: 'Renamed Valid When',
			NewValue: 'Valid When',
			ArrayIndex: 0,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let userInteractionMock = new UserInteractionMock();
		let confirmUpdateOfElementQuestion: string = 'Do you want to update this element?';
		userInteractionMock.configure(confirmUpdateOfElementQuestion, 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock))
			await TestHelper.verifyResult(messageUpdate, 'scenario023.al')
	})
	test('Scenario 047 - Rename "Valid When" to "Renamed Valid When" step 2b', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')

		//When Rename "Valid When" to "Renamed Valid When"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.When,
			State: MessageState.Modified,
			OldValue: 'Valid When',
			NewValue: 'Renamed Valid When',
			ArrayIndex: 0,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let userInteractionMock = new UserInteractionMock();
		let confirmUpdateOfElementQuestion: string = 'Do you want to update this element?';
		userInteractionMock.configure(confirmUpdateOfElementQuestion, 'No')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock)
	})

	// Then
	test('Scenario 025 - Rename "Valid Then" to "Renamed Valid Then" step 2a', async () => {
		//Given Test function with Valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')

		//When Renamed "Valid Then" to "Renamed Valid Then"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Then,
			State: MessageState.Modified,
			OldValue: 'Valid Then',
			NewValue: 'Renamed Valid Then',
			ArrayIndex: 0,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let userInteractionMock = new UserInteractionMock();
		let confirmUpdateOfElementQuestion: string = 'Do you want to update this element?';
		userInteractionMock.configure(confirmUpdateOfElementQuestion, 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock))
			await TestHelper.verifyResult(messageUpdate, 'scenario025.al')
	})
	test('Scenario 027 - Revert Rename of Then step 2', async () => {
		//Given Result from scenario 25
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')

		//When Rename "Renamed Valid Then" to "Valid Then"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Then,
			State: MessageState.Modified,
			OldValue: 'Renamed Valid Then',
			NewValue: 'Valid Then',
			ArrayIndex: 0,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let userInteractionMock = new UserInteractionMock();
		let confirmUpdateOfElementQuestion: string = 'Do you want to update this element?';
		userInteractionMock.configure(confirmUpdateOfElementQuestion, 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock))
			await TestHelper.verifyResult(messageUpdate, 'scenario027.al')
	})
	test('Scenario 048 - Rename "Valid Then" to "Renamed Valid Then" step 2b', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')

		//When Rename "Valid Then" to "Renamed Valid Then"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Then,
			State: MessageState.Modified,
			OldValue: 'Valid Then',
			NewValue: 'Renamed Valid Then',
			ArrayIndex: 0,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let userInteractionMock = new UserInteractionMock();
		let confirmUpdateOfElementQuestion: string = 'Do you want to update this element?';
		userInteractionMock.configure(confirmUpdateOfElementQuestion, 'No')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock)
	})
	test('Scenario 049 - Rename with other prefix', async () => {
		//Given Test function with Valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')
		//Given Setting atddTestScriptor.prefixThen equals Check
		await workspace.getConfiguration('atddTestScriptor', Uri.file(TestHelper.pathOfTestProject)).update('prefixThen', 'Check');
		//Given Setting atddTestScriptor.prefixThenHistory contains Verify
		await workspace.getConfiguration('atddTestScriptor', Uri.file(TestHelper.pathOfTestProject)).update('prefixThenHistory', ['Verify']);

		//When Renamed "Valid Then" to "Renamed Valid Then"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Then,
			State: MessageState.Modified,
			OldValue: 'Valid Then',
			NewValue: 'Renamed Valid Then',
			ArrayIndex: 0,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let userInteractionMock = new UserInteractionMock();
		let confirmUpdateOfElementQuestion: string = 'Do you want to update this element?';
		userInteractionMock.configure(confirmUpdateOfElementQuestion, 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock))
			await TestHelper.verifyResult(messageUpdate, 'scenario049.al')
	})
	test('Scenario 088 - Rename with other prefix', async () => {
		//Given Test function with Valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')
		//Given Setting atddTestScriptor.prefixThen equals Check
		await workspace.getConfiguration('atddTestScriptor', Uri.file(TestHelper.pathOfTestProject)).update('prefixThen', 'Check');
		//Given Setting atddTestScriptor.prefixThenHistory does not contain Verify
		//setting is reset in beforeeach

		//When Renamed "Valid Then" to "Renamed Valid Then"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Then,
			State: MessageState.Modified,
			OldValue: 'Valid Then',
			NewValue: 'Renamed Valid Then',
			ArrayIndex: 0,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let userInteractionMock = new UserInteractionMock();
		let confirmUpdateOfElementQuestion: string = 'Do you want to update this element?';
		userInteractionMock.configure(confirmUpdateOfElementQuestion, 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock))
			await TestHelper.verifyResult(messageUpdate, 'scenario088.al')
	})
	test('Scenario 053 - Rename duplicate Then', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al');

		//Given Duplicate "Valid Then"
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

		//When Renamed "Valid Then" to "Renamed Valid Then"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Then,
			State: MessageState.Modified,
			OldValue: 'Valid Then',
			NewValue: 'Renamed Valid Then',
			ArrayIndex: 1,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		let userInteractionMock = new UserInteractionMock();
		let confirmUpdateOfElementQuestion: string = 'Do you want to update this element?';
		userInteractionMock.configure(confirmUpdateOfElementQuestion, 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock))
			await TestHelper.verifyResult(messageUpdate, 'scenario053.al')
	})
});

