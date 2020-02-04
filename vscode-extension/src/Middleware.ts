import { WebPanel } from './WebPanel';
import * as vscode from 'vscode';
import { HubConnectionState, HubConnectionBuilder, LogLevel, HubConnection } from "@microsoft/signalr";

export class Middleware {
    private static _instance: Middleware | undefined;
    private _connection!: HubConnection;
    private _url: string = '';

    private constructor() {
    }

    public static get instance() {
        if (!Middleware._instance) {
            Middleware._instance = new Middleware();
        }

        if (Middleware._instance._url != '' && Middleware._instance._connection.state == HubConnectionState.Disconnected) {
            Middleware._instance.init(Middleware._instance._url);
        }

        return Middleware._instance;
    }

    async check() {
        if (this._connection.state == HubConnectionState.Connected) {
            return;
        }

        if (this._connection && this._connection.state == HubConnectionState.Disconnected) {
            await this.connect();
        } else {
            await this.init(this._url);
        }
    }

    async init(url: string) {
        this._url = url;
        this._connection = new HubConnectionBuilder()
            .withUrl(`${url}/atdd`)
            .configureLogging(LogLevel.Debug)
            .withAutomaticReconnect([1, 1, 2])
            .build();

        this._connection.onreconnecting(error => {
            let msg = `ATDD: backend connection lost due to error "${error}". Reconnecting.`;
            console.log(msg);
            vscode.window.showWarningMessage(msg);
        });

        this._connection.onreconnected(id => {
            let msg = `ATDD: backend connection has beed restored.`;
            console.log(msg);
            vscode.window.showInformationMessage(msg);
        });

        this._connection.on('UpdateObjects', async () => {
            let panel = WebPanel.instance;
            if (panel) {
                await panel.postMessage({ Command: 'UpdateObjects' });
            }
        });

        await this.connect();
    }

    async connect(): Promise<boolean> {
        await this._connection.start();
        return true;
    }

    async dispose() {
        if (this._connection) {
            if ([HubConnectionState.Disconnected, HubConnectionState.Disconnecting].indexOf(this._connection.state) != -1)
                return;

            await this._connection.stop();
            Middleware._instance = undefined;
        }
    }

    async getProjects(msg: Array<string>): Promise<any> {
        return new Promise((resolve, reject) => {
            this._connection.on('GetProjects', (msg: any) => {
                resolve(msg);
            });

            this._connection.invoke('QueryProjects', msg).catch((err: any) => reject(err));
        });
    }

    async getObjects(paths: Array<string>): Promise<any> {
        return new Promise((resolve, reject) => {
            this.check().then(() => {
                this._connection.on('GetObjects', (objects: any) => {
                    resolve(objects);
                });
                this._connection.invoke('QueryObjects', paths).catch((err: any) => reject(err));
            });
        });
    }

    async getPing(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            this._connection.on('GetPing', (result: any) => {
                console.log(`ATDD backend ping ${result === true ? 'successful' : 'failed'}.`);
                resolve(result);
            });

            this._connection.invoke('QueryPing').catch((err: any) => reject(err));
        });
    }
}
