import { UIService } from './../Services/UIService';
import { IMessageBase } from '../typings/IMessageBase';
import { CommandBase } from './CommandBase';
import { WebPanel } from '../WebPanel';
import { extensions, commands } from 'vscode';

export class RunTestsCommand extends CommandBase {

    async execute(message?: IMessageBase) {
        let checkExt = extensions.getExtension('jamespearson.al-test-runner');
        if (!checkExt) {
            await UIService.error(`AL Test Runner extension is not installed or disabled.`);
        }

        // TODO:
        let allTests = message?.Data.AllTests === true;
        let fileName = message?.Data.Path;
        let functionName = message?.Data.MethodName;

        if (allTests === true) {
            commands.executeCommand('altestrunner.runAllTests', '', message?.Data.Project);
        } else {
            commands.executeCommand('altestrunner.runTest', fileName, functionName);
        }
        
        WebPanel.postMessage({ Command: 'LoadTests', Data: WebPanel.testList });
    }
}