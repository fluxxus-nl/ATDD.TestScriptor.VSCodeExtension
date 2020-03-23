import { UIService } from './Services/UIService';
import { WebPanel } from './WebPanel';
import { HubConnectionState, HubConnectionBuilder, LogLevel, HubConnection } from "@microsoft/signalr";
import { LogService } from './Services/LogService';
import { Message } from './typings/IMessageBase';

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
    
    static async send(requestMethod: string, responseMethod: string, checkConnection: boolean, ...args: Array<any>) {
        return await Middleware.instance._send(requestMethod, responseMethod, checkConnection, ...args);
    }

    static async getProjects(msg: Array<string>): Promise<Array<string>> {
        return Middleware.send(MiddlewareRequestMethod.QueryProjects, MiddlewareResponseMethod.GetProjects, false, msg) as Promise<Array<string>>;
    }

    static async getObjects(paths: Array<string>): Promise<Array<Message>> {
        return Middleware.send(MiddlewareRequestMethod.QueryObjects, MiddlewareResponseMethod.GetObjects, false, paths) as Promise<Array<Message>>;
    }

    static async saveChanges(items: Array<Message>): Promise<Array<Message>> {
        return Middleware.send(MiddlewareRequestMethod.SaveChanges, MiddlewareResponseMethod.SaveChangesResponse, false, items) as Promise<Array<Message>>;
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
            LogService.warn(msg);
            UIService.warn(msg);
        });

        this._connection.onreconnected(id => {
            let msg = `Backend connection has beed restored.`;
            LogService.info(msg);
            UIService.info(msg);
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
                LogService.debug(`${responseMethod}: ${responseMethod} response received.`);
                resolve(msg);
            });

            LogService.debug(`${requestMethod}: request sent.`);
            this._connection.invoke(requestMethod, ...args).catch((err: any) => reject(err));
        });
    }

    async dispose() {
        if (this._connection) {
            if ([HubConnectionState.Disconnected, HubConnectionState.Disconnecting].indexOf(this._connection.state) != -1)
                return;

            await this._connection.stop();
            Middleware._instance = undefined;
        }
    }

}

export enum MiddlewareRequestMethod {
    QueryProjects = 'QueryProjects',
    QueryObjects = 'QueryObjects',
    SaveChanges = 'SaveChanges'
}

export enum MiddlewareResponseMethod {
    GetProjects = 'GetProjects',
    GetObjects = 'GetObjects',
    SaveChangesResponse = 'SaveChangesResponse',
    UpdateObjects = 'UpdateObjects'
}