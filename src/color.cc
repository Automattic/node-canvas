
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
    { "transparent", 0xFFFFFF00}
  , { "aliceblue", 0xF0F8FFFF }
  , { "antiquewhite", 0xFAEBD7FF }
  , { "aqua", 0x00FFFFFF }
  , { "aquamarine", 0x7FFFD4FF }
  , { "azure", 0xF0FFFFFF }
  , { "beige", 0xF5F5DCFF }
  , { "bisque", 0xFFE4C4FF }
  , { "black", 0x000000FF }
  , { "blanchedalmond", 0xFFEBCDFF }
  , { "blue", 0x0000FFFF }
  , { "blueviolet", 0x8A2BE2FF }
  , { "brown", 0xA52A2AFF }
  , { "burlywood", 0xDEB887FF }
  , { "cadetblue", 0x5F9EA0FF }
  , { "chartreuse", 0x7FFF00FF }
  , { "chocolate", 0xD2691EFF }
  , { "coral", 0xFF7F50FF }
  , { "cornflowerblue", 0x6495EDFF }
  , { "cornsilk", 0xFFF8DCFF }
  , { "crimson", 0xDC143CFF }
  , { "cyan", 0x00FFFFFF }
  , { "darkblue", 0x00008BFF }
  , { "darkcyan", 0x008B8BFF }
  , { "darkgoldenrod", 0xB8860BFF }
  , { "darkgray", 0xA9A9A9FF }
  , { "darkgreen", 0x006400FF }
  , { "darkgrey", 0xA9A9A9FF }
  , { "darkkhaki", 0xBDB76BFF }
  , { "darkmagenta", 0x8B008BFF }
  , { "darkolivegreen", 0x556B2FFF }
  , { "darkorange", 0xFF8C00FF }
  , { "darkorchid", 0x9932CCFF }
  , { "darkred", 0x8B0000FF }
  , { "darksalmon", 0xE9967AFF }
  , { "darkseagreen", 0x8FBC8FFF }
  , { "darkslateblue", 0x483D8BFF }
  , { "darkslategray", 0x2F4F4FFF }
  , { "darkslategrey", 0x2F4F4FFF }
  , { "darkturquoise", 0x00CED1FF }
  , { "darkviolet", 0x9400D3FF }
  , { "deeppink", 0xFF1493FF }
  , { "deepskyblue", 0x00BFFFFF }
  , { "dimgray", 0x696969FF }
  , { "dimgrey", 0x696969FF }
  , { "dodgerblue", 0x1E90FFFF }
  , { "firebrick", 0xB22222FF }
  , { "floralwhite", 0xFFFAF0FF }
  , { "forestgreen", 0x228B22FF }
  , { "fuchsia", 0xFF00FFFF }
  , { "gainsboro", 0xDCDCDCFF }
  , { "ghostwhite", 0xF8F8FFFF }
  , { "gold", 0xFFD700FF }
  , { "goldenrod", 0xDAA520FF }
  , { "gray", 0x808080FF }
  , { "green", 0x008000FF }
  , { "greenyellow", 0xADFF2FFF }
  , { "grey", 0x808080FF }
  , { "honeydew", 0xF0FFF0FF }
  , { "hotpink", 0xFF69B4FF }
  , { "indianred", 0xCD5C5CFF }
  , { "indigo", 0x4B0082FF }
  , { "ivory", 0xFFFFF0FF }
  , { "khaki", 0xF0E68CFF }
  , { "lavender", 0xE6E6FAFF }
  , { "lavenderblush", 0xFFF0F5FF }
  , { "lawngreen", 0x7CFC00FF }
  , { "lemonchiffon", 0xFFFACDFF }
  , { "lightblue", 0xADD8E6FF }
  , { "lightcoral", 0xF08080FF }
  , { "lightcyan", 0xE0FFFFFF }
  , { "lightgoldenrodyellow", 0xFAFAD2FF }
  , { "lightgray", 0xD3D3D3FF }
  , { "lightgreen", 0x90EE90FF }
  , { "lightgrey", 0xD3D3D3FF }
  , { "lightpink", 0xFFB6C1FF }
  , { "lightsalmon", 0xFFA07AFF }
  , { "lightseagreen", 0x20B2AAFF }
  , { "lightskyblue", 0x87CEFAFF }
  , { "lightslategray", 0x778899FF }
  , { "lightslategrey", 0x778899FF }
  , { "lightsteelblue", 0xB0C4DEFF }
  , { "lightyellow", 0xFFFFE0FF }
  , { "lime", 0x00FF00FF }
  , { "limegreen", 0x32CD32FF }
  , { "linen", 0xFAF0E6FF }
  , { "magenta", 0xFF00FFFF }
  , { "maroon", 0x800000FF }
  , { "mediumaquamarine", 0x66CDAAFF }
  , { "mediumblue", 0x0000CDFF }
  , { "mediumorchid", 0xBA55D3FF }
  , { "mediumpurple", 0x9370DBFF }
  , { "mediumseagreen", 0x3CB371FF }
  , { "mediumslateblue", 0x7B68EEFF }
  , { "mediumspringgreen", 0x00FA9AFF }
  , { "mediumturquoise", 0x48D1CCFF }
  , { "mediumvioletred", 0xC71585FF }
  , { "midnightblue", 0x191970FF }
  , { "mintcream", 0xF5FFFAFF }
  , { "mistyrose", 0xFFE4E1FF }
  , { "moccasin", 0xFFE4B5FF }
  , { "navajowhite", 0xFFDEADFF }
  , { "navy", 0x000080FF }
  , { "oldlace", 0xFDF5E6FF }
  , { "olive", 0x808000FF }
  , { "olivedrab", 0x6B8E23FF }
  , { "orange", 0xFFA500FF }
  , { "orangered", 0xFF4500FF }
  , { "orchid", 0xDA70D6FF }
  , { "palegoldenrod", 0xEEE8AAFF }
  , { "palegreen", 0x98FB98FF }
  , { "paleturquoise", 0xAFEEEEFF }
  , { "palevioletred", 0xDB7093FF }
  , { "papayawhip", 0xFFEFD5FF }
  , { "peachpuff", 0xFFDAB9FF }
  , { "peru", 0xCD853FFF }
  , { "pink", 0xFFC0CBFF }
  , { "plum", 0xDDA0DDFF }
  , { "powderblue", 0xB0E0E6FF }
  , { "purple", 0x800080FF }
  , { "red", 0xFF0000FF }
  , { "rosybrown", 0xBC8F8FFF }
  , { "royalblue", 0x4169E1FF }
  , { "saddlebrown", 0x8B4513FF }
  , { "salmon", 0xFA8072FF }
  , { "sandybrown", 0xF4A460FF }
  , { "seagreen", 0x2E8B57FF }
  , { "seashell", 0xFFF5EEFF }
  , { "sienna", 0xA0522DFF }
  , { "silver", 0xC0C0C0FF }
  , { "skyblue", 0x87CEEBFF }
  , { "slateblue", 0x6A5ACDFF }
  , { "slategray", 0x708090FF }
  , { "slategrey", 0x708090FF }
  , { "snow", 0xFFFAFAFF }
  , { "springgreen", 0x00FF7FFF }
  , { "steelblue", 0x4682B4FF }
  , { "tan", 0xD2B48CFF }
  , { "teal", 0x008080FF }
  , { "thistle", 0xD8BFD8FF }
  , { "tomato", 0xFF6347FF }
  , { "turquoise", 0x40E0D0FF }
  , { "violet", 0xEE82EEFF }
  , { "wheat", 0xF5DEB3FF }
  , { "white", 0xFFFFFFFF }
  , { "whitesmoke", 0xF5F5F5FF }
  , { "yellow", 0xFFFF00FF }
  , { "yellowgreen", 0x9ACD32FF }
  , { NULL, 0 }
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
rgba_to_string(rgba_t rgba, char *buf, size_t len) {
  if (1 == rgba.a) {
    snprintf(buf, len, "#%.2x%.2x%.2x"
      , (int) (rgba.r * 255)
      , (int) (rgba.g * 255)
      , (int) (rgba.b * 255));
  } else {
    snprintf(buf, len, "rgba(%d, %d, %d, %.2f)"
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
