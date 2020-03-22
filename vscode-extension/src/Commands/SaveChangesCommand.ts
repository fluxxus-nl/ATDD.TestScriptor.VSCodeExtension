import { IMessageBase } from "../typings/IMessageBase";
import { Middleware } from "../Middleware";
import { WebPanel } from "../WebPanel";

export class SaveChangesCommand {
    async execute(message: IMessageBase) {
        let result = await Middleware.saveChanges(message.Data);
        WebPanel.testList = result;
        WebPanel.postMessage({ Command: 'LoadTests', Data: WebPanel.testList });
    }
}