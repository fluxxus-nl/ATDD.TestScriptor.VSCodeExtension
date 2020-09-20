import * as assert from 'assert';
import { readFileSync } from 'fs';
import { writeFileSync } from "fs-extra";
import { commands, TextDocument, Uri, window, workspace, WorkspaceFolder } from 'vscode';
import { FullSyntaxTreeNodeKind } from '../App logic/AL Code Outline Ext/fullSyntaxTreeNodeKind';
import { ALFullSyntaxTreeNode } from '../App logic/AL Code Outline/alFullSyntaxTreeNode';
import { SyntaxTree } from '../App logic/AL Code Outline/syntaxTree';
import { ObjectService } from '../App logic/Services/ObjectService';
import { Config } from '../App logic/Utils/config';
import { Message, MessageState, MessageUpdate, TypeChanged } from '../typings/types';


suite('Extension Test Suite', async function () {
	let testDoc: TextDocument;
	let originalText: any;

	async function openFile() {
		let uri: Uri[] = await workspace.findFiles('**/*Cod75651.UnblockDeletionDisabledFLX.al');
		if (!uri)
			throw new Error('File not found.');

		await workspace.openTextDocument(uri[0]).then(doc => testDoc = doc);
		originalText = readFileSync(testDoc.uri.fsPath, { encoding: 'utf16le' });
	}
	async function restoreOriginalFileContent(testDoc: TextDocument, originalText: string | undefined) {
		await window.showTextDocument(testDoc);
		await commands.executeCommand('workbench.action.closeActiveEditor');
		writeFileSync(testDoc.uri.fsPath, originalText as string, { encoding: 'utf16le' });
	}
	this.beforeEach(async function () {

	});
	this.afterEach(async function () {
		await restoreOriginalFileContent(testDoc, originalText);
	});

	test('get Scenarios', async () => {
		await openFile();
		let workspaceFolders: WorkspaceFolder[] = workspace.workspaceFolders as WorkspaceFolder[];
		let fsPaths: string[] = [];
		workspaceFolders.forEach(workspaceFolder => fsPaths.push(workspaceFolder.uri.fsPath));
		let result: Message[] = await new ObjectService().getObjects(fsPaths);
		assert.notStrictEqual(result, null, 'Scenarios should be found.');
		assert.strictEqual(result.length, 11, 'Number of Scenarios');
		assert.strictEqual(result[0].Feature, 'Unblock Deletion of Whse. Shpt. Line enabled');
		assert.strictEqual(result[0].Scenario, 'Delete by user with no allowance manually created whse. shpt. line');
		assert.strictEqual(result[0].Id, 1);
		assert.strictEqual(result[0].MethodName, 'DeleteByUserWithNoAllowanceManuallyCreatedWhseShptLine');
		assert.strictEqual(result[0].Details.given.length, 2, 'Expected 2 given element.');
		assert.strictEqual(result[0].Details.given[0], 'Warehouse employee for current user with no allowance');
		assert.strictEqual(result[0].Details.given[1], 'Manually created warehouse shipment from released sales order with one line with require shipment location');
		assert.strictEqual(result[0].Details.when.length, 1, 'Expected 1 when element.');
		assert.strictEqual(result[0].Details.when[0], 'Delete warehouse shipment line');
		assert.strictEqual(result[0].Details.then.length, 1, 'Expected 1 then element.');
		assert.strictEqual(result[0].Details.then[0], 'Warehouse shipment line is deleted');
		await restoreOriginalFileContent(testDoc, originalText);
	});

	test('check deletion of element procedure used once', async () => {
		await openFile();
		let messageUpdate: MessageUpdate = {
			Scenario: 'Delete by user with no allowance automatically created whse. shpt. line',
			Feature: 'Unblock Deletion of Whse. Shpt. Line disabled',
			Type: TypeChanged.Then,
			State: MessageState.Deleted,
			OldValue: 'Error disallowing deletion',
			NewValue: '',
			FsPath: testDoc.uri.fsPath,
			Project: 'Testing Blocking Deletion of Warehouse Shipment Lines (app)'
		};
		let config: any;
		messageUpdate.ProceduresToDelete = await new ObjectService().getProceduresWhichCouldBeDeletedAfterwards(messageUpdate, config);
		assert.strictEqual(messageUpdate.ProceduresToDelete.length, 1);
		await restoreOriginalFileContent(testDoc, originalText);
	});

	test('check deletion of element procedure used twice', async () => {
		await openFile();
		let messageUpdate: MessageUpdate = {
			Scenario: 'Delete by user with no allowance manually created whse. shpt. line',
			Feature: 'Unblock Deletion of Whse. Shpt. Line disabled',
			Type: TypeChanged.Given,
			State: MessageState.Deleted,
			OldValue: 'Warehouse employee for current user with no allowance',
			NewValue: '',
			FsPath: testDoc.uri.fsPath,
			Project: 'Testing Blocking Deletion of Warehouse Shipment Lines (app)'
		};
		let config: any;
		messageUpdate.ProceduresToDelete = await new ObjectService().getProceduresWhichCouldBeDeletedAfterwards(messageUpdate, config);
		assert.strictEqual(messageUpdate.ProceduresToDelete.length, 0);
		await restoreOriginalFileContent(testDoc, originalText);
	});

	test('add given under existing ones', async () => {
		await openFile();
		let messageUpdate: MessageUpdate = {
			Scenario: 'Delete by user with no allowance manually created whse. shpt. line',
			Feature: 'Unblock Deletion of Whse. Shpt. Line disabled',
			Type: TypeChanged.Given,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'Test DFE',
			FsPath: testDoc.uri.fsPath,
			Project: 'Testing Blocking Deletion of Warehouse Shipment Lines (app)'
		};
		let config: any;
		let successful = await new ObjectService().saveChanges(messageUpdate, config);
		assert.strictEqual(successful, true);
		await restoreOriginalFileContent(testDoc, originalText);
	});
	test('add scenario to feature', async () => {
		await openFile();
		let messageUpdate: MessageUpdate = {
			Scenario: '',
			Id: 12,
			Feature: 'Unblock Deletion of Whse. Shpt. Line disabled',
			Type: TypeChanged.ScenarioName,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'My new Test-Scenario',
			FsPath: '',
			Project: 'Testing Blocking Deletion of Warehouse Shipment Lines (app)'
		};
		let config: any;
		let successful = await new ObjectService().saveChanges(messageUpdate, config);
		assert.strictEqual(successful, true);
		let uris: Uri[] = await workspace.findFiles('**/Cod75651.UnblockDeletionDisabledFLX.al');
		assert.strictEqual(uris.length, 1);
		let fileContent = readFileSync(uris[0].fsPath, { encoding: 'utf16le' });
		let expectedProcedure: string[] = [
			'    end;',
			'',
			'    [Test]',
			'    local procedure MyNewTestScenario()',
			'    // [Feature] Unblock Deletion of Whse. Shpt. Line disabled',
			'    begin',
			'        // [Scenario #0012] My new Test-Scenario',
			'        Initialize();',
			'    end;',
			'',
			'    var'
		];
		let expectedProcedureSingleLine = expectedProcedure.join('\r\n');
		assert.strictEqual(fileContent.includes(expectedProcedureSingleLine), true);
		await restoreOriginalFileContent(testDoc, originalText);
	})

	test('add scenario to feature without Initialize', async () => {
		await openFile();
		let messageUpdate: MessageUpdate = {
			Scenario: '',
			Id: 12,
			Feature: 'Unblock Deletion of Whse. Shpt. Line disabled',
			Type: TypeChanged.ScenarioName,
			State: MessageState.New,
			OldValue: '',
			NewValue: 'My new Test-Scenario',
			FsPath: '',
			Project: 'Testing Blocking Deletion of Warehouse Shipment Lines (app)'
		};
		let config: any;
		let uris: Uri[] = await workspace.findFiles('**/Cod75651.UnblockDeletionDisabledFLX.al');
		assert.strictEqual(uris.length, 1);
		Config.setAddInitializeFunction(false, uris[0]);
		let successful = await new ObjectService().saveChanges(messageUpdate, config);
		Config.setAddInitializeFunction(undefined, uris[0]);

		assert.strictEqual(successful, true);
		let fileContent = readFileSync(uris[0].fsPath, { encoding: 'utf16le' });
		let expectedProcedure: string[] = [
			'    end;',
			'',
			'    [Test]',
			'    local procedure MyNewTestScenario()',
			'    // [Feature] Unblock Deletion of Whse. Shpt. Line disabled',
			'    begin',
			'        // [Scenario #0012] My new Test-Scenario',
			'    end;',
			'',
			'    var'
		];
		let expectedProcedureSingleLine = expectedProcedure.join('\r\n');
		assert.strictEqual(fileContent.includes(expectedProcedureSingleLine), true);
		await restoreOriginalFileContent(testDoc, originalText);
	})
	test('add existing scenario to feature', async () => {
		await openFile();
		let messageUpdate: MessageUpdate = {
			Scenario: '',
			Id: 12,
			Feature: 'Unblock Deletion of Whse. Shpt. Line disabled',
			Type: TypeChanged.ScenarioName,
			State: MessageState.New,
			OldValue: '',
			NewValue: '"Allowed to Delete Shpt. Line" is editable on warehouse employees page',
			FsPath: '',
			Project: 'Testing Blocking Deletion of Warehouse Shipment Lines (app)'
		};
		let config: any;
		let validationResult: { valid: boolean, reason: string } = await new ObjectService().isChangeValid(messageUpdate, config);
		assert.strictEqual(validationResult.valid, false);
		await restoreOriginalFileContent(testDoc, originalText);
	})
	test('remove scenario', async () => {
		await openFile();
		let messageUpdate: MessageUpdate = {
			Scenario: 'Delete by user with allowance automatically created whse. shpt. line with no confirmation',
			Id: 11,
			Feature: 'Unblock Deletion of Whse. Shpt. Line disabled',
			Type: TypeChanged.ScenarioName,
			State: MessageState.Deleted,
			OldValue: 'Delete by user with allowance automatically created whse. shpt. line with no confirmation',
			NewValue: '',
			FsPath: testDoc.uri.fsPath,
			Project: 'Testing Blocking Deletion of Warehouse Shipment Lines (app)',
			ProceduresToDelete: [
				{ procedureName: 'DeleteByUserWithAllowanceAutomaticallyCreatedWhseShptLineWithNoConfirmation', parameterTypes: [] },
				{ procedureName: 'VerifyEmptyErrorOccurred', parameterTypes: [] }
			]
		};
		let config: any;
		let syntaxTree: SyntaxTree = await SyntaxTree.getInstance(testDoc);
		let methodsBeforeDeletion: ALFullSyntaxTreeNode[] = syntaxTree.collectNodesOfKindXInWholeDocument(FullSyntaxTreeNodeKind.getMethodDeclaration());
		let successful: boolean = await new ObjectService().saveChanges(messageUpdate, config);
		syntaxTree = await SyntaxTree.getInstance(testDoc);
		let methodsAfterDeletion: ALFullSyntaxTreeNode[] = syntaxTree.collectNodesOfKindXInWholeDocument(FullSyntaxTreeNodeKind.getMethodDeclaration());

		assert.strictEqual(successful, true);
		assert.strictEqual(methodsBeforeDeletion.length - methodsAfterDeletion.length, 2, 'Two procedures should be deleted.');
		await restoreOriginalFileContent(testDoc, originalText);
	})
});
