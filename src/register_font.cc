#include "register_font.h"

#include <string>
#include <pango/pangocairo.h>
#include <pango/pango-fontmap.h>
#include <pango/pango.h>

#ifdef __APPLE__
#include <CoreText/CoreText.h>
#elif defined(_WIN32)
#include <windows.h>
#include <memory>
#else
#include <fontconfig/fontconfig.h>
#include <pango/pangofc-fontmap.h>
#endif

#include <ft2build.h>
#include FT_FREETYPE_H
#include FT_TRUETYPE_TABLES_H
#include FT_SFNT_NAMES_H
#include FT_TRUETYPE_IDS_H
#ifndef FT_SFNT_OS2
#define FT_SFNT_OS2 ft_sfnt_os2
#endif

// OSX seems to read the strings in MacRoman encoding and ignore Unicode entries.
// You can verify this by opening a TTF with both Unicode and Macroman on OSX.
// It uses the MacRoman name, while Fontconfig and Windows use Unicode
#ifdef __APPLE__
#define PREFERRED_PLATFORM_ID TT_PLATFORM_MACINTOSH
#define PREFERRED_ENCODING_ID TT_MAC_ID_ROMAN
#else
#define PREFERRED_PLATFORM_ID TT_PLATFORM_MICROSOFT
#define PREFERRED_ENCODING_ID TT_MS_ID_UNICODE_CS
#endif

// With PangoFcFontMaps (the pango font module on Linux) we're able to add a
// hook that lets us get perfect matching. Tie the conditions for enabling that
// feature to one variable
#if !defined(__APPLE__) && !defined(_WIN32) && PANGO_VERSION_CHECK(1, 47, 0)
#define PERFECT_MATCHES_ENABLED
#endif

#define IS_PREFERRED_ENC(X) \
  X.platform_id == PREFERRED_PLATFORM_ID && X.encoding_id == PREFERRED_ENCODING_ID

#ifdef PERFECT_MATCHES_ENABLED
// On Linux-like OSes using FontConfig, the PostScript name ranks higher than
// preferred family and family name since we'll use it to get perfect font
// matching (see fc_font_map_substitute_hook)
#define GET_NAME_RANK(X) \
  ((IS_PREFERRED_ENC(X) ? 1 : 0) << 2) | \
  ((X.name_id == TT_NAME_ID_PS_NAME ? 1 : 0) << 1) | \
  (X.name_id == TT_NAME_ID_PREFERRED_FAMILY ? 1 : 0)
#else
#define GET_NAME_RANK(X) \
  ((IS_PREFERRED_ENC(X) ? 1 : 0) << 1) | \
  (X.name_id == TT_NAME_ID_PREFERRED_FAMILY ? 1 : 0)
#endif

/*
 * Return a UTF-8 encoded string given a TrueType name buf+len
 * and its platform and encoding
 */

char *
to_utf8(FT_Byte* buf, FT_UInt len, FT_UShort pid, FT_UShort eid) {
  size_t ret_len = len * 4; // max chars in a utf8 string
  char *ret = (char*)malloc(ret_len + 1); // utf8 string + null

  if (!ret) return NULL;

  // In my testing of hundreds of fonts from the Google Font repo, the two types
  // of fonts are TT_PLATFORM_MICROSOFT with TT_MS_ID_UNICODE_CS encoding, or
  // TT_PLATFORM_MACINTOSH with TT_MAC_ID_ROMAN encoding. Usually both, never neither

  char const *fromcode;

  if (pid == TT_PLATFORM_MACINTOSH && eid == TT_MAC_ID_ROMAN) {
    fromcode = "MAC";
  } else if (pid == TT_PLATFORM_MICROSOFT && eid == TT_MS_ID_UNICODE_CS) {
    fromcode = "UTF-16BE";
  } else {
    free(ret);
    return NULL;
  }

  GIConv cd = g_iconv_open("UTF-8", fromcode);

  if (cd == (GIConv)-1) {
    free(ret);
    return NULL;
  }

  size_t inbytesleft = len;
  size_t outbytesleft = ret_len;

  size_t n_converted = g_iconv(cd, (char**)&buf, &inbytesleft, &ret, &outbytesleft);

  ret -= ret_len - outbytesleft; // rewind the pointers to their
  buf -= len - inbytesleft;      // original starting positions

  if (n_converted == (size_t)-1) {
    free(ret);
    return NULL;
  } else {
    ret[ret_len - outbytesleft] = '\0';
    return ret;
  }
}

/*
 * Find a family name in the face's name table, preferring the one the
 * system, fall back to the other
 */

char *
get_family_name(FT_Face face) {
  FT_SfntName name;

  int best_rank = -1;
  char* best_buf = NULL;

  for (unsigned i = 0; i < FT_Get_Sfnt_Name_Count(face); ++i) {
    FT_Get_Sfnt_Name(face, i, &name);

    if (
      name.name_id == TT_NAME_ID_FONT_FAMILY ||
#ifdef PERFECT_MATCHES_ENABLED
      name.name_id == TT_NAME_ID_PS_NAME ||
#endif
      name.name_id == TT_NAME_ID_PREFERRED_FAMILY
    ) {
      int rank = GET_NAME_RANK(name);

      if (rank > best_rank) {
        char *buf = to_utf8(name.string, name.string_len, name.platform_id, name.encoding_id);
        if (buf) {
          best_rank = rank;
          if (best_buf) free(best_buf);
          best_buf = buf;

#ifdef PERFECT_MATCHES_ENABLED
          // Prepend an '@' to the postscript name
          if (name.name_id == TT_NAME_ID_PS_NAME) {
            std::string best_buf_modified = "@";
            best_buf_modified += best_buf;
            free(best_buf);
            best_buf = strdup(best_buf_modified.c_str());
          }
#endif
        } else {
          free(buf);
        }
      }
    }
  }

  return best_buf;
}

PangoWeight
get_pango_weight(FT_UShort weight) {
  switch (weight) {
    case 100: return PANGO_WEIGHT_THIN;
    case 200: return PANGO_WEIGHT_ULTRALIGHT;
    case 300: return PANGO_WEIGHT_LIGHT;
    #if PANGO_VERSION >= PANGO_VERSION_ENCODE(1, 36, 7)
    case 350: return PANGO_WEIGHT_SEMILIGHT;
    #endif
    case 380: return PANGO_WEIGHT_BOOK;
    case 400: return PANGO_WEIGHT_NORMAL;
    case 500: return PANGO_WEIGHT_MEDIUM;
    case 600: return PANGO_WEIGHT_SEMIBOLD;
    case 700: return PANGO_WEIGHT_BOLD;
    case 800: return PANGO_WEIGHT_ULTRABOLD;
    case 900: return PANGO_WEIGHT_HEAVY;
    case 1000: return PANGO_WEIGHT_ULTRAHEAVY;
    default: return PANGO_WEIGHT_NORMAL;
  }
}

PangoStretch
get_pango_stretch(FT_UShort width) {
  switch (width) {
    case 1: return PANGO_STRETCH_ULTRA_CONDENSED;
    case 2: return PANGO_STRETCH_EXTRA_CONDENSED;
    case 3: return PANGO_STRETCH_CONDENSED;
    case 4: return PANGO_STRETCH_SEMI_CONDENSED;
    case 5: return PANGO_STRETCH_NORMAL;
    case 6: return PANGO_STRETCH_SEMI_EXPANDED;
    case 7: return PANGO_STRETCH_EXPANDED;
    case 8: return PANGO_STRETCH_EXTRA_EXPANDED;
    case 9: return PANGO_STRETCH_ULTRA_EXPANDED;
    default: return PANGO_STRETCH_NORMAL;
  }
}

PangoStyle
get_pango_style(FT_Long flags) {
  if (flags & FT_STYLE_FLAG_ITALIC) {
    return PANGO_STYLE_ITALIC;
  } else {
    return PANGO_STYLE_NORMAL;
  }
}

#ifdef _WIN32
std::unique_ptr<wchar_t[]>
u8ToWide(const char* str) {
  int iBufferSize = MultiByteToWideChar(CP_UTF8, 0, str, -1, (wchar_t*)NULL, 0);
  if(!iBufferSize){
    return nullptr;
  }
  std::unique_ptr<wchar_t[]> wpBufWString = std::unique_ptr<wchar_t[]>{ new wchar_t[static_cast<size_t>(iBufferSize)] };
  if(!MultiByteToWideChar(CP_UTF8, 0, str, -1, wpBufWString.get(), iBufferSize)){
    return nullptr;
  }
  return wpBufWString;
}

static unsigned long 
stream_read_func(FT_Stream stream, unsigned long offset, unsigned char* buffer, unsigned long count){
  HANDLE hFile = reinterpret_cast<HANDLE>(stream->descriptor.pointer);
  DWORD numberOfBytesRead;
  OVERLAPPED overlapped;
  overlapped.Offset = offset;
  overlapped.OffsetHigh = 0;
  overlapped.hEvent = NULL;
  if(!ReadFile(hFile, buffer, count, &numberOfBytesRead, &overlapped)){
    return 0;
  }
  return numberOfBytesRead;
};

static void 
stream_close_func(FT_Stream stream){
  HANDLE hFile = reinterpret_cast<HANDLE>(stream->descriptor.pointer);
  CloseHandle(hFile);
}
#endif

/*
 * Return a PangoFontDescription that will resolve to the font file
 */

PangoFontDescription *
get_pango_font_description(unsigned char* filepath) {
  FT_Library library;
  FT_Face face;
  PangoFontDescription *desc = pango_font_description_new();
#ifdef _WIN32
  // FT_New_Face use fopen. 
  // Unable to find the file when supplied the multibyte string path on the Windows platform and throw error "Could not parse font file".
  // This workaround fixes this by reading the font file uses win32 wide character API.
  std::unique_ptr<wchar_t[]> wFilepath = u8ToWide((char*)filepath);
  if(!wFilepath){
    return NULL;
  }
  HANDLE hFile = CreateFileW(
        wFilepath.get(),
        GENERIC_READ,
        FILE_SHARE_READ,
        NULL,
        OPEN_EXISTING,
        FILE_ATTRIBUTE_NORMAL,
        NULL
  );
  if(!hFile){
    return NULL;
  }
  LARGE_INTEGER liSize;
  if(!GetFileSizeEx(hFile, &liSize)) {
    CloseHandle(hFile);
    return NULL;
  }
  FT_Open_Args args;
  args.flags = FT_OPEN_STREAM;
  FT_StreamRec stream;
  stream.base = NULL;
  stream.size = liSize.QuadPart;
  stream.pos = 0;
  stream.descriptor.pointer = hFile;
  stream.read = stream_read_func;
  stream.close = stream_close_func;
  args.stream = &stream;
  if (
    !FT_Init_FreeType(&library) && 
    !FT_Open_Face(library, &args, 0, &face)) {
#else
  if (!FT_Init_FreeType(&library) && !FT_New_Face(library, (const char*)filepath, 0, &face)) {
#endif
    TT_OS2 *table = (TT_OS2*)FT_Get_Sfnt_Table(face, FT_SFNT_OS2);
    if (table) {
      char *family = get_family_name(face);

      if (!family) {
        pango_font_description_free(desc);
        FT_Done_Face(face);
        FT_Done_FreeType(library);

        return NULL;
      }

      pango_font_description_set_family_static(desc, family);
      pango_font_description_set_weight(desc, get_pango_weight(table->usWeightClass));
      pango_font_description_set_stretch(desc, get_pango_stretch(table->usWidthClass));
      pango_font_description_set_style(desc, get_pango_style(face->style_flags));

      FT_Done_Face(face);
      FT_Done_FreeType(library);

      return desc;
    }
  }
  pango_font_description_free(desc);

  return NULL;
}

#ifdef PERFECT_MATCHES_ENABLED
static void
fc_font_map_substitute_hook(FcPattern *pat, gpointer data) {
  FcChar8 *family;

  for (int i = 0; FcPatternGetString(pat, FC_FAMILY, i, &family) == FcResultMatch; i++) {
    if (family[0] == '@') {
      FcPatternAddString(pat, FC_POSTSCRIPT_NAME, (FcChar8 *)family + 1);
      FcPatternRemove(pat, FC_FAMILY, i);
      i -= 1;
    }
  }
}
#endif

/*
 * Register font with the OS
 */

bool
register_font(unsigned char *filepath) {
  bool success;
  
  #ifdef __APPLE__
  CFURLRef filepathUrl = CFURLCreateFromFileSystemRepresentation(NULL, filepath, strlen((char*)filepath), false);
  success = CTFontManagerRegisterFontsForURL(filepathUrl, kCTFontManagerScopeProcess, NULL);
  #elif defined(_WIN32)
  std::unique_ptr<wchar_t[]> wFilepath = u8ToWide((char*)filepath);
  if(wFilepath){
    success = AddFontResourceExW(wFilepath.get(), FR_PRIVATE, 0) != 0;
  }else{
    success = false;
  }

  #else
  success = FcConfigAppFontAddFile(FcConfigGetCurrent(), (FcChar8 *)(filepath));
  #endif

  if (!success) return false;

  // Tell Pango to throw away the current FontMap and create a new one. This
  // has the effect of registering the new font in Pango by re-looking up all
  // font families.
  pango_cairo_font_map_set_default(NULL);

#ifdef PERFECT_MATCHES_ENABLED
  PangoFontMap* map = pango_cairo_font_map_get_default();
  PangoFcFontMap* fc_map = PANGO_FC_FONT_MAP(map);
  pango_fc_font_map_set_default_substitute(fc_map, fc_font_map_substitute_hook, NULL, NULL);
#endif

  return true;
}

/*
 * Deregister font from the OS
 * Note that Linux (FontConfig) can only dereregister ALL fonts at once.
 */

bool
deregister_font(unsigned char *filepath) {
  bool success;
  
  #ifdef __APPLE__
  CFURLRef filepathUrl = CFURLCreateFromFileSystemRepresentation(NULL, filepath, strlen((char*)filepath), false);
  success = CTFontManagerUnregisterFontsForURL(filepathUrl, kCTFontManagerScopeProcess, NULL);
  #elif defined(_WIN32)
  std::unique_ptr<wchar_t[]> wFilepath = u8ToWide((char*)filepath);
  if(wFilepath){
    success = RemoveFontResourceExW(wFilepath.get(), FR_PRIVATE, 0) != 0;
  }else{
    success = false;
  }
  #else
  FcConfigAppFontClear(FcConfigGetCurrent());
  success = true;
  #endif

  if (!success) return false;

  // Tell Pango to throw away the current FontMap and create a new one. This
  // has the effect of deregistering the font in Pango by re-looking up all
  // font families.
  pango_cairo_font_map_set_default(NULL);

  return true;
}
