import { PLATFORM } from 'aurelia-framework';
import { IBackendConnector } from './IBackendConnector';
export class VSCodeConnector implements IBackendConnector {

    protected vscode: any;

    constructor() {
        if (typeof(<any>PLATFORM.global).acquireVsCodeApi !== "function") {
            throw "Window.acquireVsCodeApi function is not registered.";
        }
    }

    async send(payload: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            let receiver = (event) => {
                window.removeEventListener('message', receiver);
                resolve(event.data);
            };
            window.addEventListener('message', (receiver).bind(this));
            let result = await this.vscode.postMessage(payload);

            if (result !== true) {
                reject('vscode.postMessage call was unsuccessful.');
            }
        });
    }
}