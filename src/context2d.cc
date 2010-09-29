
//
// context2d.cc
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#include "canvas.h"
#include "context2d.h"
#include <math.h>

using namespace v8;
using namespace node;

/*
 * Rectangle arg assertions.
 */

#define RECT_ARGS \
  if (!args[0]->IsNumber()) \
    return ThrowException(Exception::TypeError(String::New("x required"))); \
  if (!args[1]->IsNumber()) \
    return ThrowException(Exception::TypeError(String::New("y required"))); \
  if (!args[2]->IsNumber()) \
    return ThrowException(Exception::TypeError(String::New("width required"))); \
  if (!args[3]->IsNumber()) \
    return ThrowException(Exception::TypeError(String::New("height required"))); \
  int x = args[0]->Int32Value(); \
  int y = args[1]->Int32Value(); \
  int width = args[2]->Int32Value(); \
  int height = args[3]->Int32Value();

/*
 * RGBA arg assertions.
 */

#define RGBA_ARGS \
  if (!args[0]->IsNumber()) \
    return ThrowException(Exception::TypeError(String::New("r required"))); \
  if (!args[1]->IsNumber()) \
    return ThrowException(Exception::TypeError(String::New("g required"))); \
  if (!args[2]->IsNumber()) \
    return ThrowException(Exception::TypeError(String::New("b required"))); \
  if (!args[3]->IsNumber()) \
    return ThrowException(Exception::TypeError(String::New("alpha required"))); \
  int r = args[0]->Int32Value(); \
  int g = args[1]->Int32Value(); \
  int b = args[2]->Int32Value(); \
  int a = args[3]->NumberValue();

/*
 * Initialize Context2d.
 */

void
Context2d::Initialize(Handle<Object> target) {
  HandleScope scope;
  // Constructor
  Local<FunctionTemplate> t = FunctionTemplate::New(Context2d::New);
  t->InstanceTemplate()->SetInternalFieldCount(1);
  t->SetClassName(String::NewSymbol("Context2d"));

  // Prototype
  NODE_SET_PROTOTYPE_METHOD(t, "fill", Fill);
  NODE_SET_PROTOTYPE_METHOD(t, "stroke", Stroke);
  NODE_SET_PROTOTYPE_METHOD(t, "fillRect", FillRect);
  NODE_SET_PROTOTYPE_METHOD(t, "strokeRect", StrokeRect);
  NODE_SET_PROTOTYPE_METHOD(t, "clearRect", ClearRect);
  NODE_SET_PROTOTYPE_METHOD(t, "moveTo", MoveTo);
  NODE_SET_PROTOTYPE_METHOD(t, "lineTo", LineTo);
  NODE_SET_PROTOTYPE_METHOD(t, "bezierCurveTo", BezierCurveTo);
  NODE_SET_PROTOTYPE_METHOD(t, "beginPath", BeginPath);
  NODE_SET_PROTOTYPE_METHOD(t, "closePath", ClosePath);
  NODE_SET_PROTOTYPE_METHOD(t, "arc", Arc);
  NODE_SET_PROTOTYPE_METHOD(t, "setFillRGBA", SetFillRGBA);
  target->Set(String::NewSymbol("Context2d"), t->GetFunction());
}

/*
 * Initialize a new Context2d with the given canvas.
 */

Handle<Value>
Context2d::New(const Arguments &args) {
  HandleScope scope;
  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(args[0]->ToObject());
  Context2d *context = new Context2d(canvas);
  context->Wrap(args.This());
  return args.This();
}

/*
 * Create a cairo context.
 */

Context2d::Context2d(Canvas *canvas): ObjectWrap() {
  _canvas = canvas;
  _context = cairo_create(canvas->getSurface());
  cairo_set_source_rgba(_context, 0, 0, 0, 1);
}

/*
 * Destroy cairo context.
 */

Context2d::~Context2d() {
  cairo_destroy(_context);
}

/*
 * Set fill RGBA, use internally for fillStyle=
 */

Handle<Value>
Context2d::SetFillRGBA(const Arguments &args) {
  HandleScope scope;
  RGBA_ARGS;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());

  cairo_set_source_rgba(context->getContext(), r, g, b, a);
  
  return Undefined();
}

/*
 * Bezier curve.
 */

Handle<Value>
Context2d::BezierCurveTo(const Arguments &args) {
  HandleScope scope;

  if (!args[0]->IsNumber()) 
    return ThrowException(Exception::TypeError(String::New("cp1x required")));
  if (!args[1]->IsNumber()) 
    return ThrowException(Exception::TypeError(String::New("cp1y required")));
  if (!args[2]->IsNumber()) 
    return ThrowException(Exception::TypeError(String::New("cp2x required")));
  if (!args[3]->IsNumber()) 
    return ThrowException(Exception::TypeError(String::New("cp2y required")));
  if (!args[4]->IsNumber()) 
    return ThrowException(Exception::TypeError(String::New("x required")));
  if (!args[5]->IsNumber()) 
    return ThrowException(Exception::TypeError(String::New("y required")));

  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_curve_to(context->getContext()
    , args[0]->NumberValue()
    , args[1]->NumberValue()
    , args[2]->NumberValue()
    , args[3]->NumberValue()
    , args[4]->NumberValue()
    , args[5]->NumberValue());

  return Undefined();
}

/*
 * Creates a new subpath.
 */

Handle<Value>
Context2d::BeginPath(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_new_path(context->getContext());
  return Undefined();
}

/*
 * Marks the subpath as closed.
 */

Handle<Value>
Context2d::ClosePath(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_close_path(context->getContext());
  return Undefined();
}

/*
 * Fill the shape.
 */

Handle<Value>
Context2d::Fill(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_fill(context->getContext());
  return Undefined();
}

/*
 * Stroke the shape.
 */

Handle<Value>
Context2d::Stroke(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_stroke(context->getContext());
  return Undefined();
}

/*
 * Adds a point to the current subpath.
 */

Handle<Value>
Context2d::LineTo(const Arguments &args) {
  HandleScope scope;

  if (!args[0]->IsNumber()) 
    return ThrowException(Exception::TypeError(String::New("x required")));
  if (!args[1]->IsNumber()) 
    return ThrowException(Exception::TypeError(String::New("y required")));

  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_line_to(context->getContext()
    , args[0]->Int32Value()
    , args[1]->Int32Value());

  return Undefined();
}

/*
 * Creates a new subpath at the given point.
 */

Handle<Value>
Context2d::MoveTo(const Arguments &args) {
  HandleScope scope;

  if (!args[0]->IsNumber()) 
    return ThrowException(Exception::TypeError(String::New("x required")));
  if (!args[1]->IsNumber()) 
    return ThrowException(Exception::TypeError(String::New("y required")));

  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_move_to(context->getContext()
    , args[0]->Int32Value()
    , args[1]->Int32Value());

  return Undefined();
}

/*
 * Fill the rectangle defined by x, y, with and height.
 */

Handle<Value>
Context2d::FillRect(const Arguments &args) {
  HandleScope scope;
  RECT_ARGS;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_t *ctx = context->getContext();
  cairo_rectangle(ctx, x, y, width, height);
  cairo_fill(ctx);
  return Undefined();
}

/*
 * Stroke the rectangle defined by x, y, width and height.
 */

Handle<Value>
Context2d::StrokeRect(const Arguments &args) {
  HandleScope scope;
  RECT_ARGS;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_t *ctx = context->getContext();
  cairo_rectangle(ctx, x, y, width, height);
  cairo_stroke(ctx);
  return Undefined();
}

/*
 * Clears all pixels defined by x, y, width and height.
 */

Handle<Value>
Context2d::ClearRect(const Arguments &args) {
  HandleScope scope;
  RECT_ARGS;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_t *ctx = context->getContext();
  cairo_set_operator(ctx, CAIRO_OPERATOR_CLEAR);
  cairo_rectangle(ctx, x, y, width, height);
  cairo_fill(ctx);
  cairo_set_operator(ctx, CAIRO_OPERATOR_OVER);
  return Undefined();
}

/*
 * Adds an arc at x, y with the given radis and start/end angles.
 */

Handle<Value>
Context2d::Arc(const Arguments &args) {
  HandleScope scope;

  if (!args[0]->IsNumber()) 
    return ThrowException(Exception::TypeError(String::New("x required")));
  if (!args[1]->IsNumber()) 
    return ThrowException(Exception::TypeError(String::New("y required")));
  if (!args[2]->IsNumber()) 
    return ThrowException(Exception::TypeError(String::New("radius required")));
  if (!args[3]->IsNumber()) 
    return ThrowException(Exception::TypeError(String::New("startAngle required")));
  if (!args[4]->IsNumber()) 
    return ThrowException(Exception::TypeError(String::New("endAngle required")));

  bool anticlockwise = args[5]->BooleanValue();

  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_t *ctx = context->getContext();

  if (anticlockwise && M_PI * 2 != args[4]->NumberValue()) {
    cairo_arc_negative(ctx
      , args[0]->NumberValue()
      , args[1]->NumberValue()
      , args[2]->NumberValue()
      , args[3]->NumberValue()
      , args[4]->NumberValue());
  } else {
    cairo_arc(ctx
      , args[0]->NumberValue()
      , args[1]->NumberValue()
      , args[2]->NumberValue()
      , args[3]->NumberValue()
      , args[4]->NumberValue());
  }

  return Undefined();
}
