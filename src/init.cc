// Copyright (c) 2010 LearnBoost <tj@learnboost.com>

#include <cstdio>

#include <cairo.h>
#include <jpeglib.h>
#include <gif_lib.h>

#include "Canvas.h"
#include "CanvasGradient.h"
#include "CanvasPattern.h"
#include "CanvasRenderingContext2d.h"
#include "Image.h"
#include "ImageData.h"
#include "InstanceData.h"

/*
 * Save some external modules as private references.
 */

static void
setDOMMatrix(const Napi::CallbackInfo& info) {
  InstanceData* data = info.Env().GetInstanceData<InstanceData>();
  data->DOMMatrixCtor = Napi::Persistent(info[0].As<Napi::Function>());
}

static void
setParseFont(const Napi::CallbackInfo& info) {
  InstanceData* data = info.Env().GetInstanceData<InstanceData>();
  data->parseFont = Napi::Persistent(info[0].As<Napi::Function>());
}

Napi::Object init(Napi::Env env, Napi::Object exports) {
  env.SetInstanceData(new InstanceData());

  Canvas::Initialize(env, exports);
  Image::Initialize(env, exports);
  ImageData::Initialize(env, exports);
  Context2d::Initialize(env, exports);
  Gradient::Initialize(env, exports);
  Pattern::Initialize(env, exports);

  exports.Set("setDOMMatrix", Napi::Function::New(env, &setDOMMatrix));
  exports.Set("setParseFont", Napi::Function::New(env, &setParseFont));

  exports.Set("cairoVersion", Napi::String::New(env, cairo_version_string()));

#define JPEG_LIB_VERSION_MAJOR (JPEG_LIB_VERSION / 10)
#define JPEG_LIB_VERSION_MINOR (JPEG_LIB_VERSION % 10)

  char jpeg_version[10];
  static bool minor_gt_0 = JPEG_LIB_VERSION_MINOR > 0;
  if (minor_gt_0) {
    snprintf(jpeg_version, 10, "%d%c", JPEG_LIB_VERSION_MAJOR, JPEG_LIB_VERSION_MINOR + 'a' - 1);
  } else {
    snprintf(jpeg_version, 10, "%d", JPEG_LIB_VERSION_MAJOR);
  }
  exports.Set("jpegVersion", Napi::String::New(env, jpeg_version));

  char gif_version[10];
  snprintf(gif_version, 10, "%d.%d.%d", GIFLIB_MAJOR, GIFLIB_MINOR, GIFLIB_RELEASE);
  exports.Set("gifVersion", Napi::String::New(env, gif_version));

  return exports;
}

NODE_API_MODULE(canvas, init);
