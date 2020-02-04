import { Middleware } from './Middleware';
'use strict';

import * as vscode from 'vscode';
import { WebPanel } from './WebPanel';
import { BackendProvider } from './Services/BackendProvider';

export async function activate(context: vscode.ExtensionContext) {
    let paths = vscode.workspace.workspaceFolders?.map((m: vscode.WorkspaceFolder) => m.uri.fsPath) as Array<string>;

    await BackendProvider.start(context.extensionPath, paths);

    await Middleware.instance.init(`http://localhost:${BackendProvider.port}`);

    context.subscriptions.push(vscode.commands.registerCommand('atddTestScriptor.open', async () => {
        try {
            await WebPanel.open(context.extensionPath);
        } catch (e) {
            console.error(e);
            vscode.window.showErrorMessage(`ATDD TestScriptor could not be opened. Error: '${e.message}'`);
        }
    }));    

    console.log('Extension "fluxxus-nl.atdd-testscriptor" is now activated.');
}

export async function deactivate() {    
    WebPanel.instance.dispose();
    console.log('ATDD Panel disposed.');

    await Middleware.instance.dispose();
    await BackendProvider.stop();

    console.log('Extension "fluxxus-nl.atdd-testscriptor" has been deactivated.');
}