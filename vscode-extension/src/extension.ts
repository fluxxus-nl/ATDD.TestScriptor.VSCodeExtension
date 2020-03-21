'use strict';

import { LogService } from './Services/LogService';
import { Activator } from './Bootstrap/Activator';
import { ExtensionContext } from 'vscode';

export async function activate(context: ExtensionContext) {
    Activator.context = context;
    await Activator.activate();

    LogService.info(`Extension "${Activator.extensionName}" is now activated.`);
}

export async function deactivate() {
    await Activator.deactivate();
					
    LogService.debug(`Extension "${Activator.extensionName}" has been deactivated.`);
}