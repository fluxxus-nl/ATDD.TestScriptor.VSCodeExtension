import { DummyConnector } from './connectors/DummyConnector';
import { VSCodeConnector } from './connectors/VSCodeConnector';
import { IBackendConnector } from './connectors/IBackendConnector';
import { BackendType } from './BackendType';

export class BackendService implements IBackendService {

    private _type: BackendType;
    private backendClient: IBackendConnector;

    constructor() {
    }

    async loadTests(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async saveChanges(entries: any): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async runTest(entry: any): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async runAllTests(project?: any): Promise<void> {
        throw new Error("Method not implemented.");
    }

    determineType() {
        this._type = (<any>window).acquireVsCodeApi ? BackendType.VSCode : BackendType.Standalone;

        switch (this._type) {
            default:
                this.backendClient = new DummyConnector();
                break;
            case BackendType.VSCode:
                this.backendClient = new VSCodeConnector();
                break;
        }
    }

    get type() {
        return this._type;
    }
}

export interface IBackendService {
    loadTests(): Promise<void>;
    runTest(entry: any): Promise<void>;
    runAllTests(project?: any): Promise<void>;
    saveChanges(entries: any): Promise<void>;
}