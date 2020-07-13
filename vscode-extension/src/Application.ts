import { Container } from 'aurelia-dependency-injection';
import { WebPanel } from './WebPanel';
import { LogService } from './Services/LogService';
import { MiddlewareService } from './Services/MiddlewareService';
import { BackendService } from './Services/BackendService';
import { localObjectWatcher, VSCommandType, VSCommandService } from './Services/VSCommandService';
import { UIService } from './Services/UIService';
import { commands, ExtensionContext, workspace, WorkspaceFolder, extensions } from 'vscode';
import { readFile } from 'fs-extra';
const packageConfig: any = require('../package.json');

export class Application {
    private _container: Container;
    private _context!: ExtensionContext;
    private _extensionName: string;
    private _displayName: string;
    private _debugMode: boolean;
    private _logService: LogService;
    private _uiService: UIService;
    private _vsCommandService!: VSCommandService;
    private _backendService!: BackendService;
    private _middlewareService!: MiddlewareService;
    private static _instance: Application;

    private constructor() {
        this._extensionName = `${packageConfig.author.name}.${packageConfig.name}`;
        this._displayName = packageConfig.displayName;
        this._debugMode = packageConfig.debugMode === true;
        this._container = (new Container()).makeGlobal();
        this._logService = this._container.get(LogService);
        this._uiService = this._container.get(UIService);
        this._backendService = this._container.get(BackendService);
        this._middlewareService = this._container.get(MiddlewareService);
    }

    public static get container() {
        return Application._instance._container;
    }

    public static get debugMode() {
        return Application._instance._debugMode;
    }

    public static get displayName() {
        return Application._instance._displayName;
    }

    public static get extensionName() {
        return Application._instance._extensionName;
    }

    public static get config() {
        let config = workspace.getConfiguration('atddTestScriptor');
        return config;
    }

    public static get instance() {
        if (!Application._instance) {
            Application._instance = new Application();
        }

        return Application._instance;
    }

    static get context() {
        return Application.instance._context;
    }

    static set context(_context: ExtensionContext) {
        Application.instance._context = _context;
    }

    static get log() {
        return Application._instance._logService;
    }

    static get ui() {
        return Application._instance._uiService;
    }

    static async activate() {
        await Application.instance._activate();
    }

    static async deactivate() {
        await Application.instance._deactivate();
    }

    static checkExtension(name: string): boolean {
        let checkExt = extensions.getExtension(name);
        return checkExt ? true : false;
    }

    registerCommand(name: string, commandFunc: any) {
        this._context.subscriptions.push(commands.registerCommand(name, commandFunc));
    }

    registerFileWatcher() {
        let watcher = workspace.createFileSystemWatcher('**/*.al');
        this._context.subscriptions.push(watcher.onDidCreate(localObjectWatcher));
        this._context.subscriptions.push(watcher.onDidChange(localObjectWatcher));
        this._context.subscriptions.push(watcher.onDidDelete(localObjectWatcher));
    }

    async registerBackend() {
        await this._backendService.start(this._context.extensionPath);
        await this._middlewareService.init(`http://localhost:${this._backendService.port}`);
        this._vsCommandService = this._container.get(VSCommandService);
    }

    private async _activate() {
        await this.registerBackend();
        this.registerCommand(VSCommandType.Open, this._vsCommandService.open);
        this.registerCommand(VSCommandType.Discover, this._vsCommandService.discover);

        workspace.onDidChangeWorkspaceFolders(async () => {
            await this._vsCommandService.executeCommand(VSCommandType.Discover);
        });

        this.registerFileWatcher();

        this._logService.info(`Extension "${Application.extensionName}" is now activated.`);
    }

    private async _deactivate() {
        WebPanel.instance.dispose();
        this._logService.debug('ATDD Panel disposed.');
        await this._middlewareService.dispose();
        await this._backendService.stop();

        this._logService.debug(`Extension "${Application.extensionName}" has been deactivated.`);
    }

    static async readFile(file: any): Promise<string> {
        return new Promise((resolve, reject) => {
            readFile(file, "utf8", (err: any, data: any) => {
                if (err) reject(err);
                else resolve(data);
            });
        });
    }

    static getWorkspacePaths() {
        let paths = workspace.workspaceFolders?.map((m: WorkspaceFolder) => m.uri.fsPath) as Array<string>;
        return paths;
    }
}
