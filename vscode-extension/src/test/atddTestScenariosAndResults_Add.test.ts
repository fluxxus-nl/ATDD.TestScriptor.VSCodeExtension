import { Uri, workspace } from 'vscode';
import { MessageState, MessageUpdate, TypeChanged } from '../typings/types';
import { TestHelper } from './testHelper';


suite('Add', function () {
	this.beforeAll(async function () {
		await TestHelper.resetFiles();
	})
	this.beforeEach(async function () {
		await TestHelper.resetConfigurations();
	});
	
	test('Scenario 001 - Add New Given', async () => {
		//Given Test function with valid Given-When-Then structure
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')
		//When Add Given "New Given"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Given,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'New Given',
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		await TestHelper.verifyResult(messageUpdate, 'scenario001.al');
	})
	test('Scenario 002 - Add New Given 2', async () => {
		//Given Result from scenario 1
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')
		//When Add Given "New Given 2"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Given,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'New Given 2',
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		await TestHelper.verifyResult(messageUpdate, 'scenario002.al');
	})
	test('Scenario 003 - Add duplicate Given', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')
		//When Add Given "Valid Given"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Given,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'Valid Given',
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		await TestHelper.verifyResult(messageUpdate, 'scenario003.al');
	})
	test('Scenario 010 - Add New Given with non-alphabetic or non-numerical characters', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles()

		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')
		//When Add Given "New Given !@#$%^&*()"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Given,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'New Given !@#$%^&*()',
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		await TestHelper.verifyResult(messageUpdate, 'scenario010.al');
	})
	test('Scenario 012 - Add New Given with only lowercase characters', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles()

		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')
		//When Add Given "new given all lowercase"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Given,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'new given all lowercase',
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		await TestHelper.verifyResult(messageUpdate, 'scenario012.al');
	})
	test('Scenario 014 - Given prefix', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles()

		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')
		//Given Setting atddTestScriptor.prefixGiven equals Make
		await workspace.getConfiguration('atddTestScriptor', Uri.file(TestHelper.pathOfTestProject)).update('prefixGiven', 'Make');

		//When Add Given "New Given"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Given,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'New Given',
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		await TestHelper.verifyResult(messageUpdate, 'scenario014.al');
	})
	test('Scenario 061 - Given helper function with no exception', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles()

		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')
		//Given Setting atddTestScriptor.addException equals false
		await workspace.getConfiguration('atddTestScriptor', Uri.file(TestHelper.pathOfTestProject)).update('addException', false);

		//When Add Given "New Given"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Given,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'New Given',
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		await TestHelper.verifyResult(messageUpdate, 'scenario061.al');
	})

	test('Scenario 004 - Add New Then', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles()

		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')

		//When Add Then "New Then"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Then,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'New Then',
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		await TestHelper.verifyResult(messageUpdate, 'scenario004.al');
	})
	test('Scenario 005 - Add New Then 2', async () => {
		//Given Result from scenario 4
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')

		//When Add Then "New Then 2"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Then,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'New Then 2',
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		await TestHelper.verifyResult(messageUpdate, 'scenario005.al');
	})
	test('Scenario 011 - Add New Then with non-alphabetic or non-numerical characters', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')

		//When Add Then "New Then !@#$%^&*()"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Then,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'New Then !@#$%^&*()',
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		await TestHelper.verifyResult(messageUpdate, 'scenario011.al');
	})
	test('Scenario 013 - Add New Then with only lowercase characters', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')

		//When Add Then "new then all lowercase"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Then,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'new then all lowercase',
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		await TestHelper.verifyResult(messageUpdate, 'scenario013.al');
	})
	test('Scenario 015 - Then prefix', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')
		//Given Setting atddTestScriptor.prefixThen equals Check
		await workspace.getConfiguration('atddTestScriptor', Uri.file(TestHelper.pathOfTestProject)).update('prefixThen', 'Check')

		//When Add Then "New Then"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Then,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'New Then',
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		await TestHelper.verifyResult(messageUpdate, 'scenario015.al');
	})
	test('Scenario 062 - Then helper function with no exception', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')
		//Given Setting atddTestScriptor.addException equals false
		await workspace.getConfiguration('atddTestScriptor', Uri.file(TestHelper.pathOfTestProject)).update('addException', false)

		//When Add Then "New Then"
		let messageUpdate: MessageUpdate = {
			Scenario: 'First test function with valid Given-When-Then structure',
			Feature: 'First test object',
			Type: TypeChanged.Then,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'New Then',
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		await TestHelper.verifyResult(messageUpdate, 'scenario062.al');
	})
});

