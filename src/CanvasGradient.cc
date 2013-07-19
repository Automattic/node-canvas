
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
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

  // Constructor
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  constructor = Persistent<FunctionTemplate>::New(FunctionTemplate::New(Gradient::New));
  constructor->InstanceTemplate()->SetInternalFieldCount(1);
  constructor->SetClassName(String::NewSymbol("CanvasGradient"));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Local<FunctionTemplate> lconstructor = Local<FunctionTemplate>::New(isolate, FunctionTemplate::New(Gradient::New));
  lconstructor->InstanceTemplate()->SetInternalFieldCount(1);
  lconstructor->SetClassName(String::NewSymbol("CanvasGradient"));

#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

  // Prototype
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  NODE_SET_PROTOTYPE_METHOD(constructor, "addColorStop", AddColorStop);
  target->Set(String::NewSymbol("CanvasGradient"), constructor->GetFunction());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "addColorStop", AddColorStop);

  constructor.Reset(isolate, lconstructor);

  target->Set(String::NewSymbol("CanvasGradient"), lconstructor->GetFunction());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Initialize a new CanvasGradient.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Gradient::New(const Arguments &args) {
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Gradient::New(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

  // Linear
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  if (4 == args.Length()) {
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  if (4 == info.Length()) {
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    Gradient *grad = new Gradient(
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
        args[0]->NumberValue()
      , args[1]->NumberValue()
      , args[2]->NumberValue()
      , args[3]->NumberValue());
    grad->Wrap(args.This());
    return args.This();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
        info[0]->NumberValue()
      , info[1]->NumberValue()
      , info[2]->NumberValue()
      , info[3]->NumberValue());
    grad->Wrap(info.This());
    info.GetReturnValue().Set(info.This());
    return;
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  }

  // Radial
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  if (6 == args.Length()) {
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  if (6 == info.Length()) {
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    Gradient *grad = new Gradient(
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
        args[0]->NumberValue()
      , args[1]->NumberValue()
      , args[2]->NumberValue()
      , args[3]->NumberValue()
      , args[4]->NumberValue()
      , args[5]->NumberValue());
    grad->Wrap(args.This());
    return args.This();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
        info[0]->NumberValue()
      , info[1]->NumberValue()
      , info[2]->NumberValue()
      , info[3]->NumberValue()
      , info[4]->NumberValue()
      , info[5]->NumberValue());
    grad->Wrap(info.This());
    info.GetReturnValue().Set(info.This());
    return;
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  }
  
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return ThrowException(Exception::TypeError(String::New("invalid arguments")));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().Set(ThrowException(Exception::TypeError(String::New("invalid arguments"))));
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Add color stop.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Gradient::AddColorStop(const Arguments &args) {
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Gradient::AddColorStop(const v8::FunctionCallbackInfo<T> &info) {
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  HandleScope scope;
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  if (!args[0]->IsNumber())
    return ThrowException(Exception::TypeError(String::New("offset required")));
  if (!args[1]->IsString())
    return ThrowException(Exception::TypeError(String::New("color string required")));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  if (!info[0]->IsNumber()) {
    info.GetReturnValue().Set(ThrowException(Exception::TypeError(String::New("offset required"))));
    return;
  }

  if (!info[1]->IsString()) {
    info.GetReturnValue().Set(ThrowException(Exception::TypeError(String::New("color string required"))));
    return;
  }
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  Gradient *grad = ObjectWrap::Unwrap<Gradient>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Gradient *grad = ObjectWrap::Unwrap<Gradient>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  short ok;
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  String::AsciiValue str(args[1]);
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  String::AsciiValue str(info[1]);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  uint32_t rgba = rgba_from_string(*str, &ok);

  if (ok) {
    rgba_t color = rgba_create(rgba);
    cairo_pattern_add_color_stop_rgba(
        grad->pattern()
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
      , args[0]->NumberValue()
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
      , info[0]->NumberValue()
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
      , color.r
      , color.g
      , color.b
      , color.a);
  } else {
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    return ThrowException(Exception::TypeError(String::New("parse color failed")));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    info.GetReturnValue().Set(ThrowException(Exception::TypeError(String::New("parse color failed"))));
    return;
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  }

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
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
