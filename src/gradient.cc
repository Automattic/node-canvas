
//
// gradient.cc
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#include "canvas.h"
#include "gradient.h"

/*
 * Initialie CanvasGradient.
 */

void
Gradient::Initialize(Handle<Object> target) {
  HandleScope scope;
  Local<FunctionTemplate> t = FunctionTemplate::New(Gradient::New);
  t->InstanceTemplate()->SetInternalFieldCount(1);
  t->SetClassName(String::NewSymbol("CanvasGradient"));

  NODE_SET_PROTOTYPE_METHOD(t, "addColorStopRGBA", AddColorStopRGBA);
  target->Set(String::NewSymbol("CanvasGradient"), t->GetFunction());
}

/*
 * Initialize a new CanvasGradient.
 */

Handle<Value>
Gradient::New(const Arguments &args) {
  HandleScope scope;

  // TODO: separate concerns / validate args

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
 * Add RGBA color stop.
 */

Handle<Value>
Gradient::AddColorStopRGBA(const Arguments &args) {
  HandleScope scope;
  if (!args[0]->IsNumber()) \
    return ThrowException(Exception::TypeError(String::New("offset required"))); \
  RGBA_ARGS(1);
  Gradient *grad = ObjectWrap::Unwrap<Gradient>(args.This());
  cairo_pattern_add_color_stop_rgba(
      grad->getPattern()
    , args[0]->NumberValue()
    , r / 255 * 1
    , g / 255 * 1
    , b / 255 * 1
    , a);
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
