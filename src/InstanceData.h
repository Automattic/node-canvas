#pragma once

#include <napi.h>
#include <cstdint>
#include <random>
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

// Per-class type tags; applied on construction and checked before napi_unwrap.
struct TypeTags {
  napi_type_tag Canvas;
  napi_type_tag Context2d;
  napi_type_tag Image;
  napi_type_tag ImageData;
  napi_type_tag Gradient;
  napi_type_tag Pattern;
  napi_type_tag FontFace;
  napi_type_tag FontFaceSet;

  TypeTags() {
    std::random_device rd;
    for (napi_type_tag* tag : {&Canvas, &Context2d, &Image, &ImageData,
                               &Gradient, &Pattern, &FontFace, &FontFaceSet}) {
      tag->lower = (static_cast<uint64_t>(rd()) << 32) | rd();
      tag->upper = (static_cast<uint64_t>(rd()) << 32) | rd();
    }
  }
};

struct InstanceData {
  TypeTags tags;
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
