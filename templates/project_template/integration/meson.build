# This file is the Meson build file where you can add your target specific source files and include directories.
# The file will not be overwritten by the generator once it has been created, so you can add your own code here.

platform_source_bareMinimum += files(
    [
        # Add all the source files here, that are needed to run anything on the platform, like the main function, or the startup file
    ]
)

platform_source += files(
    [
        # Add all the source files here, that you do not want to test with unittests        ]
    ]
)

platform_include += include_directories(
    [
        # Add all the include directories from the integration folder here
    ]
)

unittest_platform_source     += files(
    [
        # Add all the source files here, that are needed to run the unittests on the target
    ]
)

unittest_platform_include    += include_directories(
    [
        # Add all the include directories specific for running unittests on target here
    ]
)

ld_script = files(
    [
        # Add all the linker scripts here that are needed to link the target
    ]
)

# Do not change this line, for now, there is no way to add a linker script to the meson build file, so we have to add it to the linker arguments
foreach link_file : ld_script
    link_args += '-T@0@/@1@'.format(meson.global_source_root(),link_file)
endforeach


platform_cflags += [
    # Add all the custom compiler flags here
]


# PyCParser doesn't support extensions to the C99 standard, add defines so GNU extensions like __attribute__(x) are thrown out by the preprocessor.
# In the future, I might create an extension for the PyCParser module to be able to process GNU extensions, but for now this is the solution, 
# recommended by the creator of the module. https://github.com/eliben/pycparser/wiki/FAQ#what-do-i-do-about-__attribute

stub_args += '-D__attribute__(x)='
stub_args += '-D__ASM='
stub_args += '-D__IO=volatile'
stub_args += '-D__STATIC_INLINE=static inline'
stub_args += '-D__NOP()'
stub_args += '-D__RAM_FUNC'
stub_args += '-D__NOINLINE'
stub_args += '-D__ALIGN_BEGIN'
stub_args += '-D__ALIGN_END'
stub_args += '-D__packed'
stub_args += '-D__weak'
stub_args += '-DUNUSED(X)'

# Some headers might cause errors during stub generation, you can create fake headers, look up PyCParser fake include headers

stub_include += include_directories([
#    '@@PYTHON_PATH@@/Lib/site-packages/pycparser/utils/fake_libc_include',
#    '@@PYTHON_PATH@@/Lib/site-packages/pycparser/utils/fake_libc_include/arm'
])