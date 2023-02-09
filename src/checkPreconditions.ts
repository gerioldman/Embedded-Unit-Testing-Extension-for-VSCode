
import * as vscode from 'vscode';

export function checkPreconditions(): boolean {
    if ( vscode.workspace.workspaceFolders !== undefined && vscode.workspace.workspaceFolders !== null) {
        if (vscode.workspace.workspaceFolders.length !== 0) {
            let foundFolder : boolean = false;
            vscode.workspace.workspaceFolders.forEach(workspaceFolder => {
                if (workspaceFolder.name === "UnitTestFramework") {
                    foundFolder = true;
                }
            });
            if (!foundFolder) {
                vscode.window.showErrorMessage("UnitTestRunner folder not found in workspace!");
                return false;
            }
        }
    }
    return true;
}