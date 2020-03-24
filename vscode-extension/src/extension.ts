'use strict';

import { Application } from './Application';
import { ExtensionContext } from 'vscode';

export async function activate(context: ExtensionContext) {
    Application.context = context;
    await Application.activate();

    Application.logService.info(`Extension "${Application.extensionName}" is now activated.`);
}

export async function deactivate() {
    await Application.deactivate();
					
    Application.logService.debug(`Extension "${Application.extensionName}" has been deactivated.`);
}