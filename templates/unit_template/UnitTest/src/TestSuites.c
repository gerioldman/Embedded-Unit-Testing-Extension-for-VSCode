/**
 * @file TestSuites.c
 * @brief TODO
 * @date @@DATE@@
*/

#include "TestSuites.h"

/* Private includes ----------------------------------------------------------*/


/* Private typedef -----------------------------------------------------------*/


/* Private define ------------------------------------------------------------*/


/* Private macro -------------------------------------------------------------*/


/* Private variables ---------------------------------------------------------*/


@@EXTERN_TEST_SUITES@@

TestSuite* testSuites[] = {
	@@TEST_SUITES@@
	TEST_SUITE_END
};
