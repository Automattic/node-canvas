#pragma once

#include <napi.h>
#include <freetype/freetype.h>
#include "FontFaceSet.h"

#if defined(CANVAS_LINUX)
#include "FontManagerLinux.h"
#elif defined(CANVAS_MACOS)
#include "FontManagerMacos.h"
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
#if defined(CANVAS_LINUX)
  FontManagerLinux fontManager;
#elif defined(CANVAS_MACOS)
  FontManagerMacos fontManager;
#endif

  InstanceData() {
    FT_Init_FreeType(&ft);
  }

  ~InstanceData() {
    FT_Done_FreeType(ft);
  }
};
