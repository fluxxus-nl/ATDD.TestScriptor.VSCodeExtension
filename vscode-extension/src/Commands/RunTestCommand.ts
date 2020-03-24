import { VSDependency, VSCommandType, VSCommandService } from '../Services/VSCommandService';
import { Application } from '../Application';
import { IMessageBase, Message } from '../typings/IMessageBase';
import { WebPanel } from '../WebPanel';
import { ICommandBase } from '../typings/ICommandBase';

export class RunTestsCommand  implements ICommandBase {
    private vsCommandService: VSCommandService;

    constructor() {
        this.vsCommandService = Application.container.get(VSCommandService);
    }

    async execute(message?: IMessageBase) {
        if (!Application.checkExtension(VSDependency.ALTestRunner)) {
            await Application.uiService.error(`"${VSDependency.ALTestRunner}" extension is not installed or disabled.`);
            return;
        }        

        // TODO:        
        let allTests = message?.Params.AllTests === true;
        let entry: Message = message?.Data;
        let fileName = entry.FsPath;
        let functionName = entry.MethodName;

        if (allTests === true) {
            await this.vsCommandService.executeCommand(VSCommandType.RunAllTests, '', entry.Project);
        } else {
            await this.vsCommandService.executeCommand(VSCommandType.RunTest, fileName, functionName);
        }
        
        WebPanel.postMessage({ Command: 'LoadTests', Data: WebPanel.testList });
    }
}