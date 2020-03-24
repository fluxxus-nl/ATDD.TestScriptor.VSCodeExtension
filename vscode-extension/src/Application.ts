/*import { ExportCommand } from './Commands/ExportCommand';
import { ViewSourceCommand } from './Commands/ViewSourceCommand';
import { SaveChangesCommand } from './Commands/SaveChangesCommand';
import { RunTestsCommand } from './Commands/RunTestCommand';
import { LoadTestsCommand } from './Commands/LoadTestsCommand';
import { LoadProjectsCommand } from './Commands/LoadProjectsCommand';*/
import { ExcelService } from './Services/ExcelService';
import { Container } from 'aurelia-dependency-injection';
import { commands, ExtensionContext, workspace, extensions } from 'vscode';
import { WebPanel } from './WebPanel';
import { LogService } from './Services/LogService';
import { MiddlewareService } from './Services/MiddlewareService';
import { BackendService } from './Services/BackendService';
import { localObjectWatcher, VSCommandType, VSCommandService } from './Services/VSCommandService';
import { UIService } from './Services/UIService';
import { CommandHandlerService } from './Services/CommandHandlerService';
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
        this.registerContainer();
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

    static get logService() {
        return Application._instance._logService;
    }

    static get uiService() {
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

    registerContainer() {    
        // Services    
        this._container.registerSingleton(UIService);
        this._container.registerSingleton(LogService);
        this._container.registerSingleton(BackendService);
        this._container.registerSingleton(MiddlewareService);
        this._container.registerSingleton(VSCommandService);
        this._container.registerTransient(CommandHandlerService);
        this._container.registerTransient(ExcelService);

        // Commands
        /*this._container.registerTransient(LoadProjectsCommand);
        this._container.registerTransient(LoadTestsCommand);
        this._container.registerTransient(RunTestsCommand);
        this._container.registerTransient(SaveChangesCommand);
        this._container.registerTransient(ViewSourceCommand);
        this._container.registerTransient(ExportCommand);*/

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
    }

    private async _activate() {
        await this.registerBackend();
        this._vsCommandService = this._container.get(VSCommandService);
        this.registerCommand(VSCommandType.Open, this._vsCommandService.open);
        this.registerCommand(VSCommandType.Discover, this._vsCommandService.discover);

        workspace.onDidChangeWorkspaceFolders(async () => {
            await this._vsCommandService.executeCommand(VSCommandType.Discover);
        });

        this.registerFileWatcher();
    }

    private async _deactivate() {
        WebPanel.instance.dispose();
        this._logService.debug('ATDD Panel disposed.');
        await this._middlewareService.dispose();
        await this._backendService.stop();
    }
}