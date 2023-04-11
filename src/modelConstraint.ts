import * as constraintContainer from './ConstraintContainer';
import * as vscode from 'vscode';

export class ModelConstraintContainer extends constraintContainer.IConstraintContainer {
    constructor() {
        super(
            [
                /* Model constraint ID 001: workspace Folder check */
                {
                    name: "MC_001",
                    check: async() => {
                        let result: constraintContainer.ConstraintResult = {
                            result: false,
                            severity: "error",
                            message: "Extension does not support multi-root workspaces currently!"
                        };
                        if (vscode.workspace.workspaceFolders?.length === 1) {
                            result.result = true;
                            result.severity = "info";
                            result.message = "Only one workspace folder found.";
                        }
                        return result;
                    }
                },
                /* Model constraint ID 002: Presence of .vscode folder */
                {
                    name: "MC_002",
                    check: async () => {
                        return new Promise<constraintContainer.ConstraintResult>(resolve  => {
                            let result: constraintContainer.ConstraintResult = {
                                result: false,
                                severity: "error",
                                message: "No .vscode folder found in workspace folder!"
                            };
                            let folderUri = vscode.workspace.workspaceFolders![0].uri;
                            let vscodeFolderUri = vscode.Uri.joinPath(folderUri, ".vscode");
                            vscode.workspace.fs.stat(vscodeFolderUri).then(
                                (value) => {
                                    if (value.type === vscode.FileType.Directory) {
                                        result.result = true;
                                        result.severity = "info";
                                        result.message = ".vscode folder found.";
                                    }
                                    resolve(result);
                                }
                            );
                        });
                    }
                }
            ]
        );
    }
}