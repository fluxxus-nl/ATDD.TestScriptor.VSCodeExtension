import { commands, ExtensionContext, workspace } from 'vscode';
import { WebPanel } from '../WebPanel';
import { LogService } from '../Services/LogService';
import { Middleware } from '../Middleware';
import { BackendProvider } from '../Services/BackendProvider';
import { LocalObjectWatcher, VSCommandType, Open, Discover } from './VSCommands';

export class Activator {
    private _context!: ExtensionContext;
    private static _instance: Activator;

    private constructor() {
    }

    public static get instance() {
        if (!Activator._instance) {
            Activator._instance = new Activator();
        }

        return Activator._instance;
    }

    static get context() {
        return Activator.instance._context;
    }

    static set context(_context: ExtensionContext) {
        Activator.instance._context = _context;
    }

    static async activate() {
        await Activator.instance._activate();
    }

    static async deactivate() {
        await Activator.instance._deactivate();
    }

    registerCommand(name: string, commandFunc: any) {
        this._context.subscriptions.push(commands.registerCommand(name, commandFunc));
    }

    registerFileWatcher() {
        let watcher = workspace.createFileSystemWatcher('**/*.al');
        this._context.subscriptions.push(watcher.onDidCreate(LocalObjectWatcher));
        this._context.subscriptions.push(watcher.onDidChange(LocalObjectWatcher));
        this._context.subscriptions.push(watcher.onDidDelete(LocalObjectWatcher));
    }

    async registerBackend() {
        await BackendProvider.start(this._context.extensionPath);
        await Middleware.instance.init(`http://localhost:${BackendProvider.port}`);
    }

    private async _activate() {
        await this.registerBackend();
        this.registerCommand(VSCommandType.Open, Open);
        this.registerCommand(VSCommandType.Discover, Discover);

        workspace.onDidChangeWorkspaceFolders(async () => {
            await commands.executeCommand(VSCommandType.Discover);
        });

        this.registerFileWatcher();
    }

    private async _deactivate() {
        WebPanel.instance.dispose();
        LogService.debug('ATDD Panel disposed.');

        await Middleware.instance.dispose();
        await BackendProvider.stop();
    }
}