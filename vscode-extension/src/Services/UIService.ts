import { window, Progress, CancellationToken, ProgressLocation } from 'vscode';

export class UIService {
    public static async info(message: string) {
        return await window.showInformationMessage(message);
    }

    public static async warn(message: string) {
        return await window.showWarningMessage(message);
    }

    public static async error(message: string) {
        return await window.showErrorMessage(message);
    }

    public static async progress(message: string, task: (progress: Progress<{ message?: string; increment?: number }>, token: CancellationToken) => Promise<boolean>): Promise<boolean> {
        return await window.withProgress({
            location: ProgressLocation.Notification,
            title: message,
            cancellable: true
        }, task);
    }
}