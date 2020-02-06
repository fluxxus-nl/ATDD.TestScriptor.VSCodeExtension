import { DummyConnector } from 'backend/connectors/DummyConnector';
import { VSCodeConnector } from 'backend/connectors/VSCodeConnector';
import { IBackendConnector } from 'backend/connectors/IBackendConnector';
import { autoinject, PLATFORM, Container } from 'aurelia-framework';

@autoinject()
export class BackendService implements IBackendService {

    private _type: BackendType;
    private _startupOptions: IStartupOptions;
    private backendClient: IBackendConnector;
    private container: Container;

    constructor() {
        this.container = Container.instance;
        
        this.determineType();
        this.determineStartup();        
    }

    async send(message: any): Promise<any> {
        return await this.backendClient.send(message);
    }

    determineType() {
        this._type = typeof (<any>PLATFORM.global).vscode == "object" ? BackendType.VSCode : BackendType.Standalone;
        //@ts-ignore
        console.log((<any>PLATFORM.global).vscode);

        switch (this._type) {
            case BackendType.VSCode:
                this.backendClient = this.container.get(VSCodeConnector);
                break;
            default:
                this.backendClient = this.container.get(DummyConnector);
                break;
        }

        console.log(this.backendClient);
    }

    determineStartup() {
        let optionStr = (<any>PLATFORM.global).startupOptions;

        if (typeof optionStr !== "string") {
            this._startupOptions = {
                start: 'home',
                options: {}
            };

            return;
        }

        let options: IStartupOptions = JSON.parse(optionStr);
        this._startupOptions = options;
    }

    get type() {
        return this._type;
    }

    get startup() {
        return this._startupOptions;
    }
}

export interface IBackendService {
    send(message: any): Promise<any>;
}

export interface IStartupOptions {
    start: string;
    options: any;
}

export enum BackendType {
    VSCode = "vscode",
    Standalone = "standalone"
}