import { Application } from './../Application';
import { MiddlewareService } from '../Services/MiddlewareService';
import { IMessageBase } from './../typings/IMessageBase';
import { WebPanel } from '../WebPanel';
import { getWorkspacePaths } from '../utils';
import { ICommandBase } from '../typings/ICommandBase';

export class LoadProjectsCommand implements ICommandBase {
    private middlewareService: MiddlewareService;

    constructor() {
        this.middlewareService = Application.container.get(MiddlewareService);
    }

    async execute(message: IMessageBase) {
        let paths = getWorkspacePaths();
        let projects = await this.middlewareService.getProjects(paths);
        WebPanel.postMessage({Command: 'LoadProjects', Data: projects});
    }
}