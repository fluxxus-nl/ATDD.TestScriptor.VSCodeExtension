import { AppEditMode } from './../../types';
import { ICommand } from "backend/CommandHandlerService";
import { transient } from "aurelia-framework";
import { AppService } from "services/app-service";

@transient()
export class NewFeatureCommand implements ICommand {
    constructor(private appService: AppService) {
    }

    async execute(payload: any): Promise<void> {
        if (this.appService.editMode == AppEditMode.Feature) {
            this.appService.editMode = AppEditMode.Scenario;
        } else {
            this.appService.editMode = AppEditMode.Feature;
        }
        console.log('NewFeature Command', this.appService.editMode);
    }

}