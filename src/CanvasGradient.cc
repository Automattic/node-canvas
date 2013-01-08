
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
  HandleScope scope;

  // Constructor
  constructor = Persistent<FunctionTemplate>::New(FunctionTemplate::New(Gradient::New));
  constructor->InstanceTemplate()->SetInternalFieldCount(1);
  constructor->SetClassName(String::NewSymbol("CanvasGradient"));

  // Prototype
  NODE_SET_PROTOTYPE_METHOD(constructor, "addColorStop", AddColorStop);
  target->Set(String::NewSymbol("CanvasGradient"), constructor->GetFunction());
}

/*
 * Initialize a new CanvasGradient.
 */

Handle<Value>
Gradient::New(const Arguments &args) {
  HandleScope scope;

  // Linear
  if (4 == args.Length()) {
    Gradient *grad = new Gradient(
        args[0]->NumberValue()
      , args[1]->NumberValue()
      , args[2]->NumberValue()
      , args[3]->NumberValue());
    grad->Wrap(args.This());
    return args.This();
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
    return args.This();
  }
  
  return ThrowException(Exception::TypeError(String::New("invalid arguments")));
}

/*
 * Add color stop.
 */

Handle<Value>
Gradient::AddColorStop(const Arguments &args) {
  HandleScope scope;
  if (!args[0]->IsNumber())
    return ThrowException(Exception::TypeError(String::New("offset required")));
  if (!args[1]->IsString())
    return ThrowException(Exception::TypeError(String::New("color string required")));

  Gradient *grad = ObjectWrap::Unwrap<Gradient>(args.This());
  short ok;
  String::AsciiValue str(args[1]);
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
    return ThrowException(Exception::TypeError(String::New("parse color failed")));
  }

  return Undefined();
}

/*
 * Initialize linear gradient.
 */

Gradient::Gradient(double x0, double y0, double x1, double y1):
  _x0(x0), _y0(y0), _x1(x1), _y1(y1) {
  _pattern = cairo_pattern_create_linear(x0, y0, x1, y1);
}

/*
 * Initialize radial gradient.
 */

Gradient::Gradient(double x0, double y0, double r0, double x1, double y1, double r1):
  _x0(x0), _y0(y0), _x1(x1), _y1(y1), _r0(r0), _r1(r1) {
  _pattern = cairo_pattern_create_radial(x0, y0, r0, x1, y1, r1);
}

/*
 * Destroy the pattern.
 */

Gradient::~Gradient() {
  cairo_pattern_destroy(_pattern);
}
