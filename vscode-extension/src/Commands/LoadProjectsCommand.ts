import { Middleware } from './../Middleware';
import { IMessageBase } from './../typings/IMessageBase';
import { CommandBase } from './CommandBase';
import { WebPanel } from '../WebPanel';
import { getWorkspacePaths } from '../utils';

export class LoadProjectsCommand extends CommandBase {
    
    async execute(message: IMessageBase) {
        let paths = getWorkspacePaths();
        let projects = await Middleware.getProjects(paths);
        WebPanel.postMessage({Command: 'LoadProjects', Data: projects});
    }
}