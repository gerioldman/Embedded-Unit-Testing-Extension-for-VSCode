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

	let disposable0 = vscode.window.registerTreeDataProvider('unit_editor', modelStateMachine.unitViewTreeView);
    let disposable1 = vscode.commands.registerCommand('unit_editor.createunit', 	( ) => modelStateMachine.unitViewTreeView.createunit(context));
    let disposable2 = vscode.commands.registerCommand('unit_editor.deleteunit', 	(r) => modelStateMachine.unitViewTreeView.deleteunit(r));
    let disposable3 = vscode.commands.registerCommand('unit_editor.createTestSuite', 	(r) => modelStateMachine.unitViewTreeView.createTestSuite(r));
    let disposable4 = vscode.commands.registerCommand('unit_editor.deleteTestSuite', 	(r) => modelStateMachine.unitViewTreeView.deleteTestSuite(r));
    let disposable5 = vscode.commands.registerCommand('unit_editor.createTestCase', 	(r) => modelStateMachine.unitViewTreeView.createTestCase(r));
    let disposable6 = vscode.commands.registerCommand('unit_editor.deleteTestCase', 	(r) => modelStateMachine.unitViewTreeView.deleteTestCase(r));
    let disposable7 = vscode.commands.registerCommand('unit_editor.generateProject', 	( ) => modelStateMachine.projectGenerator.generateProject(context));
    let disposable8 = vscode.commands.registerCommand('unit_editor.configureProject', 	( ) => modelStateMachine.configureProject(context));
    let disposable9 = vscode.commands.registerCommand('unit_editor.compileProject', 	( ) => modelStateMachine.compileProject(context));
	let disposable10 = vscode.commands.registerCommand('unit_editor.flashProject', 	( ) => modelStateMachine.flashProject(context));
	let disposable11 = vscode.commands.registerCommand('unit_editor.runTests', 	( ) => modelStateMachine.runTests(context));
	let disposable12 = vscode.commands.registerCommand('unit_editor.runCoverage', 	( ) => modelStateMachine.runCoverage(context));
	let disposable13 = vscode.commands.registerCommand('unit_editor.runStaticAnalysis', 	( ) => modelStateMachine.runStaticAnalysis(context));

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
		disposable10,
		disposable11,
		disposable12,
		disposable13
	);
	
}

// This method is called when your extension is deactivated
export function deactivate() {}
