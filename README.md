# Embedded Unit Testing

The extension is aiming to create an easier way of unit testing C applications made for embedded systems. The main features are generating a Meson project skeleton based on a model that is created in separate view, automatic stubbing, and support target testing, or at least try to make it easier to set up.

## Features
### Units, test suites, and test cases
The basic idea of the extension is that the software written is separated into source and header file pairs, which can be thought of as units. These can be modelled as a tree structure, where each unit can have multiple test suites, and each test suite can have multiple test cases. The test cases are the actual tests that are run on the unit.
### Stubbing, mocking, and faking
The extension is also aiming to provide automatic mocking, this is done by a Python script during compilation. The script will generate a mock for functions that can be called by the unit, but not defined in the unit itself. The mock will be a function that will behave based on previous configuration. This configuration can be done in the test case implementation itself, by accessing the TEST_STUB variable. The TEST_STUB variable is a dictionary that contains the mock functions, and can be accessed by the test case implementation. The test case implementation can then configure the mock functions to behave in a certain way, and then call the unit under test. The unit under test will then call the mock function, which will behave according to the configuration. This allows the test case implementation to test the unit under test in a controlled environment, without having to worry about the behaviour of other units.
### Meson project skeleton
The extension will also generate a Meson project skeleton, which can be used to compile the unit tests, and with some additional configuration, the whole software. The folder structure of the project skeleton is as follows:
```
project_root
├── .codechecker
├── builddir
├── units
│   ├── unitA
│   │   ├── Unit
│   │   │   ├── include
│   │   │   │   └── unitA.h
│   │   │   └── src
│   │   │       └── unitA.c
│   │   └── Unittest
│   │       ├── include
│   │       │   └── userstub.h
│   │       └── src
│   │           ├── userstub.c
│   │           ├── TestSuites.c
│   │           └── TestSuite1.c
│   └── unitB
│       ├── Unit
│       │   ├── include
│       │   │   └── unitB.h
│       │   └── src
│       │       └── unitB.c
│       └── Unittest
│           ├── include
│           │   └── userstub.h
│           └── src
│               ├── userstub.c
│               ├── TestSuites.c
│               └── TestSuite1.c
├── integration
│   ├── Any additional file you do not wish to test
│   └── meson.build
├── scripts
│   ├── flash_binary.py
│   ├── RTT_TestRunner.py
│   └── UnitTestSupport.py
├── UnitTestRunner
├── gcovr.cfg
├── meson.build
├── meson_options.txt
└── codechecker.cfg
```
The build system contains host and target tests for the units, and a platform target. The target tests will not run by default, you have to set up a way to read the results from the target, so this option can be disabled by meson_options.txt file. The whole software build can be disabled as well. The scripts folder contains three scripts, one for flashing the binary to the target, one for running the tests on the target by Segger RTT (I advise that you try to set this up), and one for creating the mocks. The UnitTestRunner folder contains the Unit test framework, which is my own implementation. The gcovr.cfg file is used for filtering generated code coverage reports. The meson.build file is the main build file, and the meson_options.txt file is used to configure the build. The codechecker.cfg file is used to configure the codechecker, which is a static analysis tool.

## Requirements

The extension requires that you have Python 3 installed, and that you have the Python packages Meson, gcovr, PyCParser. The extension also requires Ninja to be installed, and that you have a C compiler installed, one for the host, and another for target. Also, you'll need to have codechecker installed, along with any dependencies it might have.

## Extension Settings

Currently there are no extension settings.

## Known Issues

Currently there are no known issues.

## Release Notes

### 0.0.1

Initial release of Embedded Unit Testing

### 0.0.2

Try at fix of the extension not working outside debug

### 0.0.3

Fix of the extension not working outside debug

### 0.0.4

Fix coverage report not working, add support for codechecker
Configure project button now detects if the build system is already configured, and if it is, then it will call meson with '--wipe' flag
Added new buttons in the unit editor view