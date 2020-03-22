import { VSDependency, ExecuteCommand, VSCommandType } from './../Bootstrap/VSCommands';
import { Activator } from './../Bootstrap/Activator';
import { UIService } from './../Services/UIService';
import { IMessageBase } from '../typings/IMessageBase';
import { CommandBase } from './CommandBase';
import { WebPanel } from '../WebPanel';

export class RunTestsCommand extends CommandBase {

    async execute(message?: IMessageBase) {
        if (!Activator.checkExtension(VSDependency.ALTestRunner)) {
            await UIService.error(`"${VSDependency.ALTestRunner}" extension is not installed or disabled.`);
            return;
        }        

        // TODO:
        let allTests = message?.Data.AllTests === true;
        let fileName = message?.Data.Path;
        let functionName = message?.Data.MethodName;

        if (allTests === true) {
            ExecuteCommand(VSCommandType.RunAllTests, '', message?.Data.Project);
        } else {
            ExecuteCommand(VSCommandType.RunTest, fileName, functionName);
        }
        
        WebPanel.postMessage({ Command: 'LoadTests', Data: WebPanel.testList });
    }
}