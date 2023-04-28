import * as vscode from 'vscode';
import { ModelHandler } from './modelHandler';
import { ComponentViewTree } from './componentViewTree';
import { ProjectGenerator } from './projectGenerator';

export namespace ModelStateMachine {
    enum State {
        // Declare all states here as needed
        initial,
        initOver,

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
        componentViewTreeView: ComponentViewTree.ComponentView = new ComponentViewTree.ComponentView(this.modelHandler);
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
                    "VSCode Component Editor",
                );
            }
            this.terminal.show();
            this.terminal.sendText("meson setup builddir --cross-file=integration/cross_compile.build");
        }

        public async compileProject(_context: vscode.ExtensionContext) {
            if (this.terminal === undefined) {
                this.terminal = vscode.window.createTerminal(
                    "VSCode Component Editor",
                );
            }
            this.terminal.show();
            this.terminal.sendText("cd builddir;meson compile;cd ..");
        }

        public async flashProject(_context: vscode.ExtensionContext) {
            if (this.terminal === undefined) {
                this.terminal = vscode.window.createTerminal(
                    "VSCode Component Editor",
                );
            }
            this.terminal.show();
            this.terminal.sendText("cd builddir;meson compile flash;cd ..");
        }

        constructor() {
            this.transitions.push(
                {
                    // Try to load the model
                    from: [State.initial],
                    when: async (state) => {
                        state; // unused
                        return true;
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
                                }
                                catch (e) {
                                    vscode.window.showErrorMessage("Error loading found model: " + e);
                                    return;
                                }
                            }
                            else {
                                try {
                                    await this.modelHandler.saveModel(modelPath); // Create file if it does not exist yet
                                }
                                catch (e) {
                                    vscode.window.showErrorMessage("Model not found,trying to save intial model failed: " + e);
                                    return;
                                }

                            }

                            this.componentViewTreeView.buildTreeData(this.modelHandler);

                            this.state = State.initOver;
                        }
                    ],
                }
            );
        }
    }

}