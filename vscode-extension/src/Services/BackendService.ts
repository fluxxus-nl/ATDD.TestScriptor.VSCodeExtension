import { Application } from "../Application";
import { singleton } from "aurelia-dependency-injection";
import { ChildProcess, execFile } from "child_process";
import { join } from 'path';
import { platform } from 'os';
import { chmodSync } from 'fs';
import { getPortPromise } from 'portfinder';

@singleton(true)
export class BackendService {

    constructor() {
    }

    public process!: ChildProcess;

    public port: number = 0;

    public async start(extensionPath: string) {
        return new Promise(async (resolve, reject) => {
            let debug = Application.debugMode === true;
            if (!debug) {
                this.port = await this.getPort();

                let osFolder = '';
                let osPlatform: string = platform();
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

                let exePath = join(extensionPath, 'bin', osFolder, 'ATDD.TestScriptor.BackendServices');

                // set executable chmod on linux/osx platforms
                if (osPlatform != 'win32') {
                    try {
                        chmodSync(exePath, 0o755);
                    } catch (e) {
                        Application.log.error(`Setting Chmod 755 for ATDD.TestScriptor.BackendServices executable failed. Platform ${osPlatform}\n`, e);
                    }
                }
                if (!this.process) {
                    this.process = execFile(exePath, ['--urls', `http://0.0.0.0:${this.port}`], { windowsHide: false }, (error, stdout, stderr) => {
                        if (error) {
                            throw error;
                        }
                        Application.log.debug(stdout);
                    });
                    this.process.stdout!.on('data', (data) => {
                        let line = data.toString();
                        if (line.indexOf('Now listening on') != -1)
                            resolve(true);
                    });
                } else {
                    resolve(true);
                }
            } else {
                this.port = 5000;
                resolve(true);
            }
        });
    }

    private async getPort() {
        let newPort = await getPortPromise({ port: 42000, stopPort: 42150 });
        return newPort;
    }

    public async stop() {
        return new Promise((resolve, reject) => {
            if (this.process) {
                this.process.kill();

                this.process.on('close', (code, signal) => {
                    resolve(true);
                });
            } else {
                resolve(true);
            }
        });
    }

    public async checkState(extensionPath: string, forceRestart: boolean) {
        if (this.process) {
            await this.stop();
        }

        await this.start(extensionPath);
    }
}