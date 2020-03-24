import { IMessageBase, Message } from "../typings/IMessageBase";
import { MiddlewareService } from "../Services/MiddlewareService";
import { WebPanel } from "../WebPanel";
import { ICommandBase } from "../typings/ICommandBase";
import { Application } from "../Application";

export class SaveChangesCommand implements ICommandBase {
    private middlewareService: MiddlewareService;

    constructor() {
        this.middlewareService = Application.container.get(MiddlewareService);
    }

    async execute(message: IMessageBase) {
        let entries = message.Data as Array<Message>;
        let result = await this.middlewareService.saveChanges(entries);
        WebPanel.testList = result;
        WebPanel.postMessage({ Command: 'LoadTests', Data: WebPanel.testList });
    }
}