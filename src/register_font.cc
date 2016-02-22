#include <pango/pangocairo.h>
#include <pango/pango-fontmap.h>
#include <pango/pango.h>

#ifdef __APPLE__
#include <CoreFoundation/CoreFoundation.h>
#include <CoreText/CoreText.h>
#elif defined(_WIN32)
#include <windows.h>
#else
#include <fontconfig/fontconfig.h>
#endif

bool
register_font(unsigned char *filepath) {
  bool success;
  
  #ifdef __APPLE__
  CFURLRef filepathUrl = CFURLCreateFromFileSystemRepresentation(NULL, filepath, strlen((char*)filepath), false);
  success = CTFontManagerRegisterFontsForURL(filepathUrl, kCTFontManagerScopeProcess, NULL);
  #elif defined(_WIN32)
  success = AddFontResourceEx((LPCSTR)filepath, FR_PRIVATE, 0) != 0;
  #else
  success = FcConfigAppFontAddFile(FcConfigGetCurrent(), (FcChar8 *)(filepath));
  #endif
  
  // Tell Pango to throw away the current FontMap and create a new one. This
  // has the effect of registering the new font in Pango by re-looking up all
  // font families.
  if (success) pango_cairo_font_map_set_default(NULL);
  
  return success;
}

