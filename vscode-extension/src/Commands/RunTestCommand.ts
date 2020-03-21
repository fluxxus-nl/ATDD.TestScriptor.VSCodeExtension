import { IMessageBase } from '../typings/IMessageBase';
import { CommandBase } from './CommandBase';
import { WebPanel } from '../WebPanel';

export class RunTestsCommand extends CommandBase {

    async execute(message?: IMessageBase) {
        //TODO
        WebPanel.postMessage({ Command: 'LoadTests', Data: WebPanel.testList });
    }
}