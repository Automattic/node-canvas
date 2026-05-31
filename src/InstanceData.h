#pragma once

#include <napi.h>
#include <freetype/freetype.h>
#include "FontFaceSet.h"
#ifdef _WIN32
#include "FontManagerWindows.h"
using PlatformFontManager = FontManagerWindows;
#else
#include "FontManagerMacos.h"
using PlatformFontManager = FontManagerMacos;
#endif

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
  FT_Library ft;
  PlatformFontManager fontManager;

  InstanceData() {
    FT_Init_FreeType(&ft);
  }

  ~InstanceData() {
    FT_Done_FreeType(ft);
  }
};
