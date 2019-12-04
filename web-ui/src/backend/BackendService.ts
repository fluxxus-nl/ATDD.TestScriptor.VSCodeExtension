import { DummyConnector } from './connectors/DummyConnector';
import { VSCodeConnector } from './connectors/VSCodeConnector';
import { IBackendConnector } from './connectors/IBackendConnector';
import { Actions } from './../actions/index';
import { BackendType } from './BackendType';
import { connectTo, Store } from 'aurelia-store';
import { State } from 'state';
import updateBackendMode from 'actions/updateBackendMode';

@connectTo<State>()
export class BackendService implements IBackendService {

    private backendClient: IBackendConnector;

    constructor(private store: Store<State>) {
        this.store.registerAction(Actions.updateBackendMode.name, updateBackendMode);
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
        let newType = (<any>window).acquireVsCodeApi ? BackendType.VSCode : BackendType.Standalone;
        this.store.dispatch(Actions.updateBackendMode, newType);

        switch (newType) {
            default:
                this.backendClient = new DummyConnector();
                break;
            case BackendType.VSCode:
                this.backendClient = new VSCodeConnector();
                break;
        }
    }
}

export interface IBackendService {
    loadTests(): Promise<void>;
    runTest(entry: any): Promise<void>;
    runAllTests(project?: any): Promise<void>;
    saveChanges(entries: any): Promise<void>;
}