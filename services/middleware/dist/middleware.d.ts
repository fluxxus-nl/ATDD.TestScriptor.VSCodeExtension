import { HubConnection } from "@microsoft/signalr";
export declare class ATDDMiddleware {
    _connection: HubConnection;
    constructor();
    init(url: string): Promise<void>;
    connect(): Promise<boolean>;
    dispose(): Promise<void>;
    getProjects(msg: Array<string>): Promise<any>;
}
