
//
// init.cc
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

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
}

NODE_MODULE(canvas,init);