/**
 * @file UnitTestFramework.c
 * @author gerioldman (k.gergo49@gmail.com)
 * @brief
 * @version 0.1
 * @date 2022-09-04
 *
 * @copyright Copyright (c) 2022
 *
 */

#include "UnitTestFramework.h"
#include "TAP.h"

void RunAllTests(void)
{
    TAP_version(13);
    int i, j;

    // Run through all test suites
    for (i = 0; testSuites[i] != TEST_SUITE_END; i++)
    {
        TAP_start_subtest(testSuites[i]->name);

        // Run through all test cases
        for (j = 0; (testSuites[i])->TestCases[j].funct_ptr != TEST_CASE_END; j++)
        {
            TAP_start_subtest((testSuites[i])->TestCases[j].name);

            // Save failed assert count before test case to determine if Test Case failed
            uint32_t failedAssertCountBeforeTestCase = failedAssertCount;

            // Run clean up before test case
            if (testSuites[i]->cleanUpBefore_funcPtr != ((void (*)())0u))
            {
                testSuites[i]->cleanUpBefore_funcPtr();
            }

            // Run test case
            (testSuites[i])->TestCases[j].funct_ptr();

            // Run clean up after test case
            if (testSuites[i]->cleanUpAfter_funcPtr != ((void (*)())0u))
            {
                testSuites[i]->cleanUpAfter_funcPtr();
            }

            // Check if test case failed
            if (failedAssertCount > failedAssertCountBeforeTestCase)
            {
                testSuites[i]->TestCases[j].failed = TRUE;
                testSuites[i]->failed = TRUE;
            }

            TAP_plan(currentLevelAssertCount);
            currentLevelAssertCount = 0;
            TAP_end_subtest(j + 1, (testSuites[i])->TestCases[j].name, testSuites[i]->TestCases[j].failed);
        }

        TAP_end_subtest(i + 1, testSuites[i]->name, testSuites[i]->failed);
    }

    TAP_plan(i);
}