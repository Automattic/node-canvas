
//
// node-canvas.cc
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#include "canvas.h"
#include "context2d.h"

extern "C" void
init (Handle<Object> target) {
  HandleScope scope;
  Canvas::Initialize(target);
  Context2d::Initialize(target);
}