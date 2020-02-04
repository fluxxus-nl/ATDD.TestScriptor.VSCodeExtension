import { ChildProcess } from "child_process";
import * as path from 'path';
import { execFile } from 'child_process';
import * as getPort from 'get-port';

export class BackendProvider {
    public static process: ChildProcess | null;

    public static port: number;

    public static workspaces: Array<string>;

    public static async start(extensionPath: string, wkspacePaths: Array<string>) {
        BackendProvider.workspaces = wkspacePaths || [];
        return new Promise(async (resolve, reject) => {
            let debug = false;
            if (!debug) {
                BackendProvider.port = await getPort({ port: getPort.makeRange(42000, 42010) });
                let exePath = path.join(extensionPath, 'bin', 'ATDD.TestScriptor.BackendServices');
                if (!BackendProvider.process) {
                    BackendProvider.process = execFile(exePath, ['--urls', `http://0.0.0.0:${BackendProvider.port}`, '--workspaces', `${BackendProvider.workspaces.join(';')}`], { windowsHide: false }, (error, stdout, stderr) => {
                        if (error) {
                            throw error;
                        }
                        console.log(stdout);
                    });
                    BackendProvider.process.stdout.on('data', (data) => {
                        let line = data.toString();
                        if (line.indexOf('Now listening on') != -1)
                            resolve(true);
                    });
                } else {
                    resolve(true);
                }
            } else {
                BackendProvider.port = 49289;
                resolve(true);
            }
        });
    }

    public static async stop() {
        return new Promise((resolve, reject) => {
            if (BackendProvider.process) {
                BackendProvider.process.kill();

                BackendProvider.process.on('close', (code, signal) => {
                    resolve(true);
                });
            } else {

                BackendProvider.process = null;
                resolve(true);
            }
        });
    }

    public static async checkState(extensionPath: string, forceRestart: boolean) {
        if (BackendProvider.process) {
            await BackendProvider.stop();
        }

        await BackendProvider.start(extensionPath, BackendProvider.workspaces);
    }
}