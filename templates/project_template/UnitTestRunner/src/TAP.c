/**
 * @file TAP.c
 * @author gerioldman (k.gergo49@gmail.com)
 * @brief
 * @version 0.1
 * @date 2022-09-04
 *
 * @copyright Copyright (c) 2022
 *
 */

#include "TAP.h"
#include <stdio.h>
#include <string.h>

static char indentLevel = 0;
static unsigned int Version = 0;

/**
 * @brief Prints the TAP version
 *
 * @param version
 */
void TAP_version(unsigned int version)
{
    TAP_indent();
    Version = version;
    printf("TAP version %u\n", version);
}

/**
 * @brief Prints the TAP indentLevel for the current level
 *
 */
void TAP_indent()
{
    if (Version != 14u && indentLevel > 0)
    {
        printf("#");
    }
    for (int i = 0; i < indentLevel; i++)
    {
        printf("    ");
    }
}

/**
 * @brief Starts a TAP subtest
 *
 * @param subtestName
 */
void TAP_start_subtest(const char *subtestName)
{
    TAP_indent();
    printf("# Subtest: %s\n", subtestName);
    indentLevel++;
}

/**
 * @brief Ends a TAP subtest
 *
 */
void TAP_end_subtest(unsigned int testNumber, const char *subtestName, char subtestResult)
{
    indentLevel--;
    if (0 == subtestResult)
    {
        TAP_ok(testNumber, subtestName);
    }
    else
    {
        TAP_not_ok(testNumber, subtestName);
    }
}

/**
 * @brief Prints the TAP plan
 *
 * @param testCount
 */
void TAP_plan(unsigned int testCount)
{
    TAP_indent();
    printf("1..%u\n", testCount);
}

/**
 * @brief Prints TAP comment
 *
 * @param comment
 */
void TAP_comment(const char *comment)
{
    TAP_indent();
    printf("# %s", comment);
}

/**
 * @brief Prints TAP ok
 *
 * @param comment
 */
void TAP_ok(unsigned int testNumber, const char *comment)
{
    TAP_indent();
    if (comment == ((void *)0))
    {
        printf("ok %u\n", testNumber);
    }
    else
    {
        printf("ok %u - %s\n", testNumber, comment);
    }
}

/**
 * @brief Prints TAP not ok
 *
 * @param comment
 */
void TAP_not_ok(unsigned int testNumber, const char *comment)
{
    TAP_indent();
    if (comment == ((void *)0))
    {
        printf("not ok %u\n", testNumber);
    }
    else
    {
        printf("not ok %u - %s\n", testNumber, comment);
    }
}

/**
 * @brief Prints the TAP YAML diagnostic,
 * indentation is applied correctly to the message,
 * so there is no need to indent the message.
 * This implementation can be unsafe, if the message is not null terminated.
 *
 * @param message
 */
void TAP_YAMLDiagnostic(const char *file, unsigned int line, const char *message)
{
    // Start the YAML diagnostic
    TAP_indent();
    printf("  ---\n");

    // Print the file and line
    TAP_indent();
    printf("  file: %s\n", file);
    TAP_indent();
    printf("  line: %u\n", line);

    if (message == ((void *)0))
    {

        // Print the message and indent every line
        unsigned int index = 0u;
        while (message[index] != '\0')
        {
            TAP_indent();
            while (message[index] != '\0' && message[index] != '\n')
            {
                printf("%c", message[index]);
                index++;
            }
            printf("\n");
            if (message[index] != '\0')
                index++;
        }
    }

    // End the YAML diagnostic
    TAP_indent();
    printf("  ...\n");
}

/**
 * @brief Prints TAP skip
 *
 * @param testNumber The test number of the skipped test
 * @param comment
 */
void TAP_skip(unsigned int testNumber, const char *comment)
{
    TAP_indent();
    printf("ok %u - %s # SKIP", testNumber, comment);
}

/**
 * @brief Prints TAP todo
 *
 * @param testNumber
 * @param comment
 */
void TAP_todo(unsigned int testNumber, const char *comment)
{
    TAP_indent();
    printf("not ok %u - %s # TODO", testNumber, comment);
}

/**
 * @brief Prints TAP bail out
 *
 * @param comment
 */
void TAP_bail_out(const char *comment)
{
    TAP_indent();
    printf("Bail out! %s", comment);
}

// End of file