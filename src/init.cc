
//
// init.cc
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#include <stdio.h>
#include "Canvas.h"
#include "Image.h"
#include "ImageData.h"
#include "PixelArray.h"
#include "CanvasGradient.h"
#include "CanvasPattern.h"
#include "CanvasRenderingContext2d.h"

#ifdef HAVE_FREETYPE
#include "FontFace.h"
#endif

extern "C" void
init (Handle<Object> target) {
  HandleScope scope;
  Canvas::Initialize(target);
  Image::Initialize(target);
  ImageData::Initialize(target);
  PixelArray::Initialize(target);
  Context2d::Initialize(target);
  Gradient::Initialize(target);
  Pattern::Initialize(target);
#ifdef HAVE_FREETYPE
  FontFace::Initialize(target);
#endif

  target->Set(String::New("cairoVersion"), String::New(cairo_version_string()));
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
  target->Set(String::New("jpegVersion"), String::New(jpeg_version));
#endif

#ifdef HAVE_GIF
#ifndef GIF_LIB_VERSION
  char gif_version[10];
  snprintf(gif_version, 10, "%d.%d.%d", GIFLIB_MAJOR, GIFLIB_MINOR, GIFLIB_RELEASE);
  target->Set(String::New("gifVersion"), String::New(gif_version));
#else
  target->Set(String::New("gifVersion"), String::New(GIF_LIB_VERSION));
#endif
#endif
}

NODE_MODULE(canvas,init);
