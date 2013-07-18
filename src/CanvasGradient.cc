
//
// Gradient.cc
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#include "color.h"
#include "Canvas.h"
#include "CanvasGradient.h"

Persistent<FunctionTemplate> Gradient::constructor;

/*
 * Initialize CanvasGradient.
 */

void
Gradient::Initialize(Handle<Object> target) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);

  // Constructor
  Local<FunctionTemplate> lconstructor = Local<FunctionTemplate>::New(isolate, FunctionTemplate::New(Gradient::New));
  lconstructor->InstanceTemplate()->SetInternalFieldCount(1);
  lconstructor->SetClassName(String::NewSymbol("CanvasGradient"));


  // Prototype
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "addColorStop", AddColorStop);

  constructor.Reset(isolate, lconstructor);

  target->Set(String::NewSymbol("CanvasGradient"), lconstructor->GetFunction());
}

/*
 * Initialize a new CanvasGradient.
 */

template<class T> void
Gradient::New(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);

  // Linear
  if (4 == info.Length()) {
    Gradient *grad = new Gradient(
        info[0]->NumberValue()
      , info[1]->NumberValue()
      , info[2]->NumberValue()
      , info[3]->NumberValue());
    grad->Wrap(info.This());
    info.GetReturnValue().Set(info.This());
    return;
  }

  // Radial
  if (6 == info.Length()) {
    Gradient *grad = new Gradient(
        info[0]->NumberValue()
      , info[1]->NumberValue()
      , info[2]->NumberValue()
      , info[3]->NumberValue()
      , info[4]->NumberValue()
      , info[5]->NumberValue());
    grad->Wrap(info.This());
    info.GetReturnValue().Set(info.This());
    return;
  }
  
  info.GetReturnValue().Set(ThrowException(Exception::TypeError(String::New("invalid arguments"))));
}

/*
 * Add color stop.
 */

template<class T> void
Gradient::AddColorStop(const v8::FunctionCallbackInfo<T> &info) {
  HandleScope scope;
  if (!info[0]->IsNumber()) {
    info.GetReturnValue().Set(ThrowException(Exception::TypeError(String::New("offset required"))));
    return;
  }

  if (!info[1]->IsString()) {
    info.GetReturnValue().Set(ThrowException(Exception::TypeError(String::New("color string required"))));
    return;
  }

  Gradient *grad = ObjectWrap::Unwrap<Gradient>(info.This());
  short ok;
  String::AsciiValue str(info[1]);
  uint32_t rgba = rgba_from_string(*str, &ok);

  if (ok) {
    rgba_t color = rgba_create(rgba);
    cairo_pattern_add_color_stop_rgba(
        grad->pattern()
      , info[0]->NumberValue()
      , color.r
      , color.g
      , color.b
      , color.a);
  } else {
    info.GetReturnValue().Set(ThrowException(Exception::TypeError(String::New("parse color failed"))));
    return;
  }

  info.GetReturnValue().SetUndefined();
}

/*
 * Initialize linear gradient.
 */

Gradient::Gradient(double x0, double y0, double x1, double y1) {
  _pattern = cairo_pattern_create_linear(x0, y0, x1, y1);
}

/*
 * Initialize radial gradient.
 */

Gradient::Gradient(double x0, double y0, double r0, double x1, double y1, double r1) {
  _pattern = cairo_pattern_create_radial(x0, y0, r0, x1, y1, r1);
}

/*
 * Destroy the pattern.
 */

Gradient::~Gradient() {
  cairo_pattern_destroy(_pattern);
}
