#pragma once

#include <napi.h>
#include <freetype/freetype.h>
#include "FontFaceSet.h"
#include "FontManagerMacos.h" // TODO per-platform

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
  FontManagerMacos fontManager;

  InstanceData() {
    FT_Init_FreeType(&ft);
  }

  ~InstanceData() {
    FT_Done_FreeType(ft);
  }
};
