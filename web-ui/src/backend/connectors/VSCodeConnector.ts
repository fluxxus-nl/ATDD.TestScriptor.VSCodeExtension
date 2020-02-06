import { PLATFORM } from 'aurelia-framework';
import { IBackendConnector } from './IBackendConnector';
export class VSCodeConnector implements IBackendConnector {

    protected vscode: any;

    constructor() {
        if (typeof (<any>PLATFORM.global).vscode !== "object") {
            throw "acquireVsCodeApi function is not registered.";
        }

        this.vscode = (<any>PLATFORM.global).vscode;
    }

    async send(payload: any): Promise<any> {
        return new Promise((resolve, reject) => {
            let receiver = (event) => {
                console.log('vscodeconnector received', event);
                window.removeEventListener('message', receiver);
                resolve(event.data);
            };
            window.addEventListener('message', receiver);

            console.log('payload sent', payload);
            this.vscode.postMessage([payload]);
        });
    }
}