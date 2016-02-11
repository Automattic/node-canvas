
//
// init.cc
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#include <stdio.h>
#include "Canvas.h"
#include "Image.h"
#include "ImageData.h"
#include "CanvasGradient.h"
#include "CanvasPattern.h"
#include "CanvasRenderingContext2d.h"
#include "register_font.h"

// Compatibility with Visual Studio versions prior to VS2015
#if defined(_MSC_VER) && _MSC_VER < 1900
#define snprintf _snprintf
#endif

NAN_METHOD(register_font_js) {
  if (!info[0]->IsString()) {
    return Nan::ThrowError("Wrong argument type");
  }

  String::Utf8Value filePath(info[0]);

  if (!register_font((unsigned char*) *filePath)) {
    Nan::ThrowError("Could not load font to the system's font host");
  }
}

NAN_MODULE_INIT(init) {
  Canvas::Initialize(target);
  Image::Initialize(target);
  ImageData::Initialize(target);
  Context2d::Initialize(target);
  Gradient::Initialize(target);
  Pattern::Initialize(target);

  Nan::SetMethod(target, "registerFont", register_font_js);

  target->Set(Nan::New<String>("cairoVersion").ToLocalChecked(), Nan::New<String>(cairo_version_string()).ToLocalChecked());
#ifdef HAVE_JPEG

#ifndef JPEG_LIB_VERSION_MAJOR
#ifdef JPEG_LIB_VERSION
#define JPEG_LIB_VERSION_MAJOR (JPEG_LIB_VERSION / 10)
#else
#define JPEG_LIB_VERSION_MAJOR 0
#endif
#endif

#ifndef JPEG_LIB_VERSION_MINOR
#ifdef JPEG_LIB_VERSION
#define JPEG_LIB_VERSION_MINOR (JPEG_LIB_VERSION % 10)
#else
#define JPEG_LIB_VERSION_MINOR 0
#endif
#endif

  char jpeg_version[10];
  if (JPEG_LIB_VERSION_MINOR > 0) {
    snprintf(jpeg_version, 10, "%d%c", JPEG_LIB_VERSION_MAJOR, JPEG_LIB_VERSION_MINOR + 'a' - 1);
  } else {
    snprintf(jpeg_version, 10, "%d", JPEG_LIB_VERSION_MAJOR);
  }
  target->Set(Nan::New<String>("jpegVersion").ToLocalChecked(), Nan::New<String>(jpeg_version).ToLocalChecked());
#endif

#ifdef HAVE_GIF
#ifndef GIF_LIB_VERSION
  char gif_version[10];
  snprintf(gif_version, 10, "%d.%d.%d", GIFLIB_MAJOR, GIFLIB_MINOR, GIFLIB_RELEASE);
  target->Set(Nan::New<String>("gifVersion").ToLocalChecked(), Nan::New<String>(gif_version).ToLocalChecked());
#else
  target->Set(Nan::New<String>("gifVersion").ToLocalChecked(), Nan::New<String>(GIF_LIB_VERSION).ToLocalChecked());
#endif
#endif
}

NODE_MODULE(canvas,init);
