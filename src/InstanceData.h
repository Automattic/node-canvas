#pragma once

#include <napi.h>
#include <freetype/freetype.h>
#include "FontFaceSet.h"
#ifdef _WIN32
#include "FontManagerWindows.h"
using PlatformFontManager = FontManagerWindows;
#elif __APPLE__
#include "FontManagerMacos.h"
using PlatformFontManager = FontManagerMacos;
#else
// Linux, the BSDs, and other Unixes that use FontConfig.
#include "FontManagerLinux.h"
using PlatformFontManager = FontManagerLinux;
#endif

struct FT_Wrapper {
  FT_Library ft;
  FT_Wrapper() {
    FT_Init_FreeType(&ft);
  }
  ~FT_Wrapper() {
    FT_Done_FreeType(ft);
  }
};

struct InstanceData {
  Napi::FunctionReference CanvasCtor;
  Napi::FunctionReference CanvasGradientCtor;
  Napi::FunctionReference DOMMatrixCtor;
  Napi::FunctionReference ImageCtor;
  Napi::FunctionReference parseFont;
  Napi::FunctionReference Context2dCtor;
  Napi::FunctionReference ImageDataCtor;
  Napi::FunctionReference CanvasPatternCtor;
  Napi::FunctionReference FontFaceCtor;
  Napi::ObjectReference jsFontSet;
  FontFaceSet* cppFontSet;
  // FT_Wrapper exists because, and it is located here so that, FT_Done_FreeType
  // is called after ~PlatformFontManager. FT_Faces are all freed in
  // FT_Done_FreeType. That can't happen before their backing buffers are freed.
  FT_Wrapper _ft;
  inline FT_Library ft() { return _ft.ft; }
  PlatformFontManager fontManager;
};
