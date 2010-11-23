
//
// color.h
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#ifndef __COLOR_PARSER_H__
#define __COLOR_PARSER_H__

#include <stdio.h>
#include <stdint.h>
#include <string.h>

/*
 * RGBA struct.
 */

typedef struct {
  double r, g, b, a;
} rgba_t;

/*
 * Prototypes.
 */

rgba_t
rgba_create(uint32_t rgba);

inline int32_t
rgba_from_rgba(uint8_t r, uint8_t g, uint8_t b, uint8_t a);

int32_t
rgba_from_rgb(uint8_t r, uint8_t g, uint8_t b);

int32_t
rgba_from_hex6_string(const char *str);

int32_t
rgba_from_hex3_string(const char *str);

int32_t
rgba_from_rgb_string(const char *str);

int32_t
rgba_from_rgba_string(const char *str);

int32_t
rgba_from_hex_string(const char *str);

int32_t
rgba_from_name_string(const char *str);

int32_t
rgba_from_string(const char *str);

void
rgba_inspect(int32_t rgba);

#endif /* __COLOR_PARSER_H__ */
