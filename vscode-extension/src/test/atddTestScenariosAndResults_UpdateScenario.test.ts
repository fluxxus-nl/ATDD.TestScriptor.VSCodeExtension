import { ObjectService } from '../App logic/Services/ObjectService';
import { UserInteractionMock } from '../App logic/Utils/userInteraction';
import { MessageState, MessageUpdate, TypeChanged } from '../typings/types';
import { TestHelper } from './testHelper';


suite('Update Scenario', function () {
	this.beforeAll(async function () {
		await TestHelper.resetFiles();
	})
	this.beforeEach(async function () {
		await TestHelper.resetConfigurations();
	});

	test('Scenario 081 - Rename scenario step 2a', async () => {
		//Given Test function with valid Given-When-Then structure
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')
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

		let userInteractionMock = new UserInteractionMock();
		let confirmUpdateOfScenarioQuestion: string = 'Do you want to update this scenario?';
		userInteractionMock.configure(confirmUpdateOfScenarioQuestion, 'Yes')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		if (await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock))
			await TestHelper.verifyResult(messageUpdate, 'scenario081.al');
	})
	test('Scenario 082 - Rename scenario step 2b', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')
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
		let userInteractionMock = new UserInteractionMock();
		let confirmUpdateOfScenarioQuestion: string = 'Do you want to update this scenario?';
		userInteractionMock.configure(confirmUpdateOfScenarioQuestion, 'No')
		await TestHelper.verifyChangeIsValid(messageUpdate);
		await TestHelper.verifyUserQuestions(messageUpdate, userInteractionMock)
	})
	test('Scenario 083 - Rename to already existing scenario name', async () => {
		//Given Test function with valid Given-When-Then structure
		await TestHelper.resetFiles();
		let fsPath: string = TestHelper.getFsPathOfTestProject('TestObject.Codeunit.al')
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
});