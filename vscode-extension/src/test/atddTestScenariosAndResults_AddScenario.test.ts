import { ObjectService } from '../App logic/Services/ObjectService';
import { MessageState, MessageUpdate, TypeChanged } from '../typings/types';
import { TestHelper } from './testHelper';


suite('Extension Test Suite', async function () {
	this.beforeAll(async function () {
		await TestHelper.resetFiles();
	})
	this.beforeEach(async function () {
		await TestHelper.resetConfigurations();
	});

	test('Scenario055', async () => {
		//Given Test function with valid Given-When-Then structure
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectFLX.Codeunit.al')
		//When User selects "Add Scenario" action
		let messageUpdate: MessageUpdate = {
			Scenario: '',
			Feature: 'First test object',
			Type: TypeChanged.ScenarioName,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'New Scenario (2)',
			Id: 2,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		await TestHelper.verifyChangeIsValid(messageUpdate);
		await TestHelper.verifyResult(messageUpdate, 'scenario055.al');
	})
	test('Scenario073', async () => {
		//Given Result from scenario 55
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectFLX.Codeunit.al')
		//When User selects "Add Scenario" action
		let messageUpdate: MessageUpdate = {
			Scenario: '',
			Feature: 'First test object',
			Type: TypeChanged.ScenarioName,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'New Scenario (3)',
			Id: 3,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		//Then
		await TestHelper.verifyChangeIsValid(messageUpdate);
		await TestHelper.verifyResult(messageUpdate, 'scenario073.al');
	})
	test('Scenario078', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectFLX.Codeunit.al')
		//Given Added scenario
		let messageUpdate: MessageUpdate = {
			Scenario: '',
			Feature: 'First test object',
			Type: TypeChanged.ScenarioName,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'New Scenario (2)',
			Id: 2,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		await new ObjectService().saveChanges(messageUpdate);
		//When Adding Given-When-Then
		messageUpdate = {
			Scenario: 'New Scenario (2)',
			Feature: 'First test object',
			Type: TypeChanged.Given,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'New Given',
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		await new ObjectService().saveChanges(messageUpdate);
		messageUpdate.Type = TypeChanged.When
		messageUpdate.NewValue = 'New When'
		await new ObjectService().saveChanges(messageUpdate);
		messageUpdate.Type = TypeChanged.Then
		messageUpdate.NewValue = 'New Then'
		//Then
		await TestHelper.verifyChangeIsValid(messageUpdate);
		await TestHelper.verifyResult(messageUpdate, 'scenario078.al');
	})
	test('Scenario079', async () => {
		//Given Test function with valid Given-When-Then structure
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObjectFLX.Codeunit.al')
		//Given Added scenario
		let messageUpdate: MessageUpdate = {
			Scenario: '',
			Feature: 'First test object',
			Type: TypeChanged.ScenarioName,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'New Scenario (3)',
			Id: 3,
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		await new ObjectService().saveChanges(messageUpdate);
		//When Adding Given-When-Then
		messageUpdate = {
			Scenario: 'New Scenario (3)',
			Feature: 'First test object',
			Type: TypeChanged.Given,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'New Given',
			FsPath: fsPath,
			Project: 'Test Project' //name of project in app.json
		}
		await new ObjectService().saveChanges(messageUpdate);
		messageUpdate.Type = TypeChanged.When
		messageUpdate.NewValue = 'New When'
		await new ObjectService().saveChanges(messageUpdate);
		messageUpdate.Type = TypeChanged.Then
		messageUpdate.NewValue = 'New Then'
		//Then
		await TestHelper.verifyChangeIsValid(messageUpdate);
		await TestHelper.verifyResult(messageUpdate, 'scenario079.al');
	})
});

