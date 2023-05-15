# This is the main meson.build file for the @@PROJECT_NAME@@ project
project(
    '@@PROJECT_NAME@@',
    ['c'],
    version: '0.1.0',
    license: 'MIT',
    meson_version: '>= 1.0.0',
    default_options:[
        'c_std=gnu11',
        'buildtype=debugoptimized',
        'b_coverage=true'
    ]
)

##########################################################################################
# Global variables
##########################################################################################

# Variables containing the source files and include directories for the UnitTestRunner
unittest_source     = []
unittest_include    = []

# Variables containing the source files and include directories for additional platform specific code for the UnitTestRunner
# Usually this is the code that implements the platform specific printf functions for the UnitTest output
# I recommend Segger RTT, you only need to add these files to the platform_source variable, and use the RTT_TestRunner.py script 
unittest_platform_source     = []
unittest_platform_include    = []

# Variables containing the source files and include directories for the units
units_source   = []
units_include  = []

# Variables containing the source files and include directories for integration code. 
# That is code that is not part of the units, but is used to integrate the units
integration_source  = []
integration_include = []

# Variables containing the source files and include directories for additional platform specific code for the integration code
# Usually this is a HAL or a BSP for the specific microcontroller you are using, or a driver for a specific peripheral, that you don't want to unit test
# bareMinimum is a special case, it is needed for running any code on the microcontroller, so it is needed for the unit tests as well on the microcontroller
platform_source     = []
platform_source_bareMinimum = []
platform_include    = []

# Variables containing the compiler flags and linker flags for the platform specific code
platform_cflags     = []
link_args           = []

# Variable containing the linker dependencies for the platform specific code
link_deps           = []

# Include args for the stub generator
stub_include   = []
stub_args      = []

# Scripts for running the tests and flashing the binary
python = find_program('python')
flash_script = files('scripts/flash_binary.py')
test_runner = files('scripts/RTT_TestRunner.py')

# Subdirectories
subdir('UnitTestRunner')
subdir('integration')
subdir('units')

##########################################################################################
# Targets
##########################################################################################

codechecker = find_program('CodeChecker')

run_target(
    'static_analysis',
    command: [codechecker, 'analyze', 'compile_commands.json' , '-o', '..\\.codechecker','--skip','..\\codechecker.cfg']
)

if get_option('target_executable') == true

# This is the executable that will be flashed to the microcontroller
# Note that two flags are passed to the compiler, PLATFORM and UNITTEST, these can be used to conditionally compile code that might differ between the unit test and the actual platform software
ELF = executable(meson.project_name(),
    name_suffix: 'elf',
    sources: [
        units_source,
        integration_source,
        platform_source,
        platform_source_bareMinimum
    ],
    include_directories: [
        units_include,
        integration_include,
        platform_include
    ],
    c_args: [ 
        platform_cflags, 
        '-DPLATFORM=1', 
        '-DUNITTEST=0'
    ],
    link_args: [ link_args ],
    override_options: [
        'b_coverage=false'
    ]
)

objcopy = find_program('objcopy')

custom_target(
    'bin',
    output: meson.project_name() + '.bin',
    command: [objcopy ,'-O', 'binary','-S', meson.project_name() + '.elf', meson.project_name() + '.bin'],
    depends: ELF,
    build_by_default: true
)

custom_target(
    'hex',
    output: meson.project_name() + '.hex',
    command: [objcopy ,'-O', 'ihex', meson.project_name() + '.elf', meson.project_name() + '.hex'],
    depends: ELF,
    build_by_default: true
)

# This is run target for flashing the binary to the microcontroller
# Note that the python flash script is called with the name of the binary as an argument
# If you don't want to use the python script, you can use the command line tool for your microcontroller
# For example, for the STM32F4 Discovery board, you can use the following command:
# command: ['st-flash', 'write', meson.project_name() + '.bin', '0x8000000']
# I recommend using the python script, as it is more portable
run_target(
    'flash',
    command: [python, flash_script ,meson.project_name() + '.elf'],
    depends: ELF
)

endif # get_option('target_executable') == true