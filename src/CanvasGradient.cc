
//
// Gradient.cc
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#include "color.h"
#include "Canvas.h"
#include "CanvasGradient.h"

Nan::Persistent<FunctionTemplate> Gradient::constructor;

/*
 * Initialize CanvasGradient.
 */

void
Gradient::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // Constructor
  Local<FunctionTemplate> ctor = Nan::New<FunctionTemplate>(Gradient::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("CanvasGradient").ToLocalChecked());

  // Prototype
  Nan::SetPrototypeMethod(ctor, "addColorStop", AddColorStop);
  Nan::Set(target, Nan::New("CanvasGradient").ToLocalChecked(), ctor->GetFunction());
}

/*
 * Initialize a new CanvasGradient.
 */

NAN_METHOD(Gradient::New) {
  if (!info.IsConstructCall()) {
    return Nan::ThrowTypeError("Class constructors cannot be invoked without 'new'");
  }

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

  return Nan::ThrowTypeError("invalid arguments");
}

/*
 * Add color stop.
 */

NAN_METHOD(Gradient::AddColorStop) {
  if (!info[0]->IsNumber())
    return Nan::ThrowTypeError("offset required");
  if (!info[1]->IsString())
    return Nan::ThrowTypeError("color string required");

  Gradient *grad = Nan::ObjectWrap::Unwrap<Gradient>(info.This());
  short ok;
  String::Utf8Value str(info[1]);
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
    return Nan::ThrowTypeError("parse color failed");
  }
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
