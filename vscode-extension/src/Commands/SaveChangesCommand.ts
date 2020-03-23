import { IMessageBase, Message } from "../typings/IMessageBase";
import { Middleware } from "../Middleware";
import { WebPanel } from "../WebPanel";

export class SaveChangesCommand {
    async execute(message: IMessageBase) {
        let entries = message.Data as Array<Message>;
        let result = await Middleware.saveChanges(entries);
        WebPanel.testList = result;
        WebPanel.postMessage({ Command: 'LoadTests', Data: WebPanel.testList });
    }
}