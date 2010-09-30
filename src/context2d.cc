
//
// context2d.cc
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#include "canvas.h"
#include "context2d.h"
#include <math.h>
#include <string.h>

using namespace v8;
using namespace node;

/*
 * Set RGBA.
 */

#define RGBA(_,R,G,B,A) \
  _.r = R / 255 * 1; \
  _.g = G / 255 * 1; \
  _.b = B / 255 * 1; \
  _.a = A; \

/*
 * Set source RGBA.
 */

#define SET_SOURCE_RGBA(C) \
  cairo_set_source_rgba(ctx \
    , C.r \
    , C.g \
    , C.b \
    , C.a);

/*
 * Rectangle arg assertions.
 */

#define RECT_ARGS \
  if (!args[0]->IsNumber() \
    ||!args[1]->IsNumber() \
    ||!args[2]->IsNumber() \
    ||!args[3]->IsNumber()) return Undefined(); \
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
  float r = args[0]->Int32Value(); \
  float g = args[1]->Int32Value(); \
  float b = args[2]->Int32Value(); \
  float a = args[3]->NumberValue();

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
  Local<ObjectTemplate> proto = t->PrototypeTemplate();
  NODE_SET_PROTOTYPE_METHOD(t, "save", Save);
  NODE_SET_PROTOTYPE_METHOD(t, "restore", Restore);
  NODE_SET_PROTOTYPE_METHOD(t, "rotate", Rotate);
  NODE_SET_PROTOTYPE_METHOD(t, "translate", Translate);
  NODE_SET_PROTOTYPE_METHOD(t, "transform", Transform);
  NODE_SET_PROTOTYPE_METHOD(t, "scale", Scale);
  NODE_SET_PROTOTYPE_METHOD(t, "fill", Fill);
  NODE_SET_PROTOTYPE_METHOD(t, "stroke", Stroke);
  NODE_SET_PROTOTYPE_METHOD(t, "fillRect", FillRect);
  NODE_SET_PROTOTYPE_METHOD(t, "strokeRect", StrokeRect);
  NODE_SET_PROTOTYPE_METHOD(t, "clearRect", ClearRect);
  NODE_SET_PROTOTYPE_METHOD(t, "rect", Rect);
  NODE_SET_PROTOTYPE_METHOD(t, "moveTo", MoveTo);
  NODE_SET_PROTOTYPE_METHOD(t, "lineTo", LineTo);
  NODE_SET_PROTOTYPE_METHOD(t, "bezierCurveTo", BezierCurveTo);
  NODE_SET_PROTOTYPE_METHOD(t, "beginPath", BeginPath);
  NODE_SET_PROTOTYPE_METHOD(t, "closePath", ClosePath);
  NODE_SET_PROTOTYPE_METHOD(t, "arc", Arc);
  NODE_SET_PROTOTYPE_METHOD(t, "setFillRGBA", SetFillRGBA);
  NODE_SET_PROTOTYPE_METHOD(t, "setStrokeRGBA", SetStrokeRGBA);
  proto->SetAccessor(String::NewSymbol("globalAlpha"), GetGlobalAlpha, SetGlobalAlpha);
  proto->SetAccessor(String::NewSymbol("miterLimit"), GetMiterLimit, SetMiterLimit);
  proto->SetAccessor(String::NewSymbol("lineWidth"), GetLineWidth, SetLineWidth);
  proto->SetAccessor(String::NewSymbol("lineCap"), GetLineCap, SetLineCap);
  proto->SetAccessor(String::NewSymbol("lineJoin"), GetLineJoin, SetLineJoin);
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
  cairo_set_line_width(_context, 1);
  globalAlpha = NULL;
  RGBA(fill,0,0,0,1);
  RGBA(stroke,0,0,0,1);
}

/*
 * Destroy cairo context.
 */

Context2d::~Context2d() {
  cairo_destroy(_context);
}

/*
 * Get global alpha.
 */

Handle<Value>
Context2d::GetGlobalAlpha(Local<String> prop, const AccessorInfo &info) {
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  return Number::New(context->globalAlpha);
}

/*
 * Set global alpha.
 */

void
Context2d::SetGlobalAlpha(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  context->globalAlpha = val->NumberValue();
}

/*
 * Get miter limit.
 */

Handle<Value>
Context2d::GetMiterLimit(Local<String> prop, const AccessorInfo &info) {
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  return Number::New(cairo_get_miter_limit(context->getContext()));
}

/*
 * Set miter limit.
 */

void
Context2d::SetMiterLimit(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_set_miter_limit(context->getContext(), val->NumberValue());
}

/*
 * Get line width.
 */

Handle<Value>
Context2d::GetLineWidth(Local<String> prop, const AccessorInfo &info) {
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  return Number::New(cairo_get_line_width(context->getContext()));
}

/*
 * Set line width.
 */

void
Context2d::SetLineWidth(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_set_line_width(context->getContext(), val->NumberValue());
}

/*
 * Get line join.
 */

Handle<Value>
Context2d::GetLineJoin(Local<String> prop, const AccessorInfo &info) {
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  switch (cairo_get_line_join(context->getContext())) {
    case CAIRO_LINE_JOIN_BEVEL:
      return String::NewSymbol("bevel");
    case CAIRO_LINE_JOIN_ROUND:
      return String::NewSymbol("round");
    default:
      return String::NewSymbol("miter");
  }
}

/*
 * Set line join.
 */

void
Context2d::SetLineJoin(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->getContext();
  String::AsciiValue type(val);
  if (0 == strcmp("round", *type)) {
    cairo_set_line_join(ctx, CAIRO_LINE_JOIN_ROUND);
  } else if (0 == strcmp("bevel", *type)) {
    cairo_set_line_join(ctx, CAIRO_LINE_JOIN_BEVEL);
  } else {
    cairo_set_line_join(ctx, CAIRO_LINE_JOIN_MITER);
  }
}

/*
 * Get line cap.
 */

Handle<Value>
Context2d::GetLineCap(Local<String> prop, const AccessorInfo &info) {
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  switch (cairo_get_line_cap(context->getContext())) {
    case CAIRO_LINE_CAP_ROUND:
      return String::NewSymbol("round");
    case CAIRO_LINE_CAP_SQUARE:
      return String::NewSymbol("square");
    default:
      return String::NewSymbol("butt");
  }
}

/*
 * Set line cap.
 */

void
Context2d::SetLineCap(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->getContext();
  String::AsciiValue type(val);
  if (0 == strcmp("round", *type)) {
    cairo_set_line_cap(ctx, CAIRO_LINE_CAP_ROUND);
  } else if (0 == strcmp("square", *type)) {
    cairo_set_line_cap(ctx, CAIRO_LINE_CAP_SQUARE);
  } else {
    cairo_set_line_cap(ctx, CAIRO_LINE_CAP_BUTT);
  }
}

/*
 * Set fill RGBA, used internally for fillStyle=
 */

Handle<Value>
Context2d::SetFillRGBA(const Arguments &args) {
  HandleScope scope;
  RGBA_ARGS;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  RGBA(context->fill,r,g,b,a);
  return Undefined();
}

/*
 * Set stroke RGBA, used internally for strokeStyle=
 */

Handle<Value>
Context2d::SetStrokeRGBA(const Arguments &args) {
  HandleScope scope;
  RGBA_ARGS;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  RGBA(context->stroke,r,g,b,a);
  return Undefined();
}

/*
 * Bezier curve.
 */

Handle<Value>
Context2d::BezierCurveTo(const Arguments &args) {
  HandleScope scope;

  if (!args[0]->IsNumber()
    ||!args[1]->IsNumber()
    ||!args[2]->IsNumber()
    ||!args[3]->IsNumber()
    ||!args[4]->IsNumber()
    ||!args[5]->IsNumber()) return Undefined();

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
 * Save state.
 */

Handle<Value>
Context2d::Save(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_save(context->getContext());
  return Undefined();
}

/*
 * Restore state.
 */

Handle<Value>
Context2d::Restore(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_restore(context->getContext());
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
 * Rotate transformation.
 */

Handle<Value>
Context2d::Rotate(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_rotate(context->getContext()
    , args[0]->IsNumber() ? args[0]->NumberValue() : 0);
  return Undefined();
}

/*
 * Transform.
 */

Handle<Value>
Context2d::Transform(const Arguments &args) {
  HandleScope scope;

  cairo_matrix_t matrix;
  cairo_matrix_init(&matrix
    , args[0]->IsNumber() ? args[0]->NumberValue() : 0
    , args[1]->IsNumber() ? args[1]->NumberValue() : 0
    , args[2]->IsNumber() ? args[2]->NumberValue() : 0
    , args[3]->IsNumber() ? args[3]->NumberValue() : 0
    , args[4]->IsNumber() ? args[4]->NumberValue() : 0
    , args[5]->IsNumber() ? args[5]->NumberValue() : 0);

  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_transform(context->getContext(), &matrix);
  
  return Undefined();
}

/*
 * Translate transformation.
 */

Handle<Value>
Context2d::Translate(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_translate(context->getContext()
    , args[0]->IsNumber() ? args[0]->NumberValue() : 0
    , args[1]->IsNumber() ? args[1]->NumberValue() : 0);
  return Undefined();
}

/*
 * Scale transformation.
 */

Handle<Value>
Context2d::Scale(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_scale(context->getContext()
    , args[0]->IsNumber() ? args[0]->NumberValue() : 0
    , args[1]->IsNumber() ? args[1]->NumberValue() : 0);
  return Undefined();
}

/*
 * Fill the shape.
 */

Handle<Value>
Context2d::Fill(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_t *ctx = context->getContext();
  SET_SOURCE_RGBA(context->fill);
  cairo_fill_preserve(ctx);
  return Undefined();
}

/*
 * Stroke the shape.
 */

Handle<Value>
Context2d::Stroke(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_t *ctx = context->getContext();
  SET_SOURCE_RGBA(context->stroke);
  cairo_stroke_preserve(ctx);
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
 * Fill the rectangle defined by x, y, width and height.
 */

Handle<Value>
Context2d::FillRect(const Arguments &args) {
  HandleScope scope;
  RECT_ARGS;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_t *ctx = context->getContext();
  cairo_rectangle(ctx, x, y, width, height);
  SET_SOURCE_RGBA(context->fill);
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
  SET_SOURCE_RGBA(context->stroke);
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
  SET_SOURCE_RGBA(context->fill);
  cairo_fill(ctx);
  cairo_set_operator(ctx, CAIRO_OPERATOR_OVER);
  return Undefined();
}

/*
 * Adds a rectangle subpath.
 */

Handle<Value>
Context2d::Rect(const Arguments &args) {
  HandleScope scope;
  RECT_ARGS;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_rectangle(context->getContext(), x, y, width, height);
  return Undefined();
}

/*
 * Adds an arc at x, y with the given radis and start/end angles.
 */

Handle<Value>
Context2d::Arc(const Arguments &args) {
  HandleScope scope;

  if (!args[0]->IsNumber()
    ||!args[1]->IsNumber()
    ||!args[2]->IsNumber()
    ||!args[3]->IsNumber()
    ||!args[4]->IsNumber()) return Undefined();

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
