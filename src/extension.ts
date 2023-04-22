// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ModelStateMachine } from './extensionStateMachine';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	let modelStateMachine = new ModelStateMachine.ModelStateMachine();

	let disposable0 = vscode.window.registerTreeDataProvider('component_editor', modelStateMachine.componentViewTreeView);
    let disposable1 = vscode.commands.registerCommand('component_editor.createComponent', 	( ) => modelStateMachine.componentViewTreeView.createComponent());
    let disposable2 = vscode.commands.registerCommand('component_editor.deleteComponent', 	(r) => modelStateMachine.componentViewTreeView.deleteComponent(r));
    let disposable3 = vscode.commands.registerCommand('component_editor.createTestSuite', 	(r) => modelStateMachine.componentViewTreeView.createTestSuite(r));
    let disposable4 = vscode.commands.registerCommand('component_editor.deleteTestSuite', 	(r) => modelStateMachine.componentViewTreeView.deleteTestSuite(r));
    let disposable5 = vscode.commands.registerCommand('component_editor.createTestCase', 	(r) => modelStateMachine.componentViewTreeView.createTestCase(r));
    let disposable6 = vscode.commands.registerCommand('component_editor.deleteTestCase', 	(r) => modelStateMachine.componentViewTreeView.deleteTestCase(r));
    let disposable7 = vscode.commands.registerCommand('component_editor.generateProject', 	( ) => modelStateMachine.projectGenerator.generateProject());
    let disposable8 = vscode.commands.registerCommand('component_editor.configureProject', 	( ) => modelStateMachine.configureProject());
    let disposable9 = vscode.commands.registerCommand('component_editor.compileProject', 	( ) => modelStateMachine.compileProject());
	let disposable10 = vscode.commands.registerCommand('component_editor.flashProject', 	( ) => modelStateMachine.flashProject());

	modelStateMachine.process();

	context.subscriptions.push(
		disposable0,
		disposable1,
		disposable2,
		disposable3,
		disposable4,
		disposable5,
		disposable6,
		disposable7,
		disposable8,
		disposable9,
		disposable10
	);
	
}

// This method is called when your extension is deactivated
export function deactivate() {}
