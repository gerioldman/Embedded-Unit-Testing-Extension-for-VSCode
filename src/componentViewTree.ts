import { type } from 'os';
import * as vscode from 'vscode';
import { ModelHandler } from './modelHandler';

export namespace ComponentViewTree {

    /**
     * The type of the tree item
     *
     * @export
     * @enum {number}
     */
    export enum Type {
        nothing,    // Used for undefined
        component,  // A component
        testSuite,  // A test suite
        testCase    // A test case
    }

    export enum ChangeType {
        create,
        delete
    }

    /**
     * A listener for the ViewTreeItem
     * 
     * @export
     * @interface ViewTreeListener
     */
    export type ViewTreeListener = (item: ViewTreeItem, type: ChangeType, thisArg?: any) => void;

    /**
     * A tree item for the component editor
     *
     * @export
     * @class ViewTreeItem
     * @extends {vscode.TreeItem}
     */
    export class ViewTreeItem extends vscode.TreeItem {
        public type: Type = Type.nothing;
        public parent: ViewTreeItem | undefined = undefined;
        public children: ViewTreeItem[] = [];

        constructor(label: string, type: Type, children?: ViewTreeItem[]) {
            super(label, vscode.TreeItemCollapsibleState.None);
            this.type = type;
            if (type === Type.component) {
                this.contextValue = 'component';
                this.iconPath = vscode.Uri.file(vscode.extensions.getExtension('gerioldman.vscodeextension-sandbox')?.extensionPath + '/resources/component.svg');
            }
            else if (type === Type.testSuite) {
                this.contextValue = 'testSuite';
                this.iconPath = new vscode.ThemeIcon('symbol-class');
            }
            else if (type === Type.testCase) {
                this.contextValue = 'testCase';
                this.iconPath = new vscode.ThemeIcon('beaker');
            }
            else {
                throw new Error('Invalid type');
            }

            if (children) {
                this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
                this.children = children;
            }
        }

        /**
         * Add a child to the tree item
         *
         * @param {ViewTreeItem} child
         * @memberof ViewTreeItem
         */
        addChild(child: ViewTreeItem) {
            if (this.collapsibleState === vscode.TreeItemCollapsibleState.None) {
                this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
            }
            child.parent = this;
            this.children.push(child);
        }

        /**
         * Remove a child from the tree item
         *
         * @param {ViewTreeItem} child
         * @memberof ViewTreeItem
         */
        removeChild(child: ViewTreeItem) {
            this.children = this.children.filter(item => item !== child);
            if (this.children.length === 0) {
                this.collapsibleState = vscode.TreeItemCollapsibleState.None;
            }
        }
    }

    /**
     * The tree view for the component editor
     *
     * @export
     * @class ComponentView
     * @implements {vscode.TreeDataProvider<ViewTreeItem>}
     */
    export class ComponentView implements vscode.TreeDataProvider<ViewTreeItem>
    {
        /**
         * The tree data
         *
         * @type {ViewTreeItem[]}
         * @memberof ComponentView
         */
        public treeData: ViewTreeItem[] = [];

        /**
         * Event that is fired when the tree data changes
         *
         * @private
         * @type {(vscode.EventEmitter<ViewTreeItem | undefined>)}
         * @memberof ComponentView
         */
        private _onDidChangeTreeData: vscode.EventEmitter<ViewTreeItem | undefined> = new vscode.EventEmitter<ViewTreeItem | undefined>();

        /**
         * Event that is fired when the tree data changes
         *
         * @type {(vscode.Event<ViewTreeItem | undefined>)}
         * @memberof ComponentView
         */
        onDidChangeTreeData?: vscode.Event<ViewTreeItem | undefined> = this._onDidChangeTreeData.event;

        public model: ModelHandler.Model | undefined = undefined;

        /**
         * Creates an instance of ComponentView.
         * @memberof ComponentView
         */
        constructor(model: ModelHandler.Model) {
            this.model = model;
        }

        /**
         * Refresh the tree data
         *
         * @param {ModelHandler.Model} model
         * @memberof ComponentView
         */
        public buildTreeData(model: ModelHandler.Model) {
            this.treeData = [];
            model.components?.forEach(component => {
                const componentItem = new ViewTreeItem(component.name, Type.component);
                component.testSuites?.forEach(testSuite => {
                    const testSuiteItem = new ViewTreeItem(testSuite.name, Type.testSuite);
                    testSuite.testCases?.forEach(testCase => {
                        const testCaseItem = new ViewTreeItem(testCase.name, Type.testCase);
                        testSuiteItem.addChild(testCaseItem);
                    });
                    componentItem.addChild(testSuiteItem);
                });
                this.treeData.push(componentItem);
            });

            this._onDidChangeTreeData.fire(undefined);
        }

        /**
         * Creates a new component, and adds it to the tree data
         *
         * @memberof ComponentView
         */
        createComponent() {
            vscode.window.showInputBox(
                {
                    prompt: 'Enter the name of the component',
                    placeHolder: 'Component name',
                    validateInput: (value: string) => {
                        // Check if the name is empty
                        if (value.length === 0) {
                            return 'The name of the component cannot be empty';
                        }
                        // Check if the name already exists
                        if (this.treeData.find(item => item.label === value)) {
                            return 'The name of the component already exists';
                        }
                        // Check if the name contains only letters, numbers and underscores
                        if (!value.match(/^[a-zA-Z0-9_]+$/)) {
                            return 'The name of the component can only contain letters, numbers and underscores';
                        }
                        return null;
                    }
                }
            )
                .then((name) => {
                    if (name) {
                        this.addComponent(new ViewTreeItem(name, Type.component));
                    }
                });
        }

        /**
         * Deletes a component from the tree data
         *
         * @param {ViewTreeItem} component
         * @memberof ComponentView
         */
        deleteComponent(component: ViewTreeItem) {
            vscode.window.showQuickPick(['Yes', 'No'], { placeHolder: 'Are you sure you want to delete this component?' })
                .then((value) => {
                    if (value === 'Yes') {
                        this.treeData = this.treeData.filter(item => item !== component);
                        this.model?.viewTreeListener(component, ChangeType.delete);
                        this._onDidChangeTreeData.fire(undefined);
                    }
                });
        }

        /**
         * Creates a new TestSuite, and adds it to the tree data
         *
         * @param {ViewTreeItem} element
         * @memberof ComponentView
         */
        createTestSuite(element: ViewTreeItem) {
            vscode.window.showInputBox(
                {
                    prompt: 'Enter the name of the TestSuite',
                    placeHolder: 'TestSuite name',
                    validateInput: (value: string) => {
                        // Check if the name is empty
                        if (value.length === 0) {
                            return 'The name of the TestSuite cannot be empty';
                        }
                        // Check if the name already exists
                        for (let testSuite of element.children) {
                            if (
                                testSuite.label === value
                                || testSuite.children.find(item => item.label === value)) {
                                return 'TestSuites and TestCases cannot have the same name';
                            }
                        }

                        // Check if the name contains only letters, numbers and underscores
                        if (!value.match(/^[a-zA-Z0-9_]+$/)) {
                            return 'The name of the TestSuite can only contain letters, numbers and underscores';
                        }
                        return null;
                    }
                }
            )
                .then((name) => {
                    if (name) {
                        this.addTestSuite(element, new ViewTreeItem(name, Type.testSuite));
                    }
                });
        }

        /**
         * Deletes a TestSuite from the tree data
         *
         * @param {ViewTreeItem} element
         * @memberof ComponentView
         */
        deleteTestSuite(element: ViewTreeItem) {
            vscode.window.showQuickPick(['Yes', 'No'], { placeHolder: 'Are you sure you want to delete this TestSuite with all test cases?' })
                .then((value) => {
                    if (value === 'Yes') {
                        element.parent?.removeChild(element);
                        this.model?.viewTreeListener(element, ChangeType.delete);
                        this._onDidChangeTreeData.fire(undefined);
                    }
                });
        }

        /**
         * Creates a new TestCase, and adds it to the tree data
         *
         * @param {ViewTreeItem} element
         * @memberof ComponentView
         */
        createTestCase(element: ViewTreeItem) {
            vscode.window.showInputBox(
                {
                    prompt: 'Enter the name of the TestCase',
                    placeHolder: 'TestCase name',
                    validateInput: (value: string) => {
                        // Check if the name is empty
                        if (value.length === 0) {
                            return 'The name of the TestCase cannot be empty';
                        }
                        // Check if the name already exists
                        for (const testSuite of element.parent?.children ?? []) {
                            if (
                                testSuite.label === value
                                || testSuite.children.find(item => item.label === value)) {
                                return 'TestSuites and TestCases cannot have the same name';
                            }
                        }
                        // Check if the name contains only letters, numbers and underscores
                        if (!value.match(/^[a-zA-Z0-9_]+$/)) {
                            return 'The name of the TestCase can only contain letters, numbers and underscores';
                        }
                        return null;
                    }
                }
            )
                .then((name) => {
                    if (name) {
                        this.addTestCase(element, new ViewTreeItem(name, Type.testCase));
                    }
                });
        }

        /**
         * Deletes a TestCase from the tree data
         *
         * @param {ViewTreeItem} element
         * @memberof ComponentView
         */
        deleteTestCase(element: ViewTreeItem) {
            vscode.window.showQuickPick(['Yes', 'No'], { placeHolder: 'Are you sure you want to delete this TestCase?' })
                .then((answer) => {
                    if (answer === 'Yes') {
                        element.parent?.removeChild(element);
                        this.model?.viewTreeListener(element, ChangeType.delete);
                        this._onDidChangeTreeData.fire(undefined);
                    }
                });
        }
        /**
         * Get the tree item for the given element
         *
         * @param {ViewTreeItem} element
         * @return {*}  {(vscode.TreeItem | Thenable<vscode.TreeItem>)}
         * @memberof ComponentView
         */
        getTreeItem(element: ViewTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
            return element;
        }

        /**
         * Get the children of the given element
         *
         * @param {(ViewTreeItem | undefined)} element
         * @return {*}  {vscode.ProviderResult<ViewTreeItem[]>}
         * @memberof ComponentView
         */
        getChildren(element: ViewTreeItem | undefined): vscode.ProviderResult<ViewTreeItem[]> {
            if (element) {
                return element.children;
            } else {
                return this.treeData;
            }
        }

        /**
         * Add component to the view tree
         *
         * @param {ViewTreeItem} component
         * @memberof ComponentView
         */
        addComponent(component: ViewTreeItem) {
            if (component.type === Type.component) {
                component.iconPath = vscode.extensions.getExtension("gerioldman.vscodeextension-sandbox")?.extensionPath + "/resources/component.svg";
                this.treeData.push(component);
                this.model?.viewTreeListener(component, ChangeType.create);
                this._onDidChangeTreeData.fire(undefined);
            }
            else {
                throw new Error('The type of the item is not a component');
            }
        }

        /**
         * Add a test suite to the view tree
         *
         * @param {ViewTreeItem} testSuite
         * @memberof ComponentView
         */
        addTestSuite(component: ViewTreeItem, testSuite: ViewTreeItem) {
            if (testSuite.type === Type.testSuite && component.type === Type.component) {
                component.addChild(testSuite);
                this.model?.viewTreeListener(testSuite, ChangeType.create);
                this._onDidChangeTreeData.fire(undefined);
            }
            else {
                throw new Error('The type of the item is not a test suite');
            }
        }

        /**
         * Add a test case to the view tree
         *
         * @param {ViewTreeItem} testCase
         * @memberof ComponentView
         */
        addTestCase(component: ViewTreeItem, testCase: ViewTreeItem) {
            if (testCase.type === Type.testCase && component.type === Type.testSuite) {
                component.addChild(testCase);
                this.model?.viewTreeListener(testCase, ChangeType.create);
                this._onDidChangeTreeData.fire(undefined);
            }
            else {
                throw new Error('The type of the item is not a test case');
            }
        }
    }
}