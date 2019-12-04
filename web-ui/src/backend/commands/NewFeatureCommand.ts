import { ICommand } from "backend/CommandHandlerService";
import { transient } from "aurelia-framework";

@transient()
export class NewFeatureCommand implements ICommand {

    async execute(payload: any): Promise<void> {
        console.log('NewFeature Command');
    }

}