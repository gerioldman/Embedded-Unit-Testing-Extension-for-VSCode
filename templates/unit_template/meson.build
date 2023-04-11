# GENERATED CODE - DO NOT MODIFY BY HAND

components_source += files('Unit/src/@@COMPONENT_NAME@@.c')

component_test_files = files([
        'UnitTest/src/TestSuites.c',
        'UnitTest/src/userstub.c',
        @@COMPONENT_TESTSUITE_SOURCE_FILES@@
])

cc = meson.get_compiler('c', native: true)

preprocessed_file = cc.preprocess(
        'Unit/src/@@COMPONENT_NAME@@.c',
        include_directories: [
                stub_include,
                components_include,
                platform_include,
                integration_include,
                unittest_include,
        ],
        compile_args: [
                stub_args,
                '-DPLATFORM=0',
                '-DUNIT_TEST=1',
                '-nostdinc'
        ]
)

mock_generator = generator(
        python,
        output: [ '@BASENAME@_mock.c', '@BASENAME@_mock.h', '@BASENAME@_mock_internal.h'],
        arguments: [
                meson.global_source_root() + '/scripts/UnitTestSupport.py',
                '@BUILD_DIR@',
                '@INPUT@',
                '@OUTPUT0@',
                '@OUTPUT1@',
                '@OUTPUT2@',
                '@0@/@1@'.format(meson.current_source_dir(),'Unit/src/@@COMPONENT_NAME@@.c'),

        ]
)

mocks = mock_generator.process(
        preprocessed_file
)

test(
        '@@COMPONENT_NAME@@_test', 
        executable(
                '@@COMPONENT_NAME@@_test', 
                'Unit/src/@@COMPONENT_NAME@@.c',
                unittest_source,
                component_test_files,
                mocks,
                include_directories: [
                        components_include,
                        platform_include,
                        integration_include,
                        unittest_include,
                        include_directories('UnitTest/include')
                ],
                c_args: ['-DPLATFORM=0', '-DUNIT_TEST=1', '-g'],
                native: true
        ),
        protocol: 'tap',
)

if get_option('target_tests') == true

test(
        '@@COMPONENT_NAME@@_target_test',
        python, 
        args: 
                [
                        test_runner,
                        executable(
                                '@@COMPONENT_NAME@@_target_test',
                                'Unit/src/@@COMPONENT_NAME@@.c',
                                component_test_files,
                                mocks,
                                unittest_source,
                                unittest_platform_source,
                                platform_source_bareMinimum,
                                name_suffix: 'elf',
                                include_directories: [
                                        components_include,
                                        platform_include,
                                        integration_include,
                                        unittest_include,
                                        unittest_platform_include,
                                        include_directories('UnitTest/include')
                                ],
                                c_args: [ platform_cflags, '-DPLATFORM=1', '-DUNIT_TEST=1'],
                                link_args: [ link_args ],
                        ).full_path()
                ], 
        protocol: 'tap',
        is_parallel : false
)

endif

# END GENERATED CODE