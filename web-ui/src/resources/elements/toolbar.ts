import { BackendService } from 'services/backend-service';
import { autoinject, bindable } from "aurelia-framework";
import { EventAggregator } from 'aurelia-event-aggregator';
import { CommandHandlerService } from 'backend/CommandHandlerService';
import { AppEventPublisher } from 'types';

@autoinject()
export class Toolbar {

    @bindable()
    searchValue: string;

    @bindable()
    noConfirmations: boolean = false;

    loaded: boolean = false;

    constructor(private backendService: BackendService, private commandHandlerService: CommandHandlerService, private eventAggregator: EventAggregator) {
    }

    async attached() {
        try {
            let currentSetting = await this.sendBackendCommand('GetConfiguration');
            this.noConfirmations = currentSetting;
        } catch {
            console.log('GetConfiguration call is not yet implemented');
        }

        this.loaded = true;
    }

    async sendCommand(command: string, data?: any) {
        if (command == 'Refresh') {
            this.eventAggregator.publish(AppEventPublisher.refresh);
            return;
        }

        await this.commandHandlerService.dispatch(command, data);
    }

    async sendBackendCommand(command: string, data?: any) {
        return await this.backendService.send({ Command: command, Data: data });
    }

    noConfirmationsChanged(newValue: boolean) {
        if (this.loaded !== true) {
            return;
        }

        this.sendBackendCommand('SetConfiguration', newValue);
    }
}