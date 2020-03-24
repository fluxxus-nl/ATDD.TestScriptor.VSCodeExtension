import { ExcelService } from './../Services/ExcelService';
import { IMessageBase, Message } from "../typings/IMessageBase";
import { ICommandBase } from "../typings/ICommandBase";
import { Application } from "../Application";
import { WebPanel } from '../WebPanel';

export class ExportCommand implements ICommandBase {
    private excelService: ExcelService;

    constructor() {
        this.excelService = Application.container.get(ExcelService);
    }

    async execute(message: IMessageBase) {
        let entries = message.Data as Array<Message>;
        await this.excelService.export(entries);
        WebPanel.postMessage(null);
    }
}