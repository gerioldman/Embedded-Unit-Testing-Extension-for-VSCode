import * as vscode from 'vscode';
import { ModelHandler } from './modelHandler';
import { TextDecoder, TextEncoder } from 'node:util';

export namespace ProjectGenerator {

    export class ProjectGenerator {
        model: ModelHandler.Model | undefined = undefined;
        outputChannel: vscode.OutputChannel = vscode.window.createOutputChannel('Project Generator');

        async tryCreateFolder(folderUri: vscode.Uri) {
            try {
                await vscode.workspace.fs.createDirectory(folderUri);
                this.logInfo("Created folder " + folderUri.fsPath);
            }
            catch (e: any) {
                if (e.code === "EntryExists") {
                    this.logWarning("unit folder already exists, not overwriting it!");
                }
                else {
                    this.logError("Error creating unit folder: " + e);
                    throw new Error("Error creating unit folder: " + e);
                }
            }
        }

        async copyFromTemplateAndReplace(templateUri: vscode.Uri, targetUri: vscode.Uri, replaceMap: Array<[RegExp, string]>, replaceMapForOverWrite: Array<[RegExp, string]>) {
            let targetExists = false;
            try {
                await vscode.workspace.fs.stat(targetUri);
                targetExists = true;
            }
            catch (e: any) {
                if (e.code === "FileNotFound") {
                    targetExists = false;
                }
                else {
                    this.logError("Error checking if target file exists: " + e);
                    throw new Error("Error checking if target file exists: " + e);
                }
            }

            if (targetExists) {
                if (replaceMapForOverWrite.length !== 0) {
                    this.logInfo("Target file " + targetUri + " already exists, overwriting only relavant parts!");
                    let targetContent: Uint8Array;
                    try {
                        targetContent = await vscode.workspace.fs.readFile(targetUri);
                    }
                    catch (e) {
                        this.logError("Error reading target file: " + e);
                        throw new Error("Error reading target file: " + e);
                    }

                    let targetContentString: string = new TextDecoder().decode(targetContent);
                    for (let [regex, replacement] of replaceMapForOverWrite) {
                        this.logInfo("Replacing " + regex + " with " + replacement + " in " + targetUri.fsPath);
                        targetContentString = targetContentString.replace(regex, replacement);
                    }

                    let targetContentNew = new TextEncoder().encode(targetContentString);
                    try {
                        await vscode.workspace.fs.writeFile(targetUri, targetContentNew);
                    }
                    catch (e) {
                        this.logError("Error writing target file: " + e);
                        throw new Error("Error writing target file: " + e);
                    }
                }
                else {
                    this.logWarning("Target file " + targetUri + " already exists, not overwriting it!");
                }
                return;
            }

            let templateContent: Uint8Array;
            try {
                templateContent = await vscode.workspace.fs.readFile(templateUri);
            }
            catch (e) {
                this.logError("Error reading template file: " + e);
                throw new Error("Error reading template file: " + e);
            }

            let templateContentString = new TextDecoder().decode(templateContent);
            for (let replaceMapping of replaceMap) {
                templateContentString = templateContentString.replace(replaceMapping[0], replaceMapping[1]);
            }

            let targetContent = new TextEncoder().encode(templateContentString);
            try {
                await vscode.workspace.fs.writeFile(targetUri, targetContent);
            }
            catch (e) {
                this.logError("Error writing target file: " + e);
                throw new Error("Error writing target file: " + e);
            }
        }

        constructor(model: ModelHandler.Model) {
            this.model = model;
        }

        logInfo(message: string) {
            this.outputChannel.appendLine(
                new Date().toLocaleTimeString() + ":[Info] " + message
            );
        }

        logWarning(message: string) {
            this.outputChannel.appendLine(
                new Date().toLocaleTimeString() + ":[Warning] " + message
            );
        }

        logError(message: string) {
            this.outputChannel.appendLine(
                new Date().toLocaleTimeString() + ":[Error] " + message
            );
        }

        public async generateProject(context: vscode.ExtensionContext) {

            vscode.window.withProgress(
                {
                    location: vscode.ProgressLocation.Notification,
                    title: 'Project generation'
                },
                async progress => {

                    this.logInfo("Starting to generate project");
                    progress.report({ message: 'Starting to generate project', increment: 0 });

                    // copy file from template to workspace
                    progress.report({ message: 'Copying files', increment: 25 });
                    await this.createFoldersAndCopyContents(context);
                    await this.copyFiles(context);

                    // create units from model
                    progress.report({ message: 'Creating units', increment: 25 });
                    await this.createunits(context);

                    // create meson.build file for units
                    progress.report({ message: 'Creating unit database meson.build file', increment: 25 });
                    await this.createDataBaseMesonFile();

                    progress.report({ message: 'Finished generating project', increment: 25 });
                    this.logInfo("Finished generating project");
                }
            );
        }

        async createunits(context: vscode.ExtensionContext) {
            this.logInfo("Starting to create units");
            if (this.model === undefined) {
                this.logError("Model is undefined! Probably a developer error!");
                throw new Error("Model is undefined!");
            }

            // check if unit folder exists
            let extensionUri = context.extensionUri;
            let templateFolderUri = vscode.Uri.joinPath(extensionUri!, "templates", "unit_template");

            for (let unit of this.model.units) {
                // create folder for unit
                let unitFolderUri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders![0].uri, "units", unit.name);
                this.tryCreateFolder(unitFolderUri);

                // create folder for unit implementation files
                let unitImplFolderUri = vscode.Uri.joinPath(unitFolderUri, "Unit");
                this.tryCreateFolder(unitImplFolderUri);

                // create folder for unit header files
                let unitHeaderFileUri = vscode.Uri.joinPath(unitImplFolderUri, "include");
                this.tryCreateFolder(unitHeaderFileUri);

                // create folder for unit source files
                let unitSourceFileUri = vscode.Uri.joinPath(unitImplFolderUri, "src");
                this.tryCreateFolder(unitSourceFileUri);

                // create folder for unit test implementation files
                let unitTestFileUri = vscode.Uri.joinPath(unitFolderUri, "UnitTest");
                this.tryCreateFolder(unitTestFileUri);

                // create folder for unit test source files
                let unitTestSourceFileUri = vscode.Uri.joinPath(unitTestFileUri, "src");
                this.tryCreateFolder(unitTestSourceFileUri);

                // create folder for unit test header files
                let unitTestHeaderFileUri = vscode.Uri.joinPath(unitTestFileUri, "include");
                this.tryCreateFolder(unitTestHeaderFileUri);

                // copy files from template to unit folder with correct names
                let replaceMap: Array<[RegExp, string]> = [
                    [new RegExp("@@unit_NAME@@", 'g'), unit.name],
                    [new RegExp("@@unit_NAME_UPPERCASE@@", 'g'), unit.name.toUpperCase()],
                    [new RegExp("@@unit_NAME_LOWERCASE@@", 'g'), unit.name.toLowerCase()],
                    [new RegExp("@@unit_TESTSUITE_SOURCE_FILES@@", 'g'), unit.testSuites.map(testSuite => "\'UnitTest/src/" + testSuite.name + ".c\'").join(",\n        ")],
                    [new RegExp("@@TEST_SUITES@@", 'g'), unit.testSuites.map(testSuite => "&" + testSuite.name).join(",\n\t") + ','],
                    [new RegExp("@@EXTERN_TEST_SUITES@@", 'g'), unit.testSuites.map(testSuite => "extern TestSuite " + testSuite.name + ";\n").join("")],
                    [new RegExp("@@DATE@@", 'g'), new Date().toLocaleDateString()]
                ];

                // copy files from template to unit folder
                let templateUri = vscode.Uri.joinPath(templateFolderUri, "Unit", "include", "unit_template.h");
                let targetUri = vscode.Uri.joinPath(unitHeaderFileUri, unit.name + ".h");
                await this.copyFromTemplateAndReplace(templateUri, targetUri, replaceMap, []);

                templateUri = vscode.Uri.joinPath(templateFolderUri, "Unit", "src", "unit_template.c");
                targetUri = vscode.Uri.joinPath(unitSourceFileUri, unit.name + ".c");
                await this.copyFromTemplateAndReplace(templateUri, targetUri, replaceMap, []);

                templateUri = vscode.Uri.joinPath(templateFolderUri, "UnitTest", "include", "userstub.h");
                targetUri = vscode.Uri.joinPath(unitTestHeaderFileUri, "userstub.h");
                await this.copyFromTemplateAndReplace(templateUri, targetUri, replaceMap, []);

                templateUri = vscode.Uri.joinPath(templateFolderUri, "UnitTest", "src", "userstub.c");
                targetUri = vscode.Uri.joinPath(unitTestSourceFileUri, "userstub.c");
                await this.copyFromTemplateAndReplace(templateUri, targetUri, replaceMap, []);

                templateUri = vscode.Uri.joinPath(templateFolderUri, "UnitTest", "src", "TestSuites.c");
                targetUri = vscode.Uri.joinPath(unitTestSourceFileUri, "TestSuites.c");
                await this.copyFromTemplateAndReplace(templateUri, targetUri, replaceMap, [
                    [/(?:extern\s*TestSuite\s*[A-Za-z0-9_]+\s*;\s*)+/, unit.testSuites.map(testSuite => "extern TestSuite " + testSuite.name + ";\n").join("") + "\n"],
                    [/TestSuite\*\s*testSuites\s*\[\]\s*=\s*{\s*(?:\s*&[A-Za-z0-9_]+\s*,\s*)+\s*TEST_SUITE_END\s*}\s*;/, 'TestSuite* testSuites[] = {\n\t' + unit.testSuites.map(testSuite => "&" + testSuite.name).join(",\n\t") + ',\n\tTEST_SUITE_END\n};']
                ]);

                templateUri = vscode.Uri.joinPath(templateFolderUri, "meson.build");
                targetUri = vscode.Uri.joinPath(unitFolderUri, "meson.build");
                await this.copyFromTemplateAndReplace(templateUri, targetUri, replaceMap, [
                    [
                        /unit_test_files\s*=\s*files\s*\(\s*\[\s*(?:\'UnitTest\/src\/\w+\.c\'\s*,?\s*)+\]\s*\)/,
                        "unit_test_files = files([\n\t\'UnitTest/src/TestSuites.c\',\n\t\'UnitTest/src/userstub.c\',\n\t" + unit.testSuites.map(testSuite => "\'UnitTest/src/" + testSuite.name + ".c\'").join(",\n\t") + "\n])"
                    ]
                ]);

                // create test suites
                for (let testSuite of unit.testSuites) {
                    let replaceMapForSuite: [RegExp, string][] = [];
                    for (let replaceMapping of replaceMap) {
                        replaceMapForSuite.push(replaceMapping);
                    }
                    replaceMapForSuite.push([new RegExp('@@TEST_SUITE_NAME@@', 'g'), testSuite.name]);
                    replaceMapForSuite.push([new RegExp('@@TEST_CASES@@', 'g'), testSuite.testCases.map(testCase => "void " + testCase.name + "(){\n\t/* Add test implementation */\n}").join("\n\n")]);
                    replaceMapForSuite.push([new RegExp('@@TEST_CASE_ENTRIES@@', 'g'), testSuite.testCases.map(testCase => "TEST_CASE_ENTRY(" + testCase.name + ")").join(",\n\t\t") + ","]);

                    templateUri = vscode.Uri.joinPath(templateFolderUri, "UnitTest", "src", "TStemplate.c");
                    targetUri = vscode.Uri.joinPath(unitTestSourceFileUri, testSuite.name + ".c");
                    try {
                        let content = await vscode.workspace.fs.readFile(targetUri);

                        let contentString = new TextDecoder().decode(content);

                        for (let testCase of testSuite.testCases) {
                            let match = contentString.match(new RegExp("void\\s*" + testCase.name + "\\s*\\(\\s*\\)", ""));
                            if (match === null) {
                                if (contentString.match(/\/\* @@TEST_CASES_UPDATE@@ \*\//) !== null) {
                                    contentString = contentString.replace(/\/\* @@TEST_CASES_UPDATE@@ \*\//, "void " + testCase.name + "(){\n\t/* Add test implementation */\n}\n\n/* @@TEST_CASES@@ */");
                                }
                            }
                            else {
                                // Nothing to do, as the test case already exists
                            }
                        }
                        await vscode.workspace.fs.writeFile(targetUri, new TextEncoder().encode(contentString));

                    } catch (error: any) {
                        if (error.code === 'FileNotFound') {
                            // File does not exist, so we can create it
                        }
                        else {
                            this.logError(error);
                            throw error;
                        }
                    }
                    await this.copyFromTemplateAndReplace(templateUri, targetUri, replaceMapForSuite, [
                        [
                            /TestSuite\s*\S+\s*=\s*{\s*\.name\s*=\s*\"\S+\",\s*\.TestCases\s*=\s*{\s*(?:TEST_CASE_ENTRY\(\S+\),?\s*)+},?(\s*(?:\.(?:cleanUpAfter_funcPtr|cleanUpBefore_funcPtr)\s*=\s*\S+\s*,?\s*)*)};/,
                            'TestSuite ' + testSuite.name + ' = {\n\t.name = \"' + testSuite.name + '\",\n\t.TestCases = \n\t{\n\t\t' + testSuite.testCases.map(testCase => "TEST_CASE_ENTRY(" + testCase.name + ")").join(",\n\t\t") + ",\n\t\tTEST_CASE_ENTRY(TEST_CASE_END),\n\t}," + "$1" + "};"
                        ]
                    ]);
                }


            }

            this.logInfo("Finished creating units");
        }

        async createDataBaseMesonFile() {
            this.logInfo("Creating meson.build file for database");
            let destinationUri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders![0].uri, "units", "meson.build");

            if (this.model === undefined) {
                throw new Error("Model is undefined");
            }
            let output: string = "";
            output += "# GENERATED CODE - DO NOT MODIFY BY HAND\n\n";
            for (let unit of this.model.units) {
                output += "units_include += include_directories(\'" + unit.name + "/Unit/include\')\n";
            }
            output += "\n";
            for (let unit of this.model.units) {
                output += "subdir(\'" + unit.name + "\')\n";
            }
            output += "\n";
            output += "# END GENERATED CODE";

            let buffer = Buffer.from(output, "utf8");
            try {
                await vscode.workspace.fs.writeFile(destinationUri, buffer);
            }
            catch (e) {
                this.logError("Error writing meson.build file for database: " + e);
                throw new Error("Error writing meson.build file for database: " + e);
            }
        }

        async copyFiles(context: vscode.ExtensionContext) {
            this.logInfo("Starting to copy files");
            let extensionUri = context.extensionUri;
            let projectTemplateFolderUri = vscode.Uri.joinPath(extensionUri!, "templates", "project_template");
            let workspaceFolderUri = vscode.workspace.workspaceFolders![0].uri;

            // get files from project template folder and copy them to workspace folder
            let results: [string, vscode.FileType][] = [];
            let workspaceResults: [string, vscode.FileType][] = [];
            try {
                results = await vscode.workspace.fs.readDirectory(projectTemplateFolderUri);
            }
            catch (e) {
                this.logError("Error reading project template folder: " + e);
                throw new Error("Error reading project template folder: " + e);
            }
            try {
                workspaceResults = await vscode.workspace.fs.readDirectory(workspaceFolderUri);
            }
            catch (e) {
                this.logError("Error reading workspace folder: " + e);
                throw new Error("Error reading workspace folder: " + e);
            }
            // Check if every template file is available in extension folder
            if (
                !(
                    results.find(
                        (element) => {
                            return element[0] === "gcovr.cfg" && element[1] === vscode.FileType.File;
                        }) !== undefined
                    &&
                    results.find(
                        (element) => {
                            return element[0] === "meson_options.txt" && element[1] === vscode.FileType.File;
                        }) !== undefined
                    &&
                    results.find(
                        (element) => {
                            return element[0] === "meson.build" && element[1] === vscode.FileType.File;
                        }) !== undefined
                )
            ) {
                throw new Error("Template files missing from extension!");
            }

            // Check if every template file is available in workspace folder, if not copy it

            let sourceFile = vscode.Uri.joinPath(projectTemplateFolderUri, "gcovr.cfg");
            let targetFile = vscode.Uri.joinPath(workspaceFolderUri, "gcovr.cfg");
            try {
                await vscode.workspace.fs.copy(sourceFile, targetFile, { overwrite: false });
            } catch (error: any) {
                if (error.code === "FileExists") {
                    this.logWarning("gcovr.cfg already exists in workspace folder, not overwriting it!");
                }
                else {
                    this.logError("Error copying gcovr.cfg: " + error);
                }
            }

            sourceFile = vscode.Uri.joinPath(projectTemplateFolderUri, "meson_options.txt");
            targetFile = vscode.Uri.joinPath(workspaceFolderUri, "meson_options.txt");
            try {
                await vscode.workspace.fs.copy(sourceFile, targetFile, { overwrite: false });
            } catch (error: any) {
                if (error.code === "FileExists") {
                    this.logWarning("meson_options.txt already exists in workspace folder, not overwriting it!");
                }
                else {
                    this.logError("Error copying meson_options.txt: " + error);
                }
            }

            sourceFile = vscode.Uri.joinPath(projectTemplateFolderUri, "meson.build");
            targetFile = vscode.Uri.joinPath(workspaceFolderUri, "meson.build");
            let projectName: string | undefined = undefined;
            if (workspaceResults.find((element) => { return element[0] === "meson.build" && element[1] === vscode.FileType.File; }) === undefined) {
                try {
                    projectName = await vscode.window.showInputBox(
                        {
                            prompt: "Please enter the name of the project",
                            placeHolder: "Project name",
                            validateInput: (value: string) => {
                                if (value === "") {
                                    return "Please enter a valid project name";
                                }
                                return undefined;
                            }
                        }
                    );
                }
                catch (e: any) {
                    this.logError("Error getting project name: " + e.message);
                    throw e;
                }

                try {
                    //await vscode.workspace.fs.copy(sourceFile, targetFile, { overwrite: false });

                    let inputByteArray = await vscode.workspace.fs.readFile(sourceFile);
                    let text = new TextDecoder().decode(inputByteArray);
                    text = text.replace(new RegExp("@@PROJECT_NAME@@", 'g'), projectName ? projectName : "RenameMe");
                    let outputByteArray = new TextEncoder().encode(text);
                    await vscode.workspace.fs.writeFile(targetFile, outputByteArray);

                } catch (error: any) {
                    if (error.code === "FileExists") {
                        this.logWarning("meson_options.txt already exists in workspace folder, not overwriting it!");
                    }
                    else {
                        this.logError("Error creating meson.build: " + error);
                    }
                }
            }
            else {
                this.logWarning("meson.build already exists in workspace folder, not overwriting it!");
            }

        }

        async createFoldersAndCopyContents(context: vscode.ExtensionContext) {
            this.logInfo("Starting to create folders");

            let folderUri = vscode.workspace.workspaceFolders![0].uri;
            let extensionUri = context.extensionUri;

            if (extensionUri !== undefined) {

                // get folders from project template folder and create them in workspace folder
                let projectTemplateFolderUri = vscode.Uri.joinPath(extensionUri, "templates", "project_template");
                let results = await vscode.workspace.fs.readDirectory(projectTemplateFolderUri);
                this.logInfo(results.toString());
                if (
                    !(
                        //results.find(
                        //    (element) => {
                        //        return element[0] === "units" && element[1] === vscode.FileType.Directory;
                        //    }) !== undefined
                        //&&
                        results.find(
                            (element) => {
                                return element[0] === "integration" && element[1] === vscode.FileType.Directory;
                            }) !== undefined
                        &&
                        results.find(
                            (element) => {
                                return element[0] === "scripts" && element[1] === vscode.FileType.Directory;
                            }) !== undefined
                        &&
                        results.find(
                            (element) => {
                                return element[0] === "UnitTestRunner" && element[1] === vscode.FileType.Directory;
                            }) !== undefined
                    )
                ) {
                    throw new Error("Template folders missing from extension!");
                }

                for (let element of results) {
                    if (element[1] === vscode.FileType.Directory) {
                        switch (element[0]) {
                            case "units": {
                                let folderToCreate = vscode.Uri.joinPath(folderUri, element[0]);
                                try {
                                    let result = await vscode.workspace.fs.stat(folderToCreate);
                                    if (result.type === vscode.FileType.Directory) {
                                        this.logInfo("Folder already exists: " + folderToCreate.path);
                                    }
                                }
                                catch (e: any) {
                                    if (e.code === "FileNotFound") {
                                        this.logInfo("Creating folder: " + folderToCreate.path);
                                        try {
                                            await vscode.workspace.fs.createDirectory(folderToCreate);
                                        }
                                        catch (e: any) {
                                            this.logError("Error creating folder: " + e);
                                            throw new Error("Error creating folder: " + e);
                                        }
                                    }
                                    else {
                                        throw new Error("Error checking if folder exists: " + e);
                                    }
                                }
                            }
                                break;
                            case "integration": {
                                let folderToCreate = vscode.Uri.joinPath(folderUri, element[0]);
                                try {
                                    let result = await vscode.workspace.fs.stat(folderToCreate);
                                    if (result.type === vscode.FileType.Directory) {
                                        this.logInfo("Folder already exists: " + folderToCreate.path);
                                    }
                                }
                                catch (e: any) {
                                    if (e.code === "FileNotFound") {
                                        this.logInfo("Creating folder: " + folderToCreate.path);
                                        try {
                                            await vscode.workspace.fs.createDirectory(folderToCreate);
                                        }
                                        catch (e: any) {
                                            this.logError("Error creating folder: " + e);
                                            throw new Error("Error creating folder: " + e);
                                        }
                                    }
                                    else {
                                        throw new Error("Error checking if folder exists: " + e);
                                    }
                                }

                                let integrationFolderUri = vscode.Uri.joinPath(folderUri, "integration");
                                let integrationExtensionUri = vscode.Uri.joinPath(projectTemplateFolderUri, "integration");

                                let results = await vscode.workspace.fs.readDirectory(integrationExtensionUri);

                                // Check existence of cross_compile.build file

                                if (
                                    !(
                                        results.find(
                                            (element) => {
                                                return element[0] === "cross_compile.build" && element[1] === vscode.FileType.File;
                                            }) !== undefined
                                        &&
                                        results.find(
                                            (element) => {
                                                return element[0] === "meson.build" && element[1] === vscode.FileType.File;
                                            }) !== undefined
                                    )
                                ) {
                                    throw new Error("Template files missing from extension!");
                                }

                                {
                                    let sourceFile = vscode.Uri.joinPath(integrationExtensionUri, "cross_compile.build");
                                    let targetFile = vscode.Uri.joinPath(integrationFolderUri, "cross_compile.build");
                                    try {
                                        await vscode.workspace.fs.copy(sourceFile, targetFile, { overwrite: false });
                                        this.logInfo("Copying cross_compile.build file");
                                    }
                                    catch (e: any) {
                                        if (e.code === "FileExists") {
                                            this.logWarning("cross_compile.build already exists in workspace folder, not overwriting it!");
                                        }
                                        else {
                                            this.logError("Error copying file: " + e);
                                            throw new Error("Error copying file: " + e);
                                        }
                                    }
                                }

                                {
                                    let sourceFile = vscode.Uri.joinPath(integrationExtensionUri, "meson.build");
                                    let targetFile = vscode.Uri.joinPath(integrationFolderUri, "meson.build");
                                    try {
                                        await vscode.workspace.fs.copy(sourceFile, targetFile, { overwrite: false });
                                        this.logInfo("Copying meson.build file");
                                    }
                                    catch (e: any) {
                                        if (e.code === "FileExists") {
                                            this.logWarning("meson.build already exists in workspace folder, not overwriting it!");
                                        }
                                        else {
                                            this.logError("Error copying file: " + e);
                                            throw new Error("Error copying file: " + e);
                                        }
                                    }
                                }


                            }
                                break;
                            case "scripts": {
                                let folderToCreate = vscode.Uri.joinPath(folderUri, element[0]);
                                let folderToCopyFrom = vscode.Uri.joinPath(projectTemplateFolderUri, element[0]);

                                try {
                                    let result = await vscode.workspace.fs.stat(folderToCreate);
                                    if (result.type === vscode.FileType.Directory) {
                                        this.logInfo("Folder already exists: " + folderToCreate.path);
                                    }
                                }
                                catch (e: any) {
                                    if (e.code === "FileNotFound") {
                                        this.logInfo("Creating folder: " + folderToCreate.path);
                                        try {
                                            await vscode.workspace.fs.createDirectory(folderToCreate);
                                        }
                                        catch (e: any) {
                                            this.logError("Error creating folder: " + e);
                                            throw new Error("Error creating folder: " + e);
                                        }
                                    }
                                    else {
                                        throw new Error("Error checking if folder exists: " + e);
                                    }
                                }

                                let results = await vscode.workspace.fs.readDirectory(folderToCopyFrom);

                                for (let result of results) {
                                    let sourceFile = vscode.Uri.joinPath(folderToCopyFrom, result[0]);
                                    let targetFile = vscode.Uri.joinPath(folderToCreate, result[0]);
                                    try {
                                        await vscode.workspace.fs.copy(sourceFile, targetFile, { overwrite: false });
                                    }
                                    catch (e: any) {
                                        if (e.code === "FileExists") {
                                            this.logWarning(targetFile.path + " already exists in workspace folder, not overwriting it!");
                                        }
                                        else {
                                            this.logError("Error copying file: " + e);
                                            throw new Error("Error copying file: " + e);
                                        }
                                    }
                                }
                            }
                                break;
                            case "UnitTestRunner": {
                                let folderToCreate = vscode.Uri.joinPath(folderUri, element[0]);
                                let folderToCopyFrom = vscode.Uri.joinPath(projectTemplateFolderUri, element[0]);

                                try {
                                    vscode.workspace.fs.copy(folderToCopyFrom, folderToCreate, { overwrite: true });
                                }
                                catch (e: any) {
                                    this.logError("Error copying folder: " + e);
                                    throw new Error("Error copying folder: " + e);
                                }
                            }
                                break;
                            default:
                                throw new Error("Unknown folder: " + element[0]);
                                break;
                        }
                    }
                }
                this.logInfo("Folders created");
            }
            else
            {
                this.logError("Error getting extension folder");
                throw new Error("Error getting extension folder");
            }
        }
    }
}
