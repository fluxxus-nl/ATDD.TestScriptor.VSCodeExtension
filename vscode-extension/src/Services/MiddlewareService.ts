import { Application } from './../Application';
import { singleton } from 'aurelia-dependency-injection';
import { WebPanel } from '../WebPanel';
import { Message, MessageUpdate } from '../typings/types';
import { HubConnectionState, HubConnectionBuilder, LogLevel, HubConnection } from "@microsoft/signalr";

@singleton(true)
export class MiddlewareService {
    private _connection!: HubConnection;
    private _url: string = '';

    constructor() {
    }

    async send(requestMethod: string, responseMethod: string, checkConnection: boolean, ...args: Array<any>) {
        return await this._send(requestMethod, responseMethod, checkConnection, ...args);
    }

    async getProjects(msg: Array<string>): Promise<Array<string>> {
        return this.send(MiddlewareRequestMethod.QueryProjects, MiddlewareResponseMethod.GetProjects, false, msg) as Promise<Array<string>>;
    }

    async getObjects(paths: Array<string>): Promise<Array<Message>> {
        return this.send(MiddlewareRequestMethod.QueryObjects, MiddlewareResponseMethod.GetObjects, false, paths) as Promise<Array<Message>>;
    }

    async checkSaveChanges(item: MessageUpdate, config: any): Promise<boolean> {
        return this.send(MiddlewareRequestMethod.CheckSaveChanges, MiddlewareResponseMethod.CheckSaveChangesResponse, false, item, config) as Promise<boolean>;
    }

    async saveChanges(item: MessageUpdate, config: any): Promise<boolean> {
        return this.send(MiddlewareRequestMethod.SaveChanges, MiddlewareResponseMethod.SaveChangesResponse, false, item, config) as Promise<boolean>;
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
            let msg = `Backend connection lost due to error "${error}". Reconnecting.`;
            Application.log.warn(msg);
            Application.ui.warn(msg);
        });

        this._connection.onreconnected(id => {
            let msg = `Backend connection has beed restored.`;
            Application.log.info(msg);
            Application.ui.info(msg);
        });

        this._connection.on(MiddlewareResponseMethod.UpdateObjects, async () => {
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
    
    private async _send(requestMethod: string, responseMethod: string, checkConnection: boolean, ...args: Array<any>) {
        if (checkConnection === true) {
            await this.check();
        }

        return new Promise((resolve, reject) => {            
            this._connection.on(responseMethod, (msg: any) => {
                Application.log.debug(`${responseMethod}: ${responseMethod} response received.`);
                resolve(msg);
            });

            Application.log.debug(`${requestMethod}: request sent.`);
            this._connection.invoke(requestMethod, ...args).catch((err: any) => reject(err));
        });
    }

    async dispose() {
        if (this._connection) {
            if ([HubConnectionState.Disconnected, HubConnectionState.Disconnecting].indexOf(this._connection.state) != -1)
                return;

            await this._connection.stop();
        }
    }

}

export enum MiddlewareRequestMethod {
    QueryProjects = 'QueryProjects',
    QueryObjects = 'QueryObjects',
    SaveChanges = 'SaveChanges',
    CheckSaveChanges = 'CheckSaveChanges'
}

export enum MiddlewareResponseMethod {
    GetProjects = 'GetProjects',
    GetObjects = 'GetObjects',
    SaveChangesResponse = 'SaveChangesResponse',
    UpdateObjects = 'UpdateObjects',
    CheckSaveChangesResponse = 'CheckSaveChangesResponse'
}