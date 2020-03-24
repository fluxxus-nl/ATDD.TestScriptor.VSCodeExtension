import { commands } from 'vscode';
import { WebPanel } from "../WebPanel";
import { Application } from "../Application";
import { MiddlewareService } from './MiddlewareService';
import { getWorkspacePaths } from '../utils';
import { LoadTestsCommand } from '../Commands/LoadTestsCommand';
import { singleton } from 'aurelia-dependency-injection';

@singleton()
export class VSCommandService {

    constructor() {
    }

    async executeCommand(command: string, ...rest: Array<any>): Promise<any> {
        Application.logService.debug(`${command} executed`, rest);
        return await commands.executeCommand(command, rest);
    }

    async open() {
        try {
            await WebPanel.open(Application.context.extensionPath);
        } catch (e) {
            Application.logService.error(`${Application.displayName} could not be opened.`, e);
            Application.uiService.error(`${Application.displayName} could not be opened. Error: '${e.message}'`);
        }
    }

    async discover() {
        await Application.uiService.progress('Processing Workspace: discovering AL Unit Tests...', async (progress, token) => {
            token.onCancellationRequested(() => {
                Application.logService.warn("User canceled the AL Unit Test Discovery.");
            });
    
            let middlewareService = Application.container.get(MiddlewareService);
            let start = Date.now();
            WebPanel.testList = await middlewareService.getObjects(getWorkspacePaths());
            let end = Date.now();
            Application.logService.info(`Workspace processed in ${end - start}ms`);
    
            return true;
        });
    }
}

export async function localObjectWatcher() {
    let command = Application.container.get(LoadTestsCommand);
    await command.execute();
}

export enum VSDependency {
    ALTestRunner = 'jamespearson.al-test-runner'
}

export enum VSCommandType {
    Open = 'atddTestScriptor.open',
    Discover = 'atddTestScriptor.discover',
    RunAllTests = 'altestrunner.runAllTests',
    RunTest = 'altestrunner.runTest'
}
