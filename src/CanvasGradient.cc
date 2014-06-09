
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
  NanScope();

  // Constructor
  Local<FunctionTemplate> ctor = NanNew<FunctionTemplate>(Gradient::New);
  NanAssignPersistent(constructor, ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(NanNew("CanvasGradient"));

  // Prototype
  NODE_SET_PROTOTYPE_METHOD(ctor, "addColorStop", AddColorStop);
  target->Set(NanNew("CanvasGradient"), ctor->GetFunction());
}

/*
 * Initialize a new CanvasGradient.
 */

NAN_METHOD(Gradient::New) {
  NanScope();

  // Linear
  if (4 == args.Length()) {
    Gradient *grad = new Gradient(
        args[0]->NumberValue()
      , args[1]->NumberValue()
      , args[2]->NumberValue()
      , args[3]->NumberValue());
    grad->Wrap(args.This());
    NanReturnValue(args.This());
  }

  // Radial
  if (6 == args.Length()) {
    Gradient *grad = new Gradient(
        args[0]->NumberValue()
      , args[1]->NumberValue()
      , args[2]->NumberValue()
      , args[3]->NumberValue()
      , args[4]->NumberValue()
      , args[5]->NumberValue());
    grad->Wrap(args.This());
    NanReturnValue(args.This());
  }

  return NanThrowTypeError("invalid arguments");
}

/*
 * Add color stop.
 */

NAN_METHOD(Gradient::AddColorStop) {
  NanScope();
  if (!args[0]->IsNumber())
    return NanThrowTypeError("offset required");
  if (!args[1]->IsString())
    return NanThrowTypeError("color string required");

  Gradient *grad = ObjectWrap::Unwrap<Gradient>(args.This());
  short ok;
  String::Utf8Value str(args[1]);
  uint32_t rgba = rgba_from_string(*str, &ok);

  if (ok) {
    rgba_t color = rgba_create(rgba);
    cairo_pattern_add_color_stop_rgba(
        grad->pattern()
      , args[0]->NumberValue()
      , color.r
      , color.g
      , color.b
      , color.a);
  } else {
    return NanThrowTypeError("parse color failed");
  }

  NanReturnUndefined();
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
