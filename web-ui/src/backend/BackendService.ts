import { Actions } from './../actions/index';
import { BackendType } from './BackendType';
import { connectTo, Store } from 'aurelia-store';
import { State } from 'state';
import updateBackendMode from 'actions/updateBackendMode';

@connectTo<State>()
export class BackendService implements IBackendService {

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
        let newType = (<any>window).vscodeIntegration === true ? BackendType.VSCode : BackendType.Standalone;
        this.store.dispatch(Actions.updateBackendMode, newType);
    }
}

export interface IBackendService {
    loadTests(): Promise<void>;
    runTest(entry: any): Promise<void>;
    runAllTests(project?: any): Promise<void>;
    saveChanges(entries: any): Promise<void>;
}