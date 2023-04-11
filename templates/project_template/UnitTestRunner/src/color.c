/**
 * @file color.c
 * @author gerioldman (k.gergo49@gmail.com)
 * @brief 
 * @version 0.1
 * @date 2023-03-15
 * 
 * @copyright Copyright (c) 2023
 * 
 */

#include "color.h"
#include "stdio.h"

/**
 * @brief Set a modifier for printed text
 * 
 * @param modifier See ModifierCode enum for options
 */
void SetModifier(ModifierCode modifier)
{
    printf("\x1b[%dm", modifier);
}

/**
 * @brief Set the foreground colour of printed text
 * 
 * @param colour See ForegroundColourCode enum for options
 */
void SetForegroundColour(ForegroundColourCode colour)
{
    printf("\x1b[%dm", colour);
}

/**
 * @brief Set the background colour of printed text
 * 
 * @param colour See BackgroundColourCode enum for options
 */
void SetBackgroundColour(BackgroundColourCode colour)
{
    printf("\x1b[%dm", colour);
}

/**
 * @brief Reset the options for the printed text
 * 
 */
void ResetColour(void)
{
    printf("\x1b[0m");
}