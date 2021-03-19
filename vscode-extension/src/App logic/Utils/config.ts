import { ConfigurationTarget, Uri, workspace, WorkspaceConfiguration } from "vscode";

export class Config {
    static app: string = 'atddTestScriptor';
    public static removalModeConfirmation: string = 'Ask for confirmation';
    public static removalModeNoConfirmationNoRemoval: string = 'No confirmation & no removal'
    public static removalModeNoConfirmationButRemoval: string = 'No confirmation, but removal'

    public static getAddInitializeFunction(uri?: Uri): boolean {
        return this.getConfig(uri).get<boolean>('addInitializeFunction', true);
    }
    static setAddInitializeFunction(newValue: boolean | undefined, uri?: Uri) {
        this.getConfig(uri).update('addInitializeFunction', newValue, ConfigurationTarget.Workspace);
    }
    static getAddException(uri?: Uri): boolean {
        return this.getConfig(uri).get<boolean>('addException', false)
    }
    static getPrefixGiven(uri?: Uri): string {
        return this.getConfig(uri).get<string>('prefixGiven', '');
    }
    static getPrefixWhen(uri?: Uri): string {
        return this.getConfig(uri).get<string>('prefixWhen', '');
    }
    static getPrefixThen(uri?: Uri): string {
        return this.getConfig(uri).get<string>('prefixThen', '');
    }
    static getPrefixGivenHistory(uri: Uri | undefined): string[] {
        return this.getConfig(uri).get<string[]>('prefixGivenHistory', []);
    }
    static getPrefixWhenHistory(uri: Uri | undefined): string[] {
        return this.getConfig(uri).get<string[]>('prefixWhenHistory', []);
    }
    static getPrefixThenHistory(uri: Uri | undefined): string[] {
        return this.getConfig(uri).get<string[]>('prefixThenHistory', []);
    }
    static getRemovalMode(uri?: Uri): string {
        return this.getConfig(uri).get<string>('removalMode', '');
    }
    static getTestSrcFolder(): string | undefined {
        return this.getConfig().get<string>('testDirectory');
    }
    static getShowConfirmations(uri: Uri | undefined): boolean {
        return this.getConfig(uri).get<boolean>('showConfirmations', true);
    }
    private static getConfig(uri?: Uri): WorkspaceConfiguration {
        return workspace.getConfiguration(this.app, uri);
    }
}