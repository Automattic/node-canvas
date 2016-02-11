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
  #ifdef __APPLE__
  CFURLRef filepathUrl = CFURLCreateFromFileSystemRepresentation(NULL, filepath, strlen((char*)filepath), false);
  return CTFontManagerRegisterFontsForURL(filepathUrl, kCTFontManagerScopeProcess, NULL);
  #elif defined(_WIN32)
  return AddFontResourceEx((LPCSTR)filepath, FR_PRIVATE, 0) != 0;
  #else
  return FcConfigAppFontAddFile(FcConfigGetCurrent(), (FcChar8 *)(filepath));
  #endif
}

