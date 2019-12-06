'use strict';

import * as vscode from 'vscode';
import { WebPanel } from './WebPanel';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('atddTestScriptor.open', async () => {
        try {
            await WebPanel.open(context.extensionPath);
        } catch (e) {
            console.error(e);
            vscode.window.showErrorMessage(`ATDD TestScriptor could not be opened. Error: '${e.message}'`);
        }
    }));
}

export function deactivate() {
}