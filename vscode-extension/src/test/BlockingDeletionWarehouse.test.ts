import * as assert from 'assert';
import * as fs from 'fs';
import { TextDocument, Uri, workspace } from 'vscode';
import { ObjectService } from '../App logic/Services/ObjectService';
import { Message, MessageState, MessageUpdate, TypeChanged } from '../typings/types';
// import * as vscode from 'vscode';


suite('Extension Test Suite', function () {
	let testDoc: TextDocument;
	let testDocUndef: TextDocument | undefined;
	let originalText: string;
	this.timeout(0);

	async function openFile() {
		// this.timeout(0);
		let uri: Uri[] = await workspace.findFiles('**/*Cod75651.UnblockDeletionDisabledFLX.al');
		if (!uri)
			throw new Error('File not found.');
		await workspace.openTextDocument(uri[0]).then(doc => testDocUndef = doc);
	}
	beforeEach(function () {
		if (!testDocUndef) {
			openFile();
			testDoc = (testDocUndef as unknown) as TextDocument;
			originalText = testDoc.getText();
		}
		fs.writeFileSync(testDoc.uri.fsPath, originalText, { encoding: 'utf8' });
	})

	test('get Scenarios', async () => {
		let result: Message[] = await new ObjectService().getObjects([]);
		assert.notEqual(result, null, 'Scenarios should be found.');
		assert.equal(result.length, 11);
		assert.equal(result[0].Feature, 'Unblock Deletion of Whse. Shpt. Line disabled');
		assert.equal(result[0].Scenario, 'Delete by user with no allowance manually created whse. shpt. line');
		assert.equal(result[0].Id, 5);
		assert.equal(result[0].MethodName, 'DeleteByUserWithNoAllowanceManuallyCreatedWhseShptLine');
		assert.equal(result[0].Details.given.length, 2, 'Expected 2 given element.');
		assert.equal(result[0].Details.given[0], 'Warehouse employee for current user with no allowance');
		assert.equal(result[0].Details.given[1], 'Manually created warehouse shipment from released sales order with one line with require shipment location');
		assert.equal(result[0].Details.when.length, 1, 'Expected 1 when element.');
		assert.equal(result[0].Details.when[0], 'Delete warehouse shipment line');
		assert.equal(result[0].Details.then.length, 1, 'Expected 1 then element.');
		assert.equal(result[0].Details.then[0], 'Warehouse shipment line is deleted');
	});

	test('check deletion of element procedure used once', async () => {
		let messageUpdate: MessageUpdate = {
			Scenario: 'Delete by user with no allowance automatically created whse. shpt. line',
			Type: TypeChanged.Then,
			State: MessageState.Deleted,
			OldValue: 'Error disallowing deletion',
			NewValue: '',
			FsPath: testDoc.uri.fsPath,
			Project: 'test', //TODO: Update project
			DeleteProcedure: false
		};
		let config: any;
		messageUpdate.DeleteProcedure = await new ObjectService().checkSaveChanges(messageUpdate, config);
		assert.equal(messageUpdate.DeleteProcedure, true);
	});

	test('check deletion of element procedure used twice', async () => {
		let messageUpdate: MessageUpdate = {
			Scenario: 'Delete by user with no allowance manually created whse. shpt. line',
			Type: TypeChanged.Given,
			State: MessageState.Deleted,
			OldValue: 'Warehouse employee for current user with no allowance',
			NewValue: '',
			FsPath: testDoc.uri.fsPath,
			Project: 'test', //TODO: Update project
			DeleteProcedure: false
		};
		let config: any;
		messageUpdate.DeleteProcedure = await new ObjectService().checkSaveChanges(messageUpdate, config);
		assert.equal(messageUpdate.DeleteProcedure, false);
	});

	test('add given under existing ones', async () => {
		let messageUpdate: MessageUpdate = {
			Scenario: 'Delete by user with no allowance manually created whse. shpt. line',
			Type: TypeChanged.Given,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'Test DFE',
			FsPath: testDoc.uri.fsPath,
			Project: 'test', //TODO: Update project
			DeleteProcedure: false
		};
		let config: any;
		//TODO: Problem: File is saved afterwards. How to reset?
		let successful = await new ObjectService().saveChanges(messageUpdate, config);
		assert.equal(successful, true);
	});
});