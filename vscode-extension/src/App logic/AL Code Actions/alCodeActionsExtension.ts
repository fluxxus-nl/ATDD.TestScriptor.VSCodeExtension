import * as vscode from 'vscode';
import { isNullOrUndefined } from "util";
import { APIInterface } from './apiInterface';

export class ALCodeActionsExtension {
    private static alCodeActionsExtension: ALCodeActionsExtension;
    private alCodeOutlineExtension: any;
    private constructor(alCodeOutlineExtension: vscode.Extension<any>) {
        this.alCodeOutlineExtension = alCodeOutlineExtension;
    }

    public static async getInstance(): Promise<ALCodeActionsExtension> {
        if (isNullOrUndefined(this.alCodeActionsExtension)) {
            this.setInstance();
        }
        await this.alCodeActionsExtension.activate();
        return this.alCodeActionsExtension;
    }

    private static setInstance() {
        let vsCodeExtension = vscode.extensions.getExtension('davidfeldhoff.al-codeactions');
        if (isNullOrUndefined(vsCodeExtension)) {
            throw new Error('AL Code Outline has to be installed.');
        }
        this.alCodeActionsExtension = new ALCodeActionsExtension(vsCodeExtension as vscode.Extension<any>);
    }

    private async activate() {
        if (!this.alCodeOutlineExtension.isActive) {
            await this.alCodeOutlineExtension.activate();
        }
    }

    public getAPI(): APIInterface {
        return this.alCodeOutlineExtension.exports;
    }

}