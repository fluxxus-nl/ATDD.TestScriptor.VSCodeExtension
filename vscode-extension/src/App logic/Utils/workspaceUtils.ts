import { dirname, join } from "path";
import { workspace, WorkspaceFolder } from "vscode";

export class WorkspaceUtils {
    public static getFullFsPathOfRelativePath(relativeFolder: string, fileName: string) {
        let relativeFsPath: string = join(relativeFolder, fileName);
        let fullFsPath: string;
        if (!workspace.workspaceFolders)
            throw new Error('No workspacefolder opened.');
        if (workspace.workspaceFile) {
            fullFsPath = join(dirname(workspace.workspaceFile.fsPath), relativeFsPath);
        } else if (workspace.workspaceFolders.length == 1) {
            let workspaceFolder: WorkspaceFolder = workspace.workspaceFolders[0];
            fullFsPath = join(workspaceFolder.uri.fsPath, relativeFsPath);
        } else {
            throw new Error('Expected to find the workspacefolder.')
        }
        return fullFsPath;
    }
}