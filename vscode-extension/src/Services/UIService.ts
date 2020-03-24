import { singleton } from 'aurelia-dependency-injection';
import { window, Progress, CancellationToken, ProgressLocation } from 'vscode';

@singleton()
export class UIService {
    public async info(message: string) {
        return await window.showInformationMessage(message);
    }

    public async warn(message: string) {
        return await window.showWarningMessage(message);
    }

    public async error(message: string) {
        return await window.showErrorMessage(message);
    }

    public async progress(message: string, task: (progress: Progress<{ message?: string; increment?: number }>, token: CancellationToken) => Promise<boolean>): Promise<boolean> {
        return await window.withProgress({
            location: ProgressLocation.Notification,
            title: message,
            cancellable: true
        }, task);
    }

    public async filepicker(filters?: { [name: string]: string[] }, label?: string): Promise<string> {
        let uri = await window.showSaveDialog({ filters: filters, saveLabel: label });
        return <string>uri?.fsPath;
    }
}