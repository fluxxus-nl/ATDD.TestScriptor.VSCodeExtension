import * as assert from 'assert';
import { readFileSync } from 'fs';
import { writeFileSync } from "fs-extra";
import { TextDocument, Uri, workspace, WorkspaceFolder } from 'vscode';
import { ObjectService } from '../App logic/Services/ObjectService';
import { Message, MessageState, MessageUpdate, TypeChanged } from '../typings/types';


suite('Extension Test Suite', function () {
	let testDoc: TextDocument;
	let testDocUndef: TextDocument | undefined;
	let originalText: string | undefined;

	async function openOriginalFileOnce() {
		if (!testDocUndef) {
			let uri: Uri[] = await workspace.findFiles('**/*Cod75651.UnblockDeletionDisabledFLX.al');
			if (!uri)
				throw new Error('File not found.');
			await workspace.openTextDocument(uri[0]).then(doc => testDocUndef = doc);
			testDoc = getDoc(testDocUndef);
			originalText = testDoc.getText();
		}
	}
	function restoreOriginalFileContent(testDoc: TextDocument, originalText: string | undefined) {
		writeFileSync(testDoc.uri.fsPath, originalText as string, { encoding: 'utf16le' });
	}
	function getDoc(doc: TextDocument | undefined): TextDocument {
		return doc as TextDocument;
	}
	this.beforeAll(async function () {
		await openOriginalFileOnce();
	});
	this.afterEach(async function () {
		restoreOriginalFileContent(testDoc, originalText);
	});

	test('get Scenarios', async () => {
		let workspaceFolders: WorkspaceFolder[] = workspace.workspaceFolders as WorkspaceFolder[];
		let fsPaths: string[] = [];
		workspaceFolders.forEach(workspaceFolder => fsPaths.push(workspaceFolder.uri.fsPath));
		let result: Message[] = await new ObjectService().getObjects(fsPaths);
		assert.notStrictEqual(result, null, 'Scenarios should be found.');
		assert.strictEqual(result.length, 11);
		assert.strictEqual(result[0].Feature, 'Unblock Deletion of Whse. Shpt. Line disabled');
		assert.strictEqual(result[0].Scenario, 'Delete by user with no allowance manually created whse. shpt. line');
		assert.strictEqual(result[0].Id, 5);
		assert.strictEqual(result[0].MethodName, 'DeleteByUserWithNoAllowanceManuallyCreatedWhseShptLine');
		assert.strictEqual(result[0].Details.given.length, 2, 'Expected 2 given element.');
		assert.strictEqual(result[0].Details.given[0], 'Warehouse employee for current user with no allowance');
		assert.strictEqual(result[0].Details.given[1], 'Manually created warehouse shipment from released sales order with one line with require shipment location');
		assert.strictEqual(result[0].Details.when.length, 1, 'Expected 1 when element.');
		assert.strictEqual(result[0].Details.when[0], 'Delete warehouse shipment line');
		assert.strictEqual(result[0].Details.then.length, 1, 'Expected 1 then element.');
		assert.strictEqual(result[0].Details.then[0], 'Warehouse shipment line is deleted');
	});

	test('check deletion of element procedure used once', async () => {
		let messageUpdate: MessageUpdate = {
			Scenario: 'Delete by user with no allowance automatically created whse. shpt. line',
			Feature: 'Unblock Deletion of Whse. Shpt. Line disabled',
			Type: TypeChanged.Then,
			State: MessageState.Deleted,
			OldValue: 'Error disallowing deletion',
			NewValue: '',
			FsPath: testDoc.uri.fsPath,
			Project: 'Testing Blocking Deletion of Warehouse Shipment Lines (app)',
			DeleteProcedure: false
		};
		let config: any;
		messageUpdate.DeleteProcedure = await new ObjectService().checkSaveChanges(messageUpdate, config);
		assert.strictEqual(messageUpdate.DeleteProcedure, true);
	});

	test('check deletion of element procedure used twice', async () => {
		let messageUpdate: MessageUpdate = {
			Scenario: 'Delete by user with no allowance manually created whse. shpt. line',
			Feature: 'Unblock Deletion of Whse. Shpt. Line disabled',
			Type: TypeChanged.Given,
			State: MessageState.Deleted,
			OldValue: 'Warehouse employee for current user with no allowance',
			NewValue: '',
			FsPath: testDoc.uri.fsPath,
			Project: 'Testing Blocking Deletion of Warehouse Shipment Lines (app)',
			DeleteProcedure: false
		};
		let config: any;
		messageUpdate.DeleteProcedure = await new ObjectService().checkSaveChanges(messageUpdate, config);
		assert.strictEqual(messageUpdate.DeleteProcedure, false);
	});

	test('add given under existing ones', async () => {
		let messageUpdate: MessageUpdate = {
			Scenario: 'Delete by user with no allowance manually created whse. shpt. line',
			Feature: 'Unblock Deletion of Whse. Shpt. Line disabled',
			Type: TypeChanged.Given,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'Test DFE',
			FsPath: testDoc.uri.fsPath,
			Project: 'Testing Blocking Deletion of Warehouse Shipment Lines (app)',
			DeleteProcedure: false
		};
		let config: any;
		let successful = await new ObjectService().saveChanges(messageUpdate, config);
		assert.strictEqual(successful, true);
	});
	test('add scenario to feature', async () => {
		let messageUpdate: MessageUpdate = {
			Scenario: '',
			Id: 12,
			Feature: 'Unblock Deletion of Whse. Shpt. Line disabled',
			Type: TypeChanged.ScenarioName,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'My new Test-Scenario',
			FsPath: '',
			Project: 'Testing Blocking Deletion of Warehouse Shipment Lines (app)',
			DeleteProcedure: false
		};
		let config: any;
		let successful = await new ObjectService().saveChanges(messageUpdate, config);
		assert.strictEqual(successful, true);
		let uris: Uri[] = await workspace.findFiles('**/Cod75651.UnblockDeletionDisabledFLX.al');
		assert.strictEqual(uris.length, 1);
		let fileContent = readFileSync(uris[0].fsPath, { encoding: 'utf16le' });
		let expectedProcedure: string[] = [
			'    [Test]',
			'    local procedure MyNewTest-scenario()',
			'    // [Feature] Unblock Deletion of Whse. Shpt. Line disabled',
			'    begin',
			'        // [Scenario #0012] My new Test-Scenario',
			'    end;'
		];
		let expectedProcedureSingleLine = expectedProcedure.join('\r\n');
		assert.strictEqual(fileContent.includes(expectedProcedureSingleLine), true);
	})
});
