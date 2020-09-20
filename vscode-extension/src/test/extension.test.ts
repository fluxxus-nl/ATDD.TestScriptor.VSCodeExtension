// import * as assert from 'assert';
// import { ObjectService } from '../App logic/Services/ObjectService';
// import { Message, MessageUpdate, TypeChanged, MessageState } from '../typings/types';
// import { TextDocument, Uri, workspace, window } from 'vscode';
// // import * as vscode from 'vscode';


// suite('Extension Test Suite', function () {
// 	let testDoc: TextDocument;
// 	this.timeout(0);

// 	async function _before() {
// 		// this.timeout(0);
// 		let uri: Uri[] = await workspace.findFiles('**/*ATDDTestScriptorTestObjectFLX.Codeunit.al');
// 		if (!uri)
// 			throw new Error('File not found.');
// 		await workspace.openTextDocument(uri[0]).then(doc => testDoc = doc);
// 		testDoc = testDoc;
// 		window.showInformationMessage('Start all tests.');
// 	}

// 	test('get Scenarios', async () => {
// 		await _before();
// 		let result: Message[] = await new ObjectService().getObjects([]);
// 		assert.notEqual(result, null, 'Scenarios should be found.');
// 		assert.equal(result.length, 1);
// 		assert.equal(result[0].Feature, 'Testing ATDD.TestScriptor test object');
// 		assert.equal(result[0].Scenario, 'Test function with valid Given-When-Then structure');
// 		assert.equal(result[0].Id, 1);
// 		assert.equal(result[0].MethodName, 'ValidTestFunction');
// 		assert.equal(result[0].Details.given.length, 1, 'Expected 1 given element.');
// 		assert.equal(result[0].Details.given[0], 'Valid Given');
// 		assert.equal(result[0].Details.when.length, 1, 'Expected 1 when element.');
// 		assert.equal(result[0].Details.when[0], 'Valid When');
// 		assert.equal(result[0].Details.then.length, 1, 'Expected 1 then element.');
// 		assert.equal(result[0].Details.then[0], 'Valid Then');
// 	});
// 	test('check deletion of given', async () => {
// 		let messageUpdate: MessageUpdate = {
// 			Scenario: 'Test function with valid Given-When-Then structure',
// 			Type: TypeChanged.Given,
// 			State: MessageState.Deleted,
// 			OldValue: 'Valid Given',
// 			NewValue: '',
// 			FsPath: testDoc.uri.fsPath,
// 			DeleteProcedure: false
// 		};
// 		let obj: any;
// 		messageUpdate.DeleteProcedure = await new ObjectService().checkSaveChanges(messageUpdate, obj)
// 		assert.equal(messageUpdate.DeleteProcedure, true);
// 	});
// });