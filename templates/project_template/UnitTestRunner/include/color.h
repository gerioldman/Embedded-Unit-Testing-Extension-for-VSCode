#ifndef COLOR_H
#define COLOR_H

typedef enum
{
	BG_RESET = 0,
	BG_BLACK = 30,
	BG_RED = 31,
	BG_GREEN = 32,
	BG_YELLOW= 33,
	BG_BLUE= 34,
	BG_MAGENTA= 35, 
	BG_CYAN= 36,
	BG_WHITE= 37,
        BG_DEFAULT = 39,
	BG_BRIGHTBLACK= 90,
	BG_BRIGHTRED = 91,
	BG_BRIGHTGREEN= 92,
	BG_BRIGHTYELLOW= 93,
	BG_BRIGHTBLUE= 94,
	BG_BRIGHTMAGENTA= 95, 
	BG_BRIGHTCYAN= 96,
	BG_BRIGHTWHITE= 97
}BackgroundColourCode;

typedef enum
{
	FG_RESET = 0,
	FG_BLACK = 40,
	FG_RED = 41,
	FG_GREEN = 42,
	FG_YELLOW= 43,
	FG_BLUE= 44,
	FG_MAGENTA= 45, 
	FG_CYAN= 46,
	FG_WHITE= 47,
        FG_DEFAULT = 49,
	FG_BRIGHTBLACK= 100,
	FG_BRIGHTRED = 101,
	FG_BRIGHTGREEN= 102,
	FG_BRIGHTYELLOW= 103,
	FG_BRIGHTBLUE= 104,
	FG_BRIGHTMAGENTA= 105, 
	FG_BRIGHTCYAN= 106,
	FG_BRIGHTWHITE= 107
}ForegroundColourCode;

typedef enum{
    MC_RESET = 0,
    MC_BOLD = 1,
    MC_DIM = 2,
    MC_ITALIC = 3,
    MC_UNDERLINE = 4,
    MC_BLINK = 5,
    MC_INVERSE = 7,
    MC_HIDDEN = 8,
    MC_STRIKETHROUGH = 9
}ModifierCode;

/**
 * @brief Set a modifier for printed text
 * 
 * @param modifier See ModifierCode enum for options
 */
void SetModifier(ModifierCode modifier);

/**
 * @brief Set the foreground colour of printed text
 * 
 * @param colour See ForegroundColourCode enum for options
 */
void SetForegroundColour(ForegroundColourCode colour);

/**
 * @brief Set the background colour of printed text
 * 
 * @param colour See BackgroundColourCode enum for options
 */
void SetBackgroundColour(BackgroundColourCode colour);

/**
 * @brief Reset the options for the printed text
 * 
 */
void ResetColour(void);

#endif // COLOR_H