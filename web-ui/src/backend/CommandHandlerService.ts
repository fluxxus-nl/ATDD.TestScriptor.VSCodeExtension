import { BackendService } from 'services/backend-service';
import { autoinject, NewInstance, Container } from "aurelia-framework";

@autoinject()
export class CommandHandlerService implements ICommandHandlerService {

    constructor(protected backendService: BackendService) {

    }

    async dispatch(commandName: string, payload: any): Promise<void> {
        
        let className = `${commandName}Command`;
        let moduleName = `backend/commands/${className}`;
        
        //@ts-ignore
        require([moduleName], async (loadedModule: any) => {
            let command = Container.instance.get(loadedModule[className]);
            await command.execute(payload);
        });
    }

}

export interface ICommandHandlerService {
    dispatch(commandName: string, payload: any): Promise<void>;
}

export interface ICommand {

    execute(payload: any): Promise<void>;
}