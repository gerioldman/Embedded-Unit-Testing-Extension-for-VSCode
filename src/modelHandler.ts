const jsonc = require("jsonc-parser");
import * as vscode from 'vscode';
import { unitViewTree } from './unitViewTree';


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
        unit: Unit | undefined;
        constructor(name: string, testCases?: TestCase[], unit?: Unit) {
            this.name = name;
            this.unit = unit;
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
     * unit class
     *
     * @export
     * @class unit
     */
    export class Unit {
        name: string;
        testSuites: TestSuite[] = [];
        constructor(name: string, testSuites?: TestSuite[]) {
            this.name = name;
            testSuites?.forEach(element => {
                this.addTestSuite(element);
            });
        }

        /**
         * Add a test suite to the unit
         *
         * @param {TestSuite} testSuite
         * @memberof unit
         */
        addTestSuite(testSuite: TestSuite) {
            if (this.testSuites === undefined) {
                this.testSuites = [testSuite];
            } else {
                this.testSuites.forEach(element => {
                    if (element.name === testSuite.name) {
                        throw new Error("Test suite with name " + testSuite.name + " already exists in unit " + this.name);
                    }
                });
                this.testSuites.push(testSuite);
            }
        }

        /**
         * Remove a test suite from the unit
         *
         * @param {TestSuite} testSuite
         * @memberof unit
         */
        removeTestSuite(testSuite: TestSuite) {
            if (this.testSuites === undefined) {
                throw new Error("No test suites in unit " + this.name);
            } else {
                let testSuiteToDelete = this.testSuites.find(element => element === testSuite);
                if (testSuiteToDelete === undefined) {
                    throw new Error("Test suite with name " + testSuite.name + " does not exist in unit " + this.name);
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
        units: Unit[] = [];
        constructor(units?: Unit[]) {
            units?.forEach(element => {
                this.units.push(element);
            });
        }

        /**
         * Add a unit to the model
         *
         * @param {unit} unit
         * @memberof Model
         */
        addunit(unit: Unit) {
            if (this.units === undefined) {
                this.units = [unit];
            } else {
                this.units.forEach(element => {
                    if (element.name === unit.name) {
                        throw new Error("unit with name " + unit.name + " already exists in model");
                    }
                });
                this.units.push(unit);
            }
        }

        /**
         * Remove a unit from the model
         *
         * @param {unit} unit
         * @memberof Model
         */
        removeunit(unit: Unit) {
            if (this.units === undefined) {
                throw new Error("No units in model");
            } else {
                let unitToDelete = this.units.find(element => element === unit);
                if (unitToDelete === undefined) {
                    throw new Error("unit with name " + unit.name + " does not exist in model");
                }
                else {
                    this.units.splice(this.units.indexOf(unitToDelete), 1);
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
                for (let unit of model.units) {
                    let newunit = new Unit(unit.name);
                    for (let testSuite of unit.testSuites) {
                        let newTestSuite = new TestSuite(testSuite.name);
                        for (let testCase of testSuite.testCases) {
                            let newTestCase = new TestCase(testCase.name);
                            newTestSuite.addTestCase(newTestCase);
                        }
                        newunit.addTestSuite(newTestSuite);
                    }
                    this.addunit(newunit);
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
        viewTreeListener(item: unitViewTree.ViewTreeItem, type: unitViewTree.ChangeType) {
            switch (type) {
                case unitViewTree.ChangeType.create:
                    switch (item.type) {
                        case unitViewTree.Type.unit:
                            this.addunit(new Unit(item.label as string));
                            break;

                        case unitViewTree.Type.testSuite:
                            this.units?.find(element => element.name === item.parent?.label)?.addTestSuite(new TestSuite(item.label as string));
                            break;

                        case unitViewTree.Type.testCase:
                            this.units?.find(element => element.name === item.parent?.parent?.label)?.testSuites?.find(element => element.name === item.parent?.label)?.addTestCase(new TestCase(item.label as string));
                            break;

                        default:
                            break;
                    }
                    break;
                case unitViewTree.ChangeType.delete:
                    switch (item.type) {
                        case unitViewTree.Type.unit:
                            let unit = this.units?.find(element => element.name === item.label);
                            if (unit !== undefined) {
                                this.removeunit(unit);
                            }
                            else {
                                throw new Error("unit with name " + item.label + " does not exist in model");
                            }

                            break;
                        case unitViewTree.Type.testSuite:
                            let unitTS = this.units?.find(element => {
                                return undefined !== element.testSuites?.find(element => element.name === item.label);
                            });
                            if (unitTS !== undefined) {
                                let testSuite = unitTS.testSuites?.find(element => element.name === item.label);
                                if (testSuite !== undefined) {
                                    unitTS.removeTestSuite(testSuite);
                                }
                                else {
                                    throw new Error("Test suite with name " + item.label + " does not exist in unit " + unitTS.name);
                                }
                            }
                            else {
                                throw new Error("unit with name " + item.parent?.label + " does not exist in model");
                            }
                            break;
                        case unitViewTree.Type.testCase:
                            let unitTC = this.units?.find(element => {
                                return undefined !== element.testSuites?.find(element => {
                                    return undefined !== element.testCases?.find(element => element.name === item.label);
                                });
                            });
                            if (unitTC !== undefined) {
                                let testSuite = unitTC.testSuites?.find(element => {
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
                                    throw new Error("Test suite with name " + item.parent?.label + " does not exist in unit " + unitTC.name);
                                }
                            }
                            else {
                                throw new Error("unit with name " + item.parent?.parent?.label + " does not exist in model");
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