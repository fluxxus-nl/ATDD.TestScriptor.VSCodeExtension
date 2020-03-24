import { Application } from './../Application';
import { ICommandBase } from '../typings/ICommandBase';
import { IMessageBase } from '../typings/IMessageBase';

export class CommandHandlerService {
    public constructor() {
    }

    public async dispatch(message: IMessageBase) {
        let className = `${message.Command}Command`;
        let handlerClass = require(`../Commands/${className}`);

        if (handlerClass) {
            let handler: ICommandBase = Application.container.get(handlerClass[className]);
            await handler.execute(message);
        } else {
            await Application.uiService.info(`'${message.Command}' command was not found.`);
        }
    }

}