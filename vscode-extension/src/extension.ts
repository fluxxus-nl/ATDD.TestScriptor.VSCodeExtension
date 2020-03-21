'use strict';

import { LogService } from './Services/LogService';
import { Activator } from './Bootstrap/Activator';
import { ExtensionContext } from 'vscode';

export async function activate(context: ExtensionContext) {
    Activator.context = context;
    await Activator.activate();

    LogService.info('Extension "fluxxus-nl.atdd-testscriptor" is now activated.');
}

export async function deactivate() {
    await Activator.deactivate();
					
    LogService.debug('Extension "fluxxus-nl.atdd-testscriptor" has been deactivated.');
}