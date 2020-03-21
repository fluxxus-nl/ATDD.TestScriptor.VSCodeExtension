import { CommandHandlerService } from './Services/CommandHandlerService';
import { Disposable, WebviewPanel, ViewColumn, window, Uri } from 'vscode';
import * as path from 'path';
import {read} from './utils';
import { IMessageBase } from './typings/IMessageBase';
import { LogService } from './Services/LogService';

export class WebPanel {

    public static instance: WebPanel;

    public static testList: Array<any> = [];

    protected options: any = {};

    protected panel!: WebviewPanel;

    protected extensionPath: string = '';

    private _disposables: Disposable[] = [];

    constructor(extensionPath: string) {
        this.extensionPath = extensionPath;
    }

    async createPanel() {
        this.panel = window.createWebviewPanel("attTestScriptor", "Test Scenarios", ViewColumn.One, {
            // Enable javascript in the webview
            enableScripts: true,
            enableFindWidget: true,
            retainContextWhenHidden: true,

            localResourceRoots: [
                Uri.file(path.join(this.extensionPath, 'WebView')),
                Uri.file(path.join(this.extensionPath, 'WebView', 'scripts'))
            ]
        });

        this.panel.webview.html = await this._getHtmlForWebview();

        // events
        this.panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage((async (messages: Array<IMessageBase>) => {
            let handler: CommandHandlerService = new CommandHandlerService(this.extensionPath, this);

            for (let message of messages) {
                try {
                    await handler.dispatch(message);
                } catch (e) {
                    window.showErrorMessage(`${e?.message ? `${e.message}` : 'ATDD Server error. Check "Help / Toggle Developer Tools" for details.'}`);
                    LogService.error(`Failed to execute command: ${message.Command}`, e);
                }
            }
        }).bind(this), null, this._disposables);
    }

    public static async open(extensionPath: string) {
        if (WebPanel.instance) {
            WebPanel.instance.panel.reveal(ViewColumn.One);
            return;
        }
        
        let instance = new WebPanel(extensionPath);
        WebPanel.instance = instance;
        await instance.createPanel();        
    }

    public static async postMessage(message: any) {
        await WebPanel.instance.postMessage(message);
    }

    public async postMessage(message: any) {
        await this.panel.webview.postMessage(message);
    }

    private async _getHtmlForWebview() {
        let startupOptions: any = {
            start: 'home',
            options: this.options
        };

        let content: string = await read(path.join(this.extensionPath, 'WebView', 'index.html'));
        let appOnDiskPath = Uri.file(path.join(this.extensionPath, 'WebView', 'scripts', 'bundle.js'));
        let appJsSrc: any = appOnDiskPath.with({ scheme: 'vscode-resource' });
        content = content.replace('//${vscodeApi}', 'window.vscode = acquireVsCodeApi();');
        content = content.replace('//${startupOptions}', `window.startupOptions = '${JSON.stringify(startupOptions)}';`);
        content = content.replace('scripts/bundle.js', appJsSrc);

        return content;
    }

    public dispose() {
        (WebPanel.instance as any) = null;

        // Clean up our resources
        this.panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}