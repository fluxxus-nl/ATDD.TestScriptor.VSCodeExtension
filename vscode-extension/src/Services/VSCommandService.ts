import { Application } from "../Application";
import { singleton } from 'aurelia-dependency-injection';
import { WebPanel } from "../WebPanel";
import { WebPanelCommandService } from './WebPanelCommandService';
import { MiddlewareService } from './MiddlewareService';
import { commands, Uri } from 'vscode';

@singleton(true)
export class VSCommandService {

    async executeCommand(command: string, ...rest: Array<any>): Promise<any> {
        Application.log.debug(`${command} executed`, rest);
        return await commands.executeCommand(command, rest);
    }

    async open() {
        try {
            await WebPanel.open(Application.context.extensionPath);
        } catch (e) {
            Application.log.error(`${Application.displayName} could not be opened.`, e);
            Application.ui.error(`${Application.displayName} could not be opened. Error: '${e.message}'`);
        }
    }

    async discover() {
        await Application.ui.progress('Processing Workspace: discovering AL Unit Tests...', async (progress, token) => {
            token.onCancellationRequested(() => {
                Application.log.warn("User cancelled the AL Unit Test Discovery.");
            });
    
            let middlewareService = Application.container.get(MiddlewareService);
            let start = Date.now();
            WebPanel.testList = await middlewareService.getObjects(Application.getWorkspacePaths());
            let end = Date.now();
            Application.log.info(`Workspace processed in ${end - start}ms`);
    
            return true;
        });
    }
}

export async function localObjectWatcher(uri: Uri, type: ATDDFileChangeType) {
    // skip re-discovery when Test Panel is active and file change happens,
    // this is most likely a change event caused by our component
    if (Application.panelActive === true && type == ATDDFileChangeType.Change) {
        let check = WebPanel.testList.find(f => f.FsPath == uri.fsPath);
        if (check) {
            return;
        }
    }

    let webPanelService = Application.container.get(WebPanelCommandService);
    await webPanelService.LoadTestsCommand();
}

export enum VSDependency {
    ALTestRunner = 'jamespearson.al-test-runner'
}

export enum ATDDFileChangeType {
    Add = 'Add',
    Change = 'Change',
    Unlink = 'Unlink'
}

export enum VSCommandType {
    Open = 'atddTestScriptor.open',
    Discover = 'atddTestScriptor.discover',
    RunAllTests = 'altestrunner.runAllTests',
    RunTest = 'altestrunner.runTest'
}

