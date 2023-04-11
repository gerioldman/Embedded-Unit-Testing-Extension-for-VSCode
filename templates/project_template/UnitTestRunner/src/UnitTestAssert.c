/**
 * @file UnitTestAssert.c
 * @author gerioldman (k.gergo49@gmail.com)
 * @brief
 * @version 0.1
 * @date 2022-09-04
 *
 * @copyright Copyright (c) 2022
 *
 */

#include "UnitTestAssert.h"
#include "TAP.h"

uint32_t assertCount = 0u;
uint32_t currentLevelAssertCount = 0;
uint32_t failedAssertCount = 0;

/**
 * @brief Implementation of printing assert based on settings by the user
 * 
 * @param name Name of the assert for identification
 * @param condition evaluated condition
 * @param message Printed message after the assert fails
 */
void assert(char* name,boolean condition,char* file, unsigned int line ,char *message)
{
    // Increment the assert counters
    assertCount++;
    currentLevelAssertCount++;

    // Print the assert
    if (condition == FALSE)
    {
        failedAssertCount++;
        TAP_not_ok(currentLevelAssertCount,name);
        TAP_YAMLDiagnostic(file, line, message);
    }
    else
    {
        TAP_ok(currentLevelAssertCount, name);
    }
}