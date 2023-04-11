/**
 * @file @@TEST_SUITE_NAME@@.c
 * @brief TODO - Add description
 * @date @@DATE@@
 */

/* Generated includes - Do not modify ----------------------------------------*/

#include "TestSuites.h"
#include "UnitTestAssert.h"
/* It is normal for this to be not available right after project generation, this is created during the compilation process */
#include "@@COMPONENT_NAME@@.c_mock.h" 

/* Private includes ----------------------------------------------------------*/


/* Private macros ------------------------------------------------------------*/


/* Private typedef -----------------------------------------------------------*/


/* Global variables ----------------------------------------------------------*/


/* Private variables ---------------------------------------------------------*/


/* Function declarations -----------------------------------------------------*/


/* Function definitions ------------------------------------------------------*/

@@TEST_CASES@@

/* Test Suite declaration - Do not modifiy -----------------------------------*/

TestSuite @@TEST_SUITE_NAME@@ = {
	.name = "@@TEST_SUITE_NAME@@",
	.TestCases = 
	{
		@@TEST_CASE_ENTRIES@@
		TEST_CASE_ENTRY(TEST_CASE_END),
	}
};