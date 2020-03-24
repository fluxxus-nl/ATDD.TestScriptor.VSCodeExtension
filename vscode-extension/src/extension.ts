'use strict';

import { Application } from './Application';
import { ExtensionContext } from 'vscode';

export async function activate(context: ExtensionContext) {
    Application.context = context;
    await Application.activate();
}

export async function deactivate() {
    await Application.deactivate();
}