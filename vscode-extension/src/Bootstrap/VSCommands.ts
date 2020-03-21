import { CancellationToken, Progress } from 'vscode';
import { UIService } from './../Services/UIService';
import { WebPanel } from "../WebPanel";
import { LogService } from "../Services/LogService";
import { Activator } from "./Activator";
import { Middleware } from '../Middleware';
import { getWorkspacePaths } from '../utils';
import { LoadTestsCommand } from '../Commands/LoadTestsCommand';

export enum VSCommandType {
    Open = 'atddTestScriptor.open',
    Discover = 'atddTestScriptor.discover'
}

export async function Open() {
    try {
        await WebPanel.open(Activator.context.extensionPath);
    } catch (e) {
        LogService.error(`ATDD TestScriptor could not be opened.`, e);
        UIService.error(`ATDD TestScriptor could not be opened. Error: '${e.message}'`);
    }
}

export async function Discover() {
    await UIService.progress('Processing Workspace: discovering AL Unit Tests...', DiscoverProgressTask);
}

async function DiscoverProgressTask(progress: Progress<{ message?: string; increment?: number }>, token: CancellationToken) {        
    token.onCancellationRequested(() => {
        LogService.warn("User canceled the AL Unit Test Discovery.");
    });

    let start = Date.now();
    WebPanel.testList = await Middleware.instance.getObjects(getWorkspacePaths());
    let end = Date.now();
    LogService.info(`Workspace processed in ${end-start}ms`);

    return true;
}

export async function LocalObjectWatcher () {
    let command = new LoadTestsCommand();
    await command.execute();
};