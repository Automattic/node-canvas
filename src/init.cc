
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
  target->Set(String::New("cairoVersion"), String::New(cairo_version_string()));
#ifdef HAVE_JPEG
  char jpeg_version[10];
  snprintf(jpeg_version, 10, "%d%c", JPEG_LIB_VERSION_MAJOR, JPEG_LIB_VERSION_MINOR + 'a' - 1);
  target->Set(String::New("jpegVersion"), String::New(jpeg_version));
#endif
#ifdef HAVE_GIF
  target->Set(String::New("gifVersion"), String::New(GIF_LIB_VERSION));
#endif
}

NODE_MODULE(canvas,init);
