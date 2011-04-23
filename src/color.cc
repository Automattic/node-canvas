
//
// color.cc
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#include "color.h"
#include <stdlib.h>

/*
 * Consume whitespace.
 */

#define WHITESPACE \
  while (' ' == *str) ++str;

/*
 * Parse color channel value
 */

#define CHANNEL(NAME) \
   c = 0; \
   if (*str >= '0' && *str <= '9') { \
     do { \
       c *= 10; \
       c += *str++ - '0'; \
     } while (*str >= '0' && *str <= '9'); \
   } else { \
     return 0; \
   } \
   if (c > 255) c = 255; \
   NAME = c; \
   while (' ' == *str || ',' == *str) str++;

/*
 * Named colors.
 */

static struct named_color {
  const char *name;
  uint32_t val;
} named_colors[] = {
    { "transparent", 0xffffff00}
  , { "aliceblue", 0xf0f8ffff }
  , { "antiquewhite", 0xfaebd7ff }
  , { "aqua", 0x00ffffff }
  , { "aquamarine", 0x7fffd4ff }
  , { "azure", 0xf0ffffff }
  , { "beige", 0xf5f5dcff }
  , { "bisque", 0xffe4c4ff }
  , { "black", 0x000000ff }
  , { "blanchedalmond", 0xffebcdff }
  , { "blue", 0x0000ffff }
  , { "blueviolet", 0x8a2be2ff }
  , { "brown", 0xa52a2aff }
  , { "burlywood", 0xdeb887ff }
  , { "cadetblue", 0x5f9ea0ff }
  , { "chartreuse", 0x7fff00ff }
  , { "chocolate", 0xd2691eff }
  , { "coral", 0xff7f50ff }
  , { "cornflowerblue", 0x6495edff }
  , { "cornsilk", 0xfff8dcff }
  , { "crimson", 0xdc143cff }
  , { "cyan", 0x00ffffff }
  , { "darkblue", 0x00008bff }
  , { "darkcyan", 0x008b8bff }
  , { "darkgoldenrod", 0xb8860bff }
  , { "darkgray", 0xa9a9a9ff }
  , { "darkgreen", 0x006400ff }
  , { "darkkhaki", 0xbdb76bff }
  , { "darkmagenta", 0x8b008bff }
  , { "darkolivegreen", 0x556b2fff }
  , { "darkorange", 0xff8c00ff }
  , { "darkorchid", 0x9932ccff }
  , { "darkred", 0x8b0000ff }
  , { "darksalmon", 0xe9967aff }
  , { "darkseagreen", 0x8fbc8fff }
  , { "darkslateblue", 0x483d8bff }
  , { "darkslategray", 0x2f4f4fff }
  , { "darkturquoise", 0x00ced1ff }
  , { "darkviolet", 0x9400d3ff }
  , { "deeppink", 0xff1493ff }
  , { "deepskyblue", 0x00bfffff }
  , { "dimgray", 0x696969ff }
  , { "dodgerblue", 0x1e90ffff }
  , { "feldspar", 0xd19275ff }
  , { "firebrick", 0xb22222ff }
  , { "floralwhite", 0xfffaf0ff }
  , { "forestgreen", 0x228b22ff }
  , { "fuchsia", 0xff00ffff }
  , { "gainsboro", 0xdcdcdcff }
  , { "ghostwhite", 0xf8f8ffff }
  , { "gold", 0xffd700ff }
  , { "goldenrod", 0xdaa520ff }
  , { "gray", 0x808080ff }
  , { "green", 0x008000ff }
  , { "greenyellow", 0xadff2fff }
  , { "honeydew", 0xf0fff0ff }
  , { "hotpink", 0xff69b4ff }
  , { "indianred ", 0xcd5c5cff }
  , { "indigo ", 0x4b0082ff }
  , { "ivory", 0xfffff0ff }
  , { "khaki", 0xf0e68cff }
  , { "lavender", 0xe6e6faff }
  , { "lavenderblush", 0xfff0f5ff }
  , { "lawngreen", 0x7cfc00ff }
  , { "lemonchiffon", 0xfffacdff }
  , { "lightblue", 0xadd8e6ff }
  , { "lightcoral", 0xf08080ff }
  , { "lightcyan", 0xe0ffffff }
  , { "lightgoldenrodyellow", 0xfafad2ff }
  , { "lightgrey", 0xd3d3d3ff }
  , { "lightgreen", 0x90ee90ff }
  , { "lightpink", 0xffb6c1ff }
  , { "lightsalmon", 0xffa07aff }
  , { "lightseagreen", 0x20b2aaff }
  , { "lightskyblue", 0x87cefaff }
  , { "lightslateblue", 0x8470ffff }
  , { "lightslategray", 0x778899ff }
  , { "lightsteelblue", 0xb0c4deff }
  , { "lightyellow", 0xffffe0ff }
  , { "lime", 0x00ff00ff }
  , { "limegreen", 0x32cd32ff }
  , { "linen", 0xfaf0e6ff }
  , { "magenta", 0xff00ffff }
  , { "maroon", 0x800000ff }
  , { "mediumaquamarine", 0x66cdaaff }
  , { "mediumblue", 0x0000cdff }
  , { "mediumorchid", 0xba55d3ff }
  , { "mediumpurple", 0x9370d8ff }
  , { "mediumseagreen", 0x3cb371ff }
  , { "mediumslateblue", 0x7b68eeff }
  , { "mediumspringgreen", 0x00fa9aff }
  , { "mediumturquoise", 0x48d1ccff }
  , { "mediumvioletred", 0xc71585ff }
  , { "midnightblue", 0x191970ff }
  , { "mintcream", 0xf5fffaff }
  , { "mistyrose", 0xffe4e1ff }
  , { "moccasin", 0xffe4b5ff }
  , { "navajowhite", 0xffdeadff }
  , { "navy", 0x000080ff }
  , { "oldlace", 0xfdf5e6ff }
  , { "olive", 0x808000ff }
  , { "olivedrab", 0x6b8e23ff }
  , { "orange", 0xffa500ff }
  , { "orangered", 0xff4500ff }
  , { "orchid", 0xda70d6ff }
  , { "palegoldenrod", 0xeee8aaff }
  , { "palegreen", 0x98fb98ff }
  , { "paleturquoise", 0xafeeeeff }
  , { "palevioletred", 0xd87093ff }
  , { "papayawhip", 0xffefd5ff }
  , { "peachpuff", 0xffdab9ff }
  , { "peru", 0xcd853fff }
  , { "pink", 0xffc0cbff }
  , { "plum", 0xdda0ddff }
  , { "powderblue", 0xb0e0e6ff }
  , { "purple", 0x800080ff }
  , { "red", 0xff0000ff }
  , { "rosybrown", 0xbc8f8fff }
  , { "royalblue", 0x4169e1ff }
  , { "saddlebrown", 0x8b4513ff }
  , { "salmon", 0xfa8072ff }
  , { "sandybrown", 0xf4a460ff }
  , { "seagreen", 0x2e8b57ff }
  , { "seashell", 0xfff5eeff }
  , { "sienna", 0xa0522dff }
  , { "silver", 0xc0c0c0ff }
  , { "skyblue", 0x87ceebff }
  , { "slateblue", 0x6a5acdff }
  , { "slategray", 0x708090ff }
  , { "snow", 0xfffafaff }
  , { "springgreen", 0x00ff7fff }
  , { "steelblue", 0x4682b4ff }
  , { "tan", 0xd2b48cff }
  , { "teal", 0x008080ff }
  , { "thistle", 0xd8bfd8ff }
  , { "tomato", 0xff6347ff }
  , { "turquoise", 0x40e0d0ff }
  , { "violet", 0xee82eeff }
  , { "violetred", 0xd02090ff }
  , { "wheat", 0xf5deb3ff }
  , { "white", 0xffffffff }
  , { "whitesmoke", 0xf5f5f5ff }
  , { "yellow", 0xffff00ff }
  , { "yellowgreen", 0x9acd32ff }
  , { NULL, NULL }
};

/*
 * Hex digit int val.
 */

static int
h(char c) {
  switch (c) {
    case '0':
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
      return c - '0';
    case 'a':
    case 'b':
    case 'c':
    case 'd':
    case 'e':
    case 'f':
      return (c - 'a') + 10;
    case 'A':
    case 'B':
    case 'C':
    case 'D':
    case 'E':
    case 'F':
      return (c - 'A') + 10;
  }
  return 0;
}

/*
 * Return rgba_t from rgba.
 */

rgba_t
rgba_create(uint32_t rgba) {
  rgba_t color;
  color.r = (double) (rgba >> 24) / 255;
  color.g = (double) (rgba >> 16 & 0xff) / 255;
  color.b = (double) (rgba >> 8 & 0xff) / 255;
  color.a = (double) (rgba & 0xff) / 255;
  return color;
}

/*
 * Return a string representation of the color.
 */

void
rgba_to_string(rgba_t rgba, char *buf) {
  if (1 == rgba.a) {
    sprintf(buf, "#%.2x%.2x%.2x"
      , (int) (rgba.r * 255)
      , (int) (rgba.g * 255)
      , (int) (rgba.b * 255));
  } else {
    sprintf(buf, "rgba(%d, %d, %d, %.2f)"
      , (int) (rgba.r * 255)
      , (int) (rgba.g * 255)
      , (int) (rgba.b * 255)
      , rgba.a);
  }
}

/*
 * Return rgba from (r,g,b,a).
 */

static inline int32_t
rgba_from_rgba(uint8_t r, uint8_t g, uint8_t b, uint8_t a) {
  return
      r << 24
    | g << 16
    | b << 8
    | a;
}

/*
 * Return rgba from (r,g,b).
 */

static int32_t
rgba_from_rgb(uint8_t r, uint8_t g, uint8_t b) {
  return rgba_from_rgba(r, g, b, 255);
}

/*
 * Return rgb from "#RRGGBB".
 */

static int32_t
rgba_from_hex6_string(const char *str) {
  return rgba_from_rgb(
      (h(str[0]) << 4) + h(str[1])
    , (h(str[2]) << 4) + h(str[3])
    , (h(str[4]) << 4) + h(str[5])
    );
}

/*
 * Return rgb from "#RGB"
 */

static int32_t
rgba_from_hex3_string(const char *str) {
  return rgba_from_rgb(
      (h(str[0]) << 4) + h(str[0])
    , (h(str[1]) << 4) + h(str[1])
    , (h(str[2]) << 4) + h(str[2])
    );
}

/*
 * Return rgb from "rgb()"
 */

static int32_t
rgba_from_rgb_string(const char *str, short *ok) {
  if (str == strstr(str, "rgb(")) {
    str += 4;
    WHITESPACE;
    uint8_t r = 0, g = 0, b = 0;
    int c;
    CHANNEL(r);
    CHANNEL(g);
    CHANNEL(b);
    return *ok = 1, rgba_from_rgb(r, g, b);
  }
  return *ok = 0;
}

/*
 * Return rgb from "rgba()"
 */

static int32_t
rgba_from_rgba_string(const char *str, short *ok) {
  if (str == strstr(str, "rgba(")) {
    str += 5;
    WHITESPACE;
    uint8_t r = 0, g = 0, b = 0;
    int c;
    float a = 0;
    CHANNEL(r);
    CHANNEL(g);
    CHANNEL(b);
    if (*str >= '1' && *str <= '9') {
      a = 1;
    } else {
      if ('0' == *str) ++str;
      if ('.' == *str) {
        ++str;
        float n = .1;
        while (*str >= '0' && *str <= '9') {
          a += (*str++ - '0') * n;
          n *= .1;
        }
      }
    }
    return *ok = 1, rgba_from_rgba(r, g, b, (int) (a * 255));
  }
  return *ok = 0;
}

/*
 * Return rgb from:
 *  
 *  - "#RGB"
 *  - "#RRGGBB"
 *
 */

static int32_t
rgba_from_hex_string(const char *str, short *ok) {
  size_t len = strlen(str);
  *ok = 1;
  if (6 == len) return rgba_from_hex6_string(str);
  if (3 == len) return rgba_from_hex3_string(str);
  return *ok = 0;
}

/*
 * Return named color value.
 */

static int32_t
rgba_from_name_string(const char *str, short *ok) {
  int i = 0;
  struct named_color color;
  while ((color = named_colors[i++]).name) {
    if (*str == *color.name && 0 == strcmp(str, color.name))
      return *ok = 1, color.val;
  }
  return *ok = 0;
}

/*
 * Return rgb from:
 *  
 *  - #RGB
 *  - #RRGGBB
 *  - rgb(r,g,b)
 *  - rgba(r,g,b,a)
 *  - name
 *
 */

int32_t
rgba_from_string(const char *str, short *ok) {
  if ('#' == str[0]) 
    return rgba_from_hex_string(++str, ok);
  if (str == strstr(str, "rgba"))
    return rgba_from_rgba_string(str, ok);
  if (str == strstr(str, "rgb"))
    return rgba_from_rgb_string(str, ok);
  return rgba_from_name_string(str, ok);
}

/*
 * Inspect the given rgba color.
 */

void
rgba_inspect(int32_t rgba) {
  printf("rgba(%d,%d,%d,%d)\n"
    , rgba >> 24 & 0xff
    , rgba >> 16 & 0xff
    , rgba >> 8 & 0xff
    , rgba & 0xff
    );
}
