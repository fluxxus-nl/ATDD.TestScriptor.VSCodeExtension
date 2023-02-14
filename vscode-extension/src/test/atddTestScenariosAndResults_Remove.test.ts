import { ObjectService } from '../App logic/Services/ObjectService';
import { UserInteraction, UserInteractionMock } from '../App logic/Utils/userInteraction';
import { MessageState, MessageUpdate, TypeChanged } from '../typings/types';
import { TestHelper } from './testHelper';


suite('Remove', function () {

	this.beforeAll(async function () {
		await TestHelper.resetFiles();
	})
	this.beforeEach(async function () {
		await TestHelper.resetConfigurations();
	});

	test('Scenario030', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')

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
		let userInteractionMock = new UserInteractionMock();
		userInteractionMock.configure(UserInteraction.questionDeleteElement(), 'Yes')
		userInteractionMock.configure(UserInteraction.questionDeleteProcedure('CreateValidGiven'), 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock))
			await TestHelper.verifyResult(messageUpdate, 'scenario030.al')
	})
	test('Scenario036', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')

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
		let userInteractionMock = new UserInteractionMock();
		userInteractionMock.configure(UserInteraction.questionDeleteElement(), 'No')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock);
	})
	test('Scenario032', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')

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
		let userInteractionMock = new UserInteractionMock();
		userInteractionMock.configure(UserInteraction.questionDeleteElement(), 'Yes')
		userInteractionMock.configure(UserInteraction.questionDeleteProcedure('CreateValidGiven'), 'No')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock))
			await TestHelper.verifyResult(messageUpdate, 'scenario032.al')
	})
	test('Scenario038', async () => {
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
		let userInteractionMock = new UserInteractionMock();
		userInteractionMock.configure(UserInteraction.questionDeleteElement(), 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock))
			await TestHelper.verifyResult(messageUpdate, 'scenario038.al')
	})
	test('Scenario040', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al');

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
		let userInteractionMock = new UserInteractionMock();
		userInteractionMock.configure(UserInteraction.questionDeleteElement(), 'Yes')
		userInteractionMock.configure(UserInteraction.questionDeleteProcedure('CreateNewGiven'), 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock))
			await TestHelper.verifyResult(messageUpdate, 'scenario040.al')
	})
	test('Scenario041', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al');

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
		let userInteractionMock = new UserInteractionMock();
		userInteractionMock.configure(UserInteraction.questionDeleteElement(), 'No')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock))
			await TestHelper.verifyResult(messageUpdate, 'scenario041.al')
	})


	test('Scenario035', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')

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
		let userInteractionMock = new UserInteractionMock();
		userInteractionMock.configure(UserInteraction.questionDeleteElement(), 'Yes')
		userInteractionMock.configure(UserInteraction.questionDeleteProcedure('VerifyValidThen'), 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock))
			await TestHelper.verifyResult(messageUpdate, 'scenario035.al')
	})
	test('Scenario036', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')

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
		let userInteractionMock = new UserInteractionMock();
		userInteractionMock.configure(UserInteraction.questionDeleteElement(), 'No')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock)
	})
	test('Scenario037', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')

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
		let userInteractionMock = new UserInteractionMock();
		userInteractionMock.configure(UserInteraction.questionDeleteElement(), 'Yes')
		userInteractionMock.configure(UserInteraction.questionDeleteProcedure('VerifyValidThen'), 'No')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock))
			await TestHelper.verifyResult(messageUpdate, 'scenario037.al')
	})
	test('Scenario039', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al');

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
		let userInteractionMock = new UserInteractionMock();
		userInteractionMock.configure(UserInteraction.questionDeleteElement(), 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock))
			await TestHelper.verifyResult(messageUpdate, 'scenario039.al')
	})
	test('Scenario042', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al');

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
		let userInteractionMock = new UserInteractionMock();
		userInteractionMock.configure(UserInteraction.questionDeleteElement(), 'Yes')
		userInteractionMock.configure(UserInteraction.questionDeleteProcedure('VerifyNewThen'), 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock))
			await TestHelper.verifyResult(messageUpdate, 'scenario042.al')
	})
	test('Scenario043', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al');

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
		let userInteractionMock = new UserInteractionMock();
		userInteractionMock.configure(UserInteraction.questionDeleteElement(), 'No')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock)
	})
});

