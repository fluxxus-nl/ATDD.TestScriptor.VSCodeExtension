import { workspace, WorkspaceFolder } from 'vscode';
import { readFile } from 'fs-extra';

export async function read(file: any): Promise<string> {
    return new Promise((resolve, reject) => {
        readFile(file, "utf8", (err: any, data: any) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

export function getWorkspacePaths() {
    let paths = workspace.workspaceFolders?.map((m: WorkspaceFolder) => m.uri.fsPath) as Array<string>;
    return paths;
}