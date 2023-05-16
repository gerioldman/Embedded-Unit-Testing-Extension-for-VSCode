import { type } from 'os';
import * as vscode from 'vscode';
import { ModelHandler } from './modelHandler';

export namespace unitViewTree {

    /**
     * The type of the tree item
     *
     * @export
     * @enum {number}
     */
    export enum Type {
        nothing,    // Used for undefined
        unit,  // A unit
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
     * A tree item for the unit editor
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
            if (type === Type.unit) {
                this.contextValue = 'unit';
                this.iconPath = vscode.Uri.file(vscode.extensions.getExtension('gerioldman.embedded-unit-testing-extension')?.extensionPath + '/resources/unit.svg');
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
     * The tree view for the unit editor
     *
     * @export
     * @class unitView
     * @implements {vscode.TreeDataProvider<ViewTreeItem>}
     */
    export class UnitView implements vscode.TreeDataProvider<ViewTreeItem>
    {
        /**
         * The tree data
         *
         * @type {ViewTreeItem[]}
         * @memberof unitView
         */
        public treeData: ViewTreeItem[] = [];

        /**
         * Event that is fired when the tree data changes
         *
         * @private
         * @type {(vscode.EventEmitter<ViewTreeItem | undefined>)}
         * @memberof unitView
         */
        private _onDidChangeTreeData: vscode.EventEmitter<ViewTreeItem | undefined> = new vscode.EventEmitter<ViewTreeItem | undefined>();

        /**
         * Event that is fired when the tree data changes
         *
         * @type {(vscode.Event<ViewTreeItem | undefined>)}
         * @memberof unitView
         */
        onDidChangeTreeData?: vscode.Event<ViewTreeItem | undefined> = this._onDidChangeTreeData.event;

        public model: ModelHandler.Model | undefined = undefined;

        /**
         * Creates an instance of unitView.
         * @memberof unitView
         */
        constructor(model: ModelHandler.Model) {
            this.model = model;
        }

        /**
         * Refresh the tree data
         *
         * @param {ModelHandler.Model} model
         * @memberof unitView
         */
        public buildTreeData(model: ModelHandler.Model) {
            this.treeData = [];
            model.units?.forEach(unit => {
                const unitItem = new ViewTreeItem(unit.name, Type.unit);
                unit.testSuites?.forEach(testSuite => {
                    const testSuiteItem = new ViewTreeItem(testSuite.name, Type.testSuite);
                    testSuite.testCases?.forEach(testCase => {
                        const testCaseItem = new ViewTreeItem(testCase.name, Type.testCase);
                        testSuiteItem.addChild(testCaseItem);
                    });
                    unitItem.addChild(testSuiteItem);
                });
                this.treeData.push(unitItem);
            });

            this._onDidChangeTreeData.fire(undefined);
        }

        /**
         * Creates a new unit, and adds it to the tree data
         *
         * @memberof unitView
         */
        createunit(context: vscode.ExtensionContext) {
            vscode.window.showInputBox(
                {
                    prompt: 'Enter the name of the Unit',
                    placeHolder: 'Unit name',
                    validateInput: (value: string) => {
                        // Check if the name is empty
                        if (value.length === 0) {
                            return 'The name of the Unit cannot be empty';
                        }
                        // Check if the name already exists
                        if (this.treeData.find(item => item.label === value)) {
                            return 'The name of the Unit already exists';
                        }
                        // Check if the name contains only letters, numbers and underscores
                        if (!value.match(/^[a-zA-Z0-9_]+$/)) {
                            return 'The name of the unit can only contain letters, numbers and underscores';
                        }
                        return null;
                    }
                }
            )
                .then((name) => {
                    if (name) {
                        this.addunit(context,new ViewTreeItem(name, Type.unit));
                    }
                });
        }

        /**
         * Deletes a unit from the tree data
         *
         * @param {ViewTreeItem} unit
         * @memberof unitView
         */
        deleteunit(unit: ViewTreeItem) {
            vscode.window.showQuickPick(['Yes', 'No'], { placeHolder: 'Are you sure you want to delete this unit?' })
                .then((value) => {
                    if (value === 'Yes') {
                        this.treeData = this.treeData.filter(item => item !== unit);
                        this.model?.viewTreeListener(unit, ChangeType.delete);
                        this._onDidChangeTreeData.fire(undefined);
                    }
                });
        }

        /**
         * Creates a new TestSuite, and adds it to the tree data
         *
         * @param {ViewTreeItem} element
         * @memberof unitView
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
                        if (value === 'TestSuite' || value === 'TestCase') {
                            return 'The name of the TestSuite cannot be TestSuite or TestCase';
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
         * @memberof unitView
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
         * @memberof unitView
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
                        if (value === 'TestSuite' || value === 'TestCase') {
                            return 'The name of the TestSuite cannot be TestSuite or TestCase';
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
         * @memberof unitView
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
         * @memberof unitView
         */
        getTreeItem(element: ViewTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
            return element;
        }

        /**
         * Get the children of the given element
         *
         * @param {(ViewTreeItem | undefined)} element
         * @return {*}  {vscode.ProviderResult<ViewTreeItem[]>}
         * @memberof unitView
         */
        getChildren(element: ViewTreeItem | undefined): vscode.ProviderResult<ViewTreeItem[]> {
            if (element) {
                return element.children;
            } else {
                return this.treeData;
            }
        }

        /**
         * Add unit to the view tree
         *
         * @param {ViewTreeItem} unit
         * @memberof unitView
         */
        addunit(context: vscode.ExtensionContext,unit: ViewTreeItem) {
            if (unit.type === Type.unit) {
                unit.iconPath = vscode.Uri.joinPath(context.extensionUri, "resources/unit.svg");
                this.treeData.push(unit);
                this.model?.viewTreeListener(unit, ChangeType.create);
                this._onDidChangeTreeData.fire(undefined);
            }
            else {
                throw new Error('The type of the item is not a unit');
            }
        }

        /**
         * Add a test suite to the view tree
         *
         * @param {ViewTreeItem} testSuite
         * @memberof unitView
         */
        addTestSuite(unit: ViewTreeItem, testSuite: ViewTreeItem) {
            if (testSuite.type === Type.testSuite && unit.type === Type.unit) {
                unit.addChild(testSuite);
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
         * @memberof unitView
         */
        addTestCase(unit: ViewTreeItem, testCase: ViewTreeItem) {
            if (testCase.type === Type.testCase && unit.type === Type.testSuite) {
                unit.addChild(testCase);
                this.model?.viewTreeListener(testCase, ChangeType.create);
                this._onDidChangeTreeData.fire(undefined);
            }
            else {
                throw new Error('The type of the item is not a test case');
            }
        }
    }
}