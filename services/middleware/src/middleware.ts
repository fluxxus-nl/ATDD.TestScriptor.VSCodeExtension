import { HubConnectionState, HubConnectionBuilder, LogLevel, HubConnection } from "@microsoft/signalr";

export class ATDDMiddleware {
    public _connection: HubConnection;

    constructor() {

    }

    async init(url: string) {
        this._connection = new HubConnectionBuilder()
        .withUrl(`${url}/alhub`)
        .configureLogging(LogLevel.Debug)
        .build();

        await this.connect();
    }

    async connect(): Promise<boolean> {
        try {
            await this._connection.start();
            console.log("connected");
            return true;
        } catch (e) {
            console.log('connection failed', e);
            return false;
        }
    }

    async dispose() {
        if ([HubConnectionState.Disconnected, HubConnectionState.Disconnecting].indexOf(this._connection.state) != -1)
            return;

        await this._connection.stop();
    }

    async getProjects(msg: string) {
        this._connection.on('GetProjects', (msg: string) => {
            console.log(msg);
        });

        await this._connection.invoke('QueryProjects', msg);
    }
}
