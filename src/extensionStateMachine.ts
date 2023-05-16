import * as vscode from 'vscode';
import { ModelHandler } from './modelHandler';
import { unitViewTree } from './unitViewTree';
import { ProjectGenerator } from './projectGenerator';

export namespace ModelStateMachine {
    enum State {
        // Declare all states here as needed
        initial,
        modelLoaded,
        modelNotExist,

    }

    export type Action = (from: State) => void;

    export type Transition = {
        from: State[],
        when: (from: State) => Promise<boolean>,
        actions: Action[],
    };

    export class ModelStateMachine {
        state: State = State.initial;
        transitions: Transition[] = [];
        modelHandler: ModelHandler.Model = new ModelHandler.Model();
        unitViewTreeView: unitViewTree.UnitView = new unitViewTree.UnitView(this.modelHandler);
        projectGenerator: ProjectGenerator.ProjectGenerator = new ProjectGenerator.ProjectGenerator(this.modelHandler);
        terminal: vscode.Terminal | undefined;

        public async process() {
            for (const transition of this.transitions) {
                if (transition.from.includes(this.state)) {
                    if (await transition.when(this.state)) {
                        for (const action of transition.actions) {
                            action(this.state);
                        }
                    }
                }
            }
        }

        public async configureProject(_context: vscode.ExtensionContext) {
            if (this.terminal === undefined) {
                this.terminal = vscode.window.createTerminal(
                    "VSCode unit Editor",
                );
            }
            this.terminal.show();
            let path: string = vscode.workspace.workspaceFolders![0].uri.fsPath;
            this.terminal.sendText("cd " + path);
            try {
                let result = await vscode.workspace.fs.stat(vscode.Uri.joinPath(vscode.workspace.workspaceFolders![0].uri, "builddir"));

                if (result.type === vscode.FileType.Directory) {
                    this.terminal.sendText("meson setup builddir --cross-file=integration/cross_compile.build --wipe");
                }
            }
            catch (e: any) {
                if (e.code !== "EntryNotFound") {
                    this.terminal.sendText("meson setup builddir --cross-file=integration/cross_compile.build");
                }
                else {
                    vscode.window.showErrorMessage("Error during configuring build system: " + e);
                }
            }

        }

        public async compileProject(_context: vscode.ExtensionContext) {
            if (this.terminal === undefined) {
                this.terminal = vscode.window.createTerminal(
                    "VSCode unit Editor",
                );
            }
            this.terminal.show();
            let path: string = vscode.workspace.workspaceFolders![0].uri.fsPath;
            this.terminal.sendText("cd " + path);
            this.terminal.sendText("ninja -C builddir");
        }

        public async flashProject(_context: vscode.ExtensionContext) {
            if (this.terminal === undefined) {
                this.terminal = vscode.window.createTerminal(
                    "VSCode unit Editor",
                );
            }
            this.terminal.show();
            let path: string = vscode.workspace.workspaceFolders![0].uri.fsPath;
            this.terminal.sendText("cd " + path);
            this.terminal.sendText("ninja -C builddir flash");
        }

        public async runTests(_context: vscode.ExtensionContext) {
            if (this.terminal === undefined) {
                this.terminal = vscode.window.createTerminal(
                    "VSCode unit Editor",
                );
            }
            this.terminal.show();
            let path: string = vscode.workspace.workspaceFolders![0].uri.fsPath;
            this.terminal.sendText("cd " + path);
            this.terminal.sendText("ninja -C builddir test");
        }

        public async runCoverage(_context: vscode.ExtensionContext) {
            if (this.terminal === undefined) {
                this.terminal = vscode.window.createTerminal(
                    "VSCode unit Editor",
                );
            }
            this.terminal.show();
            let path: string = vscode.workspace.workspaceFolders![0].uri.fsPath;
            this.terminal.sendText("cd " + path);
            this.terminal.sendText("ninja -C builddir coverage");
        }

        public async runStaticAnalysis(_context: vscode.ExtensionContext) {
            if (this.terminal === undefined) {
                this.terminal = vscode.window.createTerminal(
                    "VSCode unit Editor",
                );
            }
            this.terminal.show();
            let path: string = vscode.workspace.workspaceFolders![0].uri.fsPath;
            this.terminal.sendText("cd " + path);
            this.terminal.sendText("ninja -C builddir static_analysis");
        }

        constructor() {
            this.transitions.push(
                {
                    // Check for the modell, if it exists, load it
                    from: [State.initial],
                    when: async (state) => {
                        state; // unused
                        return vscode.workspace.workspaceFolders !== undefined;
                    },
                    actions: [
                        async (state) => {
                            state; // unused

                            let modelPath = vscode.Uri.joinPath(vscode.workspace.workspaceFolders![0].uri, ".vscode", "model.json");
                            let modelExists: boolean = false;
                            try {
                                let value = await vscode.workspace.fs.stat(modelPath);

                                if (value.type === vscode.FileType.File) {
                                    modelExists = true;
                                }
                            }
                            catch (e: any) {
                                if (e.code !== "EntryNotFound") {
                                    modelExists = false;
                                }
                                else {
                                    vscode.window.showErrorMessage("Error during searching for saved model: " + e);
                                    return;
                                }
                            }
                            if (modelExists) {
                                try {
                                    await this.modelHandler.loadModel(modelPath); // Load file if it exists
                                    this.state = State.modelLoaded;
                                    this.unitViewTreeView.buildTreeData(this.modelHandler);
                                }
                                catch (e) {
                                    vscode.window.showErrorMessage("Error loading found model: " + e);
                                    return;
                                }
                            }
                            else {
                                try {
                                    //await this.modelHandler.saveModel(modelPath); // Create file if it does not exist yet
                                    this.state = State.modelNotExist; // No model found, wait for user to init project
                                }
                                catch (e) {
                                    vscode.window.showErrorMessage("Model not found,trying to save intial model failed: " + e);
                                    return;
                                }
                            }
                        }
                    ],
                },
                {
                    // Check if workspace is opened, and if it is, create a new model
                    from: [State.modelNotExist],
                    when: async (state) => {
                        state; // unused
                        if (vscode.workspace.workspaceFolders === undefined) {
                            vscode.window.showErrorMessage("No workspace opened");
                        }
                        return vscode.workspace.workspaceFolders !== undefined;
                    },
                    actions: [
                        async (state) => {
                            state; // unused
                            try {
                                await this.modelHandler.saveModel(vscode.Uri.joinPath(vscode.workspace.workspaceFolders![0].uri, ".vscode", "model.json")); // Create file if it does not exist yet
                                this.state = State.modelLoaded;
                                this.unitViewTreeView.buildTreeData(this.modelHandler);
                            }
                            catch (e) {
                                vscode.window.showErrorMessage("Error saving initial model: " + e);
                                return;
                            }
                        }
                    ]
                }
            );
        }
    }

}