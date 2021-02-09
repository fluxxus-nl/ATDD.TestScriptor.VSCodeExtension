import { dirname, join } from "path";
import { workspace, WorkspaceFolder } from "vscode";

export class WorkspaceUtils {
    public static getFullFsPathOfRelativePath(relativeFolder: string, fileName: string) {
        let relativeFsPath: string = join(relativeFolder, fileName);
        let fullFsPath: string;
        if (!workspace.workspaceFolders)
            throw new Error('No workspacefolder opened.');
        if (workspace.workspaceFile && workspace.workspaceFile.scheme != 'untitled') {
            let workspaceFilePath: string = dirname(workspace.workspaceFile.fsPath)
            fullFsPath = join(workspaceFilePath, relativeFsPath);
        } else if (workspace.workspaceFolders.length == 1) {
            let workspaceFolder: WorkspaceFolder = workspace.workspaceFolders[0];
            fullFsPath = join(workspaceFolder.uri.fsPath, relativeFsPath);
        } else if (workspace.workspaceFile && workspace.workspaceFile.scheme == 'untitled') {
            throw new Error('Please save the workspace before creating features.')
        } else {
            throw new Error('Expected to find the workspacefolder.')
        }
        return fullFsPath;
    }
}