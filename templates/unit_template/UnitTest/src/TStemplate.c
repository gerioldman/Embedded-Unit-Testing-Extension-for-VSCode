/**
 * @file @@TEST_SUITE_NAME@@.c
 * @brief TODO - Add description
 * @date @@DATE@@
 */

/* Generated includes - Do not modify ----------------------------------------*/

#include "TestSuites.h"
#include "UnitTestAssert.h"
/* It is normal for this to be not available right after project generation, this is created during the compilation process */
#include "@@unit_NAME@@.c_mock.h" 

/* Private includes ----------------------------------------------------------*/


/* Private typedef -----------------------------------------------------------*/


/* Private define ------------------------------------------------------------*/


/* Private macro -------------------------------------------------------------*/


/* Private variables ---------------------------------------------------------*/


/* Private function prototypes -----------------------------------------------*/


/* Private functions ---------------------------------------------------------*/


/* Public functions ----------------------------------------------------------*/

@@TEST_CASES@@

/* @@TEST_CASES_UPDATE@@ */
/* Test Suite declaration - Do not modify ------------------------------------*/

TestSuite @@TEST_SUITE_NAME@@ = {
	.name = "@@TEST_SUITE_NAME@@",
	.TestCases = 
	{
		@@TEST_CASE_ENTRIES@@
		TEST_CASE_ENTRY(TEST_CASE_END),
	}
};