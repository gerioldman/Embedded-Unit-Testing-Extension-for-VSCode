/**
 * @file main.c
 * @author gerioldman (k.gergo49@gmail.com)
 * @brief Proccesses the command line arguments and runs the test suites.
 * @version 0.1
 * @date 2022-10-09
 *
 * @copyright Copyright (c) 2022
 *
 */

#include "UnitTestFramework.h"

#if PLATFORM == 0
int main(int argc, char *argv[])
#else
int main()
#endif
{

    RunAllTests();
#if PLATFORM == 1
    for (;;)
    {
        /* UnitTest done */
    }
#endif
    return 0;
}
