import { IBackendConnector } from './IBackendConnector';
export class DummyConnector implements IBackendConnector {

    constructor() {
    }

    async send(payload: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            console.log(payload);
            resolve(payload);
        });
    }
}