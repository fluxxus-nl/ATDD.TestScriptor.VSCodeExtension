import { ChildProcess } from "child_process";
import * as path from 'path';
import * as os from 'os';
import { execFile } from 'child_process';
import * as fs from 'fs';
import * as portFinder from 'portfinder';
import { LogService } from "./LogService";
const packageConfig: any = require('../../package.json');

export class BackendProvider {
    public static process: ChildProcess | null;

    public static port: number;

    public static async start(extensionPath: string) {
        return new Promise(async (resolve, reject) => {
            let debug = packageConfig.atddDebug === true;
            if (!debug) {
                BackendProvider.port = await BackendProvider.getPort();

                let osFolder = '';
                let osPlatform: string = os.platform();
                switch (osPlatform) {
                    default:
                        osFolder = 'linux';
                        break;
                    case "win32":
                        osFolder = 'windows';
                        break;
                    case 'darwin':
                        osFolder = 'macos';
                        break;                    
                }

                let exePath = path.join(extensionPath, 'bin', osFolder, 'ATDD.TestScriptor.BackendServices');

                // set executable chmod on linux/osx platforms
                if (osPlatform != 'win32') {
                    try {
                        fs.chmodSync(exePath, 0o755);
                    } catch (e) {
                        LogService.error(`Setting Chmod 755 for ATDD.TestScriptor.BackendServices executable failed. Platform ${osPlatform}\n`, e);
                    }
                }
                if (!BackendProvider.process) {
                    BackendProvider.process = execFile(exePath, ['--urls', `http://0.0.0.0:${BackendProvider.port}`], { windowsHide: false }, (error, stdout, stderr) => {
                        if (error) {
                            throw error;
                        }
                        LogService.debug(stdout);
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
                BackendProvider.port = 5000;
                resolve(true);
            }
        });
    }

    private static async getPort() {
        let newPort = await portFinder.getPortPromise({ port: 42000, stopPort: 42150 });
        return newPort;
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

        await BackendProvider.start(extensionPath);
    }
}