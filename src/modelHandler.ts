const jsonc = require("jsonc-parser");
import * as vscode from 'vscode';
import { ComponentViewTree } from './componentViewTree';


export namespace ModelHandler {

    /**
     * Test case class
     *
     * @export
     * @class TestCase
     */
    export class TestCase {
        name: string;
        testSuite: TestSuite | undefined;

        constructor(name: string, testSuite?: TestSuite) {
            this.name = name;
            this.testSuite = testSuite;
        }
    }

    /**
     * Test suite class
     *
     * @export
     * @class TestSuite
     */
    export class TestSuite {
        name: string;
        testCases: TestCase[] = [];
        component: Component | undefined;
        constructor(name: string, testCases?: TestCase[], component?: Component) {
            this.name = name;
            this.component = component;
            testCases?.forEach(element => {
                this.addTestCase(element);
            });
        }

        /**
         * Add a test case to the test suite
         *
         * @param {TestCase} testCase
         * @memberof TestSuite
         */
        addTestCase(testCase: TestCase) {
            if (this.testCases === undefined) {
                this.testCases = [testCase];
            } else {
                this.testCases.forEach(element => {
                    if (element.name === testCase.name) {
                        throw new Error("Test case with name " + testCase.name + " already exists in test suite " + this.name);
                        return;
                    }
                });
                this.testCases.push(testCase);
            }
        }

        /**
         * Remove a test case from the test suite
         *
         * @param {TestCase} testCase
         * @memberof TestSuite
         */
        removeTestCase(testCase: TestCase) {
            if (this.testCases === undefined) {
                throw new Error("No test cases in test suite " + this.name);
            } else {
                let testCaseToDelete = this.testCases.find(element => element === testCase);
                if (testCaseToDelete === undefined) {
                    throw new Error("Test case with name " + testCase.name + " does not exist in test suite " + this.name);
                }
                else {
                    this.testCases.splice(this.testCases.indexOf(testCaseToDelete), 1);
                }

            }
        }
    }

    /**
     * Component class
     *
     * @export
     * @class Component
     */
    export class Component {
        name: string;
        testSuites: TestSuite[] = [];
        constructor(name: string, testSuites?: TestSuite[]) {
            this.name = name;
            testSuites?.forEach(element => {
                this.addTestSuite(element);
            });
        }

        /**
         * Add a test suite to the component
         *
         * @param {TestSuite} testSuite
         * @memberof Component
         */
        addTestSuite(testSuite: TestSuite) {
            if (this.testSuites === undefined) {
                this.testSuites = [testSuite];
            } else {
                this.testSuites.forEach(element => {
                    if (element.name === testSuite.name) {
                        throw new Error("Test suite with name " + testSuite.name + " already exists in component " + this.name);
                    }
                });
                this.testSuites.push(testSuite);
            }
        }

        /**
         * Remove a test suite from the component
         *
         * @param {TestSuite} testSuite
         * @memberof Component
         */
        removeTestSuite(testSuite: TestSuite) {
            if (this.testSuites === undefined) {
                throw new Error("No test suites in component " + this.name);
            } else {
                let testSuiteToDelete = this.testSuites.find(element => element === testSuite);
                if (testSuiteToDelete === undefined) {
                    throw new Error("Test suite with name " + testSuite.name + " does not exist in component " + this.name);
                }
                else {
                    this.testSuites.splice(this.testSuites.indexOf(testSuiteToDelete), 1);
                }
            }
        }

    }

    /**
     * Model class
     *
     * @export
     * @class Model
     */
    export class Model {
        components: Component[] = [];
        constructor(components?: Component[]) {
            components?.forEach(element => {
                this.components.push(element);
            });
        }

        /**
         * Add a component to the model
         *
         * @param {Component} component
         * @memberof Model
         */
        addComponent(component: Component) {
            if (this.components === undefined) {
                this.components = [component];
            } else {
                this.components.forEach(element => {
                    if (element.name === component.name) {
                        throw new Error("Component with name " + component.name + " already exists in model");
                    }
                });
                this.components.push(component);
            }
        }

        /**
         * Remove a component from the model
         *
         * @param {Component} component
         * @memberof Model
         */
        removeComponent(component: Component) {
            if (this.components === undefined) {
                throw new Error("No components in model");
            } else {
                let componentToDelete = this.components.find(element => element === component);
                if (componentToDelete === undefined) {
                    throw new Error("Component with name " + component.name + " does not exist in model");
                }
                else {
                    this.components.splice(this.components.indexOf(componentToDelete), 1);
                }
            }
        }

        /**
         * Save the model to a file
         *
         * @param {vscode.Uri} modelPath
         * @memberof Model
         */
        saveModel(modelPath: vscode.Uri) {
            return vscode.workspace.fs.writeFile(modelPath, Buffer.from(JSON.stringify(this)));
        }

        /**
         * Load the model from a file
         *
         * @param {vscode.Uri} modelPath
         * @return {*} 
         * @memberof Model
         */
        async loadModel(modelPath: vscode.Uri) {
            try {
                let result = await vscode.workspace.fs.readFile(modelPath);
                let model: Model = jsonc.parse(result.toString());
                for (let component of model.components) {
                    let newComponent = new Component(component.name);
                    for (let testSuite of component.testSuites) {
                        let newTestSuite = new TestSuite(testSuite.name);
                        for (let testCase of testSuite.testCases) {
                            let newTestCase = new TestCase(testCase.name);
                            newTestSuite.addTestCase(newTestCase);
                        }
                        newComponent.addTestSuite(newTestSuite);
                    }
                    this.addComponent(newComponent);
                }
            } catch (error) {
                throw new Error("Could not load model from file " + modelPath.path);
            }

        }

        /**
         * Update the view tree based on the received model change
         *
         * @memberof Model
         */
        viewTreeListener(item: ComponentViewTree.ViewTreeItem, type: ComponentViewTree.ChangeType) {
            switch (type) {
                case ComponentViewTree.ChangeType.create:
                    switch (item.type) {
                        case ComponentViewTree.Type.component:
                            this.addComponent(new Component(item.label as string));
                            break;

                        case ComponentViewTree.Type.testSuite:
                            this.components?.find(element => element.name === item.parent?.label)?.addTestSuite(new TestSuite(item.label as string));
                            break;

                        case ComponentViewTree.Type.testCase:
                            this.components?.find(element => element.name === item.parent?.parent?.label)?.testSuites?.find(element => element.name === item.parent?.label)?.addTestCase(new TestCase(item.label as string));
                            break;

                        default:
                            break;
                    }
                    break;
                case ComponentViewTree.ChangeType.delete:
                    switch (item.type) {
                        case ComponentViewTree.Type.component:
                            let component = this.components?.find(element => element.name === item.label);
                            if (component !== undefined) {
                                this.removeComponent(component);
                            }
                            else {
                                throw new Error("Component with name " + item.label + " does not exist in model");
                            }

                            break;
                        case ComponentViewTree.Type.testSuite:
                            let componentTS = this.components?.find(element => {
                                return undefined !== element.testSuites?.find(element => element.name === item.label);
                            });
                            if (componentTS !== undefined) {
                                let testSuite = componentTS.testSuites?.find(element => element.name === item.label);
                                if (testSuite !== undefined) {
                                    componentTS.removeTestSuite(testSuite);
                                }
                                else {
                                    throw new Error("Test suite with name " + item.label + " does not exist in component " + componentTS.name);
                                }
                            }
                            else {
                                throw new Error("Component with name " + item.parent?.label + " does not exist in model");
                            }
                            break;
                        case ComponentViewTree.Type.testCase:
                            let componentTC = this.components?.find(element => {
                                return undefined !== element.testSuites?.find(element => {
                                    return undefined !== element.testCases?.find(element => element.name === item.label);
                                });
                            });
                            if (componentTC !== undefined) {
                                let testSuite = componentTC.testSuites?.find(element => {
                                    return undefined !== element.testCases?.find(element => element.name === item.label);
                                });
                                if (testSuite !== undefined) {
                                    let testCase = testSuite.testCases?.find(element => element.name === item.label);
                                    if (testCase !== undefined) {
                                        testSuite.removeTestCase(testCase);
                                    }
                                    else {
                                        throw new Error("Test case with name " + item.label + " does not exist in test suite " + testSuite.name);
                                    }
                                }
                                else {
                                    throw new Error("Test suite with name " + item.parent?.label + " does not exist in component " + componentTC.name);
                                }
                            }
                            else {
                                throw new Error("Component with name " + item.parent?.parent?.label + " does not exist in model");
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    throw new Error("Unexpected change type");
                    break;
            }
            this.saveModel(vscode.Uri.joinPath(vscode.workspace.workspaceFolders![0].uri, ".vscode", "model.json"));
        }
    }
}