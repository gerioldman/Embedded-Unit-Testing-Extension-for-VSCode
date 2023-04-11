/**
 * @file UnitTestAssert.h
 * @author gerioldman (k.gergo49@gmail.com)
 * @brief
 * @version 0.1
 * @date 2022-09-04
 *
 * @copyright Copyright (c) 2022
 *
 */

#ifndef UNITTESTASSERT_H
#define UNITTESTASSERT_H

#include <stdio.h>
#include <stdint.h>
#include <string.h>
#include <inttypes.h>

/*
 * @brief The maximum length of the assert message
 *
 */
#define ASSERT_MESSAGE_LENGTH 512u

extern uint32_t assertCount;
extern uint32_t currentLevelAssertCount;
extern uint32_t failedAssertCount;

typedef unsigned char boolean;
#define TRUE 1u
#define FALSE 0u

void assert(char *name, boolean condition, char *file, unsigned int line, char *message);

/**
 * @brief Assert signed 8 bit integer equality
 *
 * @param actual
 * @param expected
 */
#define ASSERT_INT8_EQUAL(actual, expected)                                                                               \
    {                                                                                                                     \
        char temp[ASSERT_MESSAGE_LENGTH];                                                                                 \
        snprintf(temp, ASSERT_MESSAGE_LENGTH, "Expected: %" PRId8 ", Actual: %" PRId8, (int8_t)expected, (int8_t)actual); \
        assert(((void *)0u), ((int8_t)actual == (int8_t)expected), __FILE__, __LINE__, temp);                             \
    }

/**
 * @brief Assert signed 16 bit integer equality
 *
 * @param actual
 * @param expected
 */
#define ASSERT_INT16_EQUAL(actual, expected)                                                                                  \
    {                                                                                                                         \
        char temp[ASSERT_MESSAGE_LENGTH];                                                                                     \
        snprintf(temp, ASSERT_MESSAGE_LENGTH, "Expected: %" PRId16 ", Actual: %" PRId16, (int16_t)expected, (int16_t)actual); \
        assert(((void *)0u), ((int16_t)actual == (int16_t)expected), __FILE__, __LINE__, temp);                               \
    }

/**
 * @brief Assert signed 32 bit integer equality
 *
 * @param actual
 * @param expected
 */
#define ASSERT_INT32_EQUAL(actual, expected)                                                                                  \
    {                                                                                                                         \
        char temp[ASSERT_MESSAGE_LENGTH];                                                                                     \
        snprintf(temp, ASSERT_MESSAGE_LENGTH, "Expected: %" PRId32 ", Actual: %" PRId32, (int32_t)expected, (int32_t)actual); \
        assert(((void *)0u), ((int32_t)actual == (int32_t)expected), __FILE__, __LINE__, temp);                               \
    }

/**
 * @brief Assert signed 64 bit integer equality
 *
 * @param actual
 * @param expected
 */
#define ASSERT_INT64_EQUAL(actual, expected)                                                                                  \
    {                                                                                                                         \
        char temp[ASSERT_MESSAGE_LENGTH];                                                                                     \
        snprintf(temp, ASSERT_MESSAGE_LENGTH, "Expected: %" PRId64 ", Actual: %" PRId64, (int64_t)expected, (int64_t)actual); \
        assert(((void *)0u), ((int64_t)actual == (int64_t)expected), __FILE__, __LINE__, temp);                               \
    }

/**
 * @brief Assert unsigned 8 bit integer equality
 *
 * @param actual
 * @param expected
 */
#define ASSERT_UINT8_EQUAL(actual, expected)                                                                                \
    {                                                                                                                       \
        char temp[ASSERT_MESSAGE_LENGTH];                                                                                   \
        snprintf(temp, ASSERT_MESSAGE_LENGTH, "Expected: %" PRIu8 ", Actual: %" PRIu8, (uint8_t)expected, (uint8_t)actual); \
        assert(((void *)0u), ((uint8_t)actual == (uint8_t)expected), __FILE__, __LINE__, temp);                             \
    }

/**
 * @brief Assert unsigned 16 bit integer equality
 *
 * @param actual
 * @param expected
 */
#define ASSERT_UINT16_EQUAL(actual, expected)                                                                                   \
    {                                                                                                                           \
        char temp[ASSERT_MESSAGE_LENGTH];                                                                                       \
        snprintf(temp, ASSERT_MESSAGE_LENGTH, "Expected: %" PRIu16 ", Actual: %" PRIu16, (uint16_t)expected, (uint16_t)actual); \
        assert(((void *)0u), ((uint16_t)actual == (uint16_t)expected), __FILE__, __LINE__, temp);                               \
    }

/**
 * @brief Assert unsigned 32 bit integer equality
 *
 * @param actual
 * @param expected
 */
#define ASSERT_UINT32_EQUAL(actual, expected)                                                                                   \
    {                                                                                                                           \
        char temp[ASSERT_MESSAGE_LENGTH];                                                                                       \
        snprintf(temp, ASSERT_MESSAGE_LENGTH, "Expected: %" PRIu32 ", Actual: %" PRIu32, (uint32_t)expected, (uint32_t)actual); \
        assert(((void *)0u), ((uint32_t)actual == (uint32_t)expected), __FILE__, __LINE__, temp);                               \
    }
/**
 * @brief Assert unsigned 64 bit integer equality
 *
 * @param actual
 * @param expected
 */
#define ASSERT_UINT64_EQUAL(actual, expected)                                                                                   \
    {                                                                                                                           \
        char temp[ASSERT_MESSAGE_LENGTH];                                                                                       \
        snprintf(temp, ASSERT_MESSAGE_LENGTH, "Expected: %" PRIu64 ", Actual: %" PRIu64, (uint64_t)expected, (uint64_t)actual); \
        assert(((void *)0u), ((uint64_t)actual == (uint64_t)expected), __FILE__, __LINE__, temp);                               \
    }

/**
 * @brief Assert 8 bit integer equality, printing in hex
 *
 * @param actual
 * @param expected
 */
#define ASSERT_HEX8_EQUAL(actual, expected)                                                                                     \
    {                                                                                                                           \
        char temp[ASSERT_MESSAGE_LENGTH];                                                                                       \
        snprintf(temp, ASSERT_MESSAGE_LENGTH, "Expected: 0x%" PRIx8 ", Actual: 0x%" PRIx8, (uint8_t)expected, (uint8_t)actual); \
        assert(((void *)0u), ((uint8_t)actual == (uint8_t)expected), __FILE__, __LINE__, temp);                                 \
    }

/**
 * @brief Assert 16 bit integer equality, printing in hex
 *
 * @param actual
 * @param expected
 */
#define ASSERT_HEX16_EQUAL(actual, expected)                                                                                        \
    {                                                                                                                               \
        char temp[ASSERT_MESSAGE_LENGTH];                                                                                           \
        snprintf(temp, ASSERT_MESSAGE_LENGTH, "Expected: 0x%" PRIx16 ", Actual: 0x%" PRIx16, (uint16_t)expected, (uint16_t)actual); \
        assert(((void *)0u), ((uint16_t)actual == (uint16_t)expected), __FILE__, __LINE__, temp);                                   \
    }

/**
 * @brief Assert 32 bit integer equality, printing in hex
 *
 * @param actual
 * @param expected
 */
#define ASSERT_HEX32_EQUAL(actual, expected)                                                                                        \
    {                                                                                                                               \
        char temp[ASSERT_MESSAGE_LENGTH];                                                                                           \
        snprintf(temp, ASSERT_MESSAGE_LENGTH, "Expected: 0x%" PRIx32 ", Actual: 0x%" PRIx32, (uint32_t)expected, (uint32_t)actual); \
        assert(((void *)0u), ((uint32_t)actual == (uint32_t)expected), __FILE__, __LINE__, temp);                                   \
    }

/**
 * @brief Assert 64 bit integer equality, printing in hex
 *
 * @param actual
 * @param expected
 */
#define ASSERT_HEX64_EQUAL(actual, expected)                                                                                        \
    {                                                                                                                               \
        char temp[ASSERT_MESSAGE_LENGTH];                                                                                           \
        snprintf(temp, ASSERT_MESSAGE_LENGTH, "Expected: 0x%" PRIx64 ", Actual: 0x%" PRIx64, (uint64_t)expected, (uint64_t)actual); \
        assert(((void *)0u), ((uint64_t)actual == (uint64_t)expected), __FILE__, __LINE__, temp);                                   \
    }

/**
 * @brief Assert single precision floating point equality
 *
 * @param actual
 * @param expected
 * @param tolerance
 */
#define ASSERT_FLOAT_EQUAL(actual, expected, tolerance)                                                                                                                   \
    {                                                                                                                                                                     \
        char temp[ASSERT_MESSAGE_LENGTH];                                                                                                                                 \
        snprintf(temp, ASSERT_MESSAGE_LENGTH, "Expected: %f, Actual: %f", (float)expected, (float)actual);                                                                \
        assert(((void *)0u), (((float)actual >= (float)expected - (float)tolerance) && ((float)actual <= (float)expected + (float)tolerance)), __FILE__, __LINE__, temp); \
    }

/**
 * @brief Assert single precision floating point inequality
 *
 * @param actual
 * @param expected
 * @param tolerance
 */
#define ASSERT_FLOAT_NOT_EQUAL(actual, expected, tolerance)                                                                                                             \
    {                                                                                                                                                                   \
        char temp[ASSERT_MESSAGE_LENGTH];                                                                                                                               \
        snprintf(temp, ASSERT_MESSAGE_LENGTH, "Expected: %f, Actual: %f", (float)expected, (float)actual);                                                              \
        assert(((void *)0u), (((float)actual < (float)expected - (float)tolerance) || ((float)actual > (float)expected + (float)tolerance)), __FILE__, __LINE__, temp); \
    }

/**
 * @brief Assert double precision floating point equality
 *
 * @param actual
 * @param expected
 */
#define ASSERT_DOUBLE_EQUAL(actual, expected, tolerance)                                                                                                                        \
    {                                                                                                                                                                           \
        char temp[ASSERT_MESSAGE_LENGTH];                                                                                                                                       \
        snprintf(temp, ASSERT_MESSAGE_LENGTH, "Expected: %lf, Actual: %lf", (double)expected, (double)actual);                                                                  \
        assert(((void *)0u), (((double)actual >= (double)expected - (double)tolerance) && ((double)actual <= (double)expected + (double)tolerance)), __FILE__, __LINE__, temp); \
    }

/**
 * @brief Assert double precision floating point inequality
 *
 * @param actual
 * @param expected
 */
#define ASSERT_DOUBLE_NOT_EQUAL(actual, expected, tolerance)                                                                                                                  \
    {                                                                                                                                                                         \
        char temp[ASSERT_MESSAGE_LENGTH];                                                                                                                                     \
        snprintf(temp, ASSERT_MESSAGE_LENGTH, "Expected: %lf, Actual: %lf", (double)expected, (double)actual);                                                                \
        assert(((void *)0u), (((double)actual < (double)expected - (double)tolerance) || ((double)actual > (double)expected + (double)tolerance)), __FILE__, __LINE__, temp); \
    }

/**
 * @brief Assert null pointer
 *
 * @param actual
 * @param expected
 */
#define ASSERT_NULL(actual)                                                                  \
    {                                                                                        \
        char temp[ASSERT_MESSAGE_LENGTH];                                                    \
        snprintf(temp, ASSERT_MESSAGE_LENGTH, "Expected: NULL, Actual: %p", (void *)actual); \
        assert(((void *)0u), ((void *)actual == ((void *)0u)), __FILE__, __LINE__, temp);    \
    }

/**
 * @brief Assert not null pointer
 *
 * @param actual
 */
#define ASSERT_NOT_NULL(actual)                                                                  \
    {                                                                                            \
        char temp[ASSERT_MESSAGE_LENGTH];                                                        \
        snprintf(temp, ASSERT_MESSAGE_LENGTH, "Expected: NOT NULL, Actual: %p", (void *)actual); \
        assert(((void *)0u), ((void *)actual != ((void *)0u)), __FILE__, __LINE__, temp);        \
    }

/**
 * @brief Assert string equality, up to a maximum length
 *
 * @param actual
 * @param expected
 */
#define ASSERT_STRING_EQUAL(actual, expected, maxlength)                                                                     \
    {                                                                                                                        \
        char temp[ASSERT_MESSAGE_LENGTH];                                                                                    \
        snprintf(temp, ASSERT_MESSAGE_LENGTH, "Expected: %s, Actual: %s", (char *)expected, (char *)actual);                 \
        assert(((void *)0u), (strncmp((char *)actual, (char *)expected, (size_t)maxlength) == 0), __FILE__, __LINE__, temp); \
    }

/**
 * @brief Assert string inequality, up to a maximum length
 *
 * @param actual
 * @param expected
 */
#define ASSERT_STRING_NOT_EQUAL(actual, expected, maxlength)                                                                 \
    {                                                                                                                        \
        char temp[ASSERT_MESSAGE_LENGTH];                                                                                    \
        snprintf(temp, ASSERT_MESSAGE_LENGTH, "Expected: %s, Actual: %s", (char *)expected, (char *)actual);                 \
        assert(((void *)0u), (strncmp((char *)actual, (char *)expected, (size_t)maxlength) != 0), __FILE__, __LINE__, temp); \
    }

/**
 * @brief Assert string equality, up to a maximum length, case insensitive
 *
 * @param actual
 * @param expected
 */
#define ASSERT_STRING_EQUAL_CASE_INSENSITIVE(actual, expected, maxlength)                                                        \
    {                                                                                                                            \
        char temp[ASSERT_MESSAGE_LENGTH];                                                                                        \
        snprintf(temp, ASSERT_MESSAGE_LENGTH, "Expected: %s, Actual: %s", (char *)expected, (char *)actual);                     \
        assert(((void *)0u), (strncasecmp((char *)actual, (char *)expected, (size_t)maxlength) == 0), __FILE__, __LINE__, temp); \
    }

/**
 * @brief Assert string inequality, up to a maximum length, case insensitive
 *
 * @param actual
 * @param expected
 */
#define ASSERT_STRING_NOT_EQUAL_CASE_INSENSITIVE(actual, expected, maxlength)                                                    \
    {                                                                                                                            \
        char temp[ASSERT_MESSAGE_LENGTH];                                                                                        \
        snprintf(temp, ASSERT_MESSAGE_LENGTH, "Expected: %s, Actual: %s", (char *)expected, (char *)actual);                     \
        assert(((void *)0u), (strncasecmp((char *)actual, (char *)expected, (size_t)maxlength) != 0), __FILE__, __LINE__, temp); \
    }

#endif /* UNITTESTASSERT_H */