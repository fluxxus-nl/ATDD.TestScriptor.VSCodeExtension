import { Middleware } from './Middleware';
'use strict';

import * as vscode from 'vscode';
import { WebPanel } from './WebPanel';
import { BackendProvider } from './Services/BackendProvider';
import { LogService } from './Services/LogService';

export async function activate(context: vscode.ExtensionContext) {
    let paths = vscode.workspace.workspaceFolders?.map((m: vscode.WorkspaceFolder) => m.uri.fsPath) as Array<string>;

    await BackendProvider.start(context.extensionPath, paths);

    await Middleware.instance.init(`http://localhost:${BackendProvider.port}`);

    context.subscriptions.push(vscode.commands.registerCommand('atddTestScriptor.open', async () => {
        try {
            await WebPanel.open(context.extensionPath);
        } catch (e) {
            LogService.instance.error(`ATDD TestScriptor could not be opened.`, e);
            vscode.window.showErrorMessage(`ATDD TestScriptor could not be opened. Error: '${e.message}'`);
        }
    }));    		   

    context.subscriptions.push(vscode.commands.registerCommand('atddTestScriptor.discover', async () => {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Processing Workspace: discovering AL Unit Tests...",
            cancellable: true
        }, async (progress, token) => {
            token.onCancellationRequested(() => {
                LogService.instance.warn("User canceled the AL Unit Test Discovery.");
            });

            let start = Date.now();
            WebPanel.testList = await Middleware.instance.getObjects(paths);
            let end = Date.now();
            LogService.instance.info(`Workspace processed in ${end-start}ms`);

            return true;
        });
    }));

    vscode.workspace.onDidChangeWorkspaceFolders(async (e) => {
        await vscode.commands.executeCommand('atddTestScriptor.discover');
    });

    let watcher = vscode.workspace.createFileSystemWatcher('**/*.al');
    let localObjectWatcher = async (e: vscode.Uri) => {
        let localObjs = await Middleware.instance.getObjects(paths);
        WebPanel.testList = localObjs;
    };

    context.subscriptions.push(watcher.onDidCreate(localObjectWatcher));
    context.subscriptions.push(watcher.onDidChange(localObjectWatcher));
    context.subscriptions.push(watcher.onDidDelete(localObjectWatcher));

    LogService.instance.info('Extension "fluxxus-nl.atdd-testscriptor" is now activated.');
}

export async function deactivate() {    
    WebPanel.instance.dispose();
    LogService.instance.debug('ATDD Panel disposed.');

    await Middleware.instance.dispose();
    await BackendProvider.stop();
					
    LogService.instance.debug('Extension "fluxxus-nl.atdd-testscriptor" has been deactivated.');
}