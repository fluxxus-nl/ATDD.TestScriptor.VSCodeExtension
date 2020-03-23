import { VSDependency, ExecuteCommand, VSCommandType } from './../Bootstrap/VSCommands';
import { Activator } from './../Bootstrap/Activator';
import { UIService } from './../Services/UIService';
import { IMessageBase, Message } from '../typings/IMessageBase';
import { CommandBase } from './CommandBase';
import { WebPanel } from '../WebPanel';

export class RunTestsCommand extends CommandBase {

    async execute(message?: IMessageBase) {
        if (!Activator.checkExtension(VSDependency.ALTestRunner)) {
            await UIService.error(`"${VSDependency.ALTestRunner}" extension is not installed or disabled.`);
            return;
        }        

        // TODO:        
        let allTests = message?.Params.AllTests === true;
        let entry: Message = message?.Data;
        let fileName = entry.FsPath;
        let functionName = entry.MethodName;

        if (allTests === true) {
            ExecuteCommand(VSCommandType.RunAllTests, '', entry.Project);
        } else {
            ExecuteCommand(VSCommandType.RunTest, fileName, functionName);
        }
        
        WebPanel.postMessage({ Command: 'LoadTests', Data: WebPanel.testList });
    }
}