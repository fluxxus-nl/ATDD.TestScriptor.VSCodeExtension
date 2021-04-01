import { BackendService } from 'services/backend-service';
import { autoinject, bindable } from "aurelia-framework";

@autoinject()
export class Toolbar {

    @bindable()
    searchValue: string;

    @bindable()
    noConfirmations: boolean = false;

    loaded: boolean = false;

    constructor(private backendService: BackendService) {
    }

    async attached() {
        try {
            let currentSetting = await this.sendCommand('GetConfiguration');
            this.noConfirmations = currentSetting;
        } catch {
            console.log('GetConfiguration call is not yet implemented');
        }

        this.loaded = true;
    }

    async sendCommand(command: string, data?: any) {
        return await this.backendService.send({ Command: command, Data: data });
    }

    noConfirmationsChanged(newValue: boolean) {
        if (this.loaded !== true) {
            return;
        }

        this.sendCommand('SetConfiguration', newValue);
    }
}