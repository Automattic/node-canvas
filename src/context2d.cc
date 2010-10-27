
//
// context2d.cc
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#include <math.h>
#include <string.h>
#include "canvas.h"
#include "context2d.h"
#include "gradient.h"

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
 * Set source.
 */

#define SET_SOURCE(_) \
  if (_##Pattern) \
    cairo_set_source(ctx, _##Pattern); \
  else \
    SET_SOURCE_RGBA(_)

/*
 * Set source RGBA.
 */

#define SET_SOURCE_RGBA(_) \
  cairo_set_source_rgba(ctx \
    , _.r \
    , _.g \
    , _.b \
    , context->state->globalAlpha == -1 ? _.a : context->state->globalAlpha);

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
 * Initialize Context2d.
 */

void
Context2d::Initialize(Handle<Object> target) {
  HandleScope scope;
  // Constructor
  Local<FunctionTemplate> t = FunctionTemplate::New(Context2d::New);
  t->InstanceTemplate()->SetInternalFieldCount(1);
  t->SetClassName(String::NewSymbol("CanvasRenderingContext2d"));

  // Prototype
  Local<ObjectTemplate> proto = t->PrototypeTemplate();
  NODE_SET_PROTOTYPE_METHOD(t, "save", Save);
  NODE_SET_PROTOTYPE_METHOD(t, "restore", Restore);
  NODE_SET_PROTOTYPE_METHOD(t, "rotate", Rotate);
  NODE_SET_PROTOTYPE_METHOD(t, "translate", Translate);
  NODE_SET_PROTOTYPE_METHOD(t, "transform", Transform);
  NODE_SET_PROTOTYPE_METHOD(t, "resetTransform", ResetTransform);
  NODE_SET_PROTOTYPE_METHOD(t, "isPointInPath", IsPointInPath);
  NODE_SET_PROTOTYPE_METHOD(t, "scale", Scale);
  NODE_SET_PROTOTYPE_METHOD(t, "clip", Clip);
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
  NODE_SET_PROTOTYPE_METHOD(t, "setShadowRGBA", SetShadowRGBA);
  NODE_SET_PROTOTYPE_METHOD(t, "setFillRGBA", SetFillRGBA);
  NODE_SET_PROTOTYPE_METHOD(t, "setStrokeRGBA", SetStrokeRGBA);
  NODE_SET_PROTOTYPE_METHOD(t, "setFillPattern", SetFillPattern);
  NODE_SET_PROTOTYPE_METHOD(t, "setStrokePattern", SetStrokePattern);
  proto->SetAccessor(String::NewSymbol("globalCompositeOperation"), GetGlobalCompositeOperation, SetGlobalCompositeOperation);
  proto->SetAccessor(String::NewSymbol("globalAlpha"), GetGlobalAlpha, SetGlobalAlpha);
  proto->SetAccessor(String::NewSymbol("miterLimit"), GetMiterLimit, SetMiterLimit);
  proto->SetAccessor(String::NewSymbol("lineWidth"), GetLineWidth, SetLineWidth);
  proto->SetAccessor(String::NewSymbol("lineCap"), GetLineCap, SetLineCap);
  proto->SetAccessor(String::NewSymbol("lineJoin"), GetLineJoin, SetLineJoin);
  proto->SetAccessor(String::NewSymbol("shadowOffsetX"), GetShadowOffsetX, SetShadowOffsetX);
  proto->SetAccessor(String::NewSymbol("shadowOffsetY"), GetShadowOffsetY, SetShadowOffsetY);
  proto->SetAccessor(String::NewSymbol("shadowBlur"), GetShadowBlur, SetShadowBlur);
  target->Set(String::NewSymbol("CanvasRenderingContext2d"), t->GetFunction());
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
  shadowBlur = shadowOffsetX = shadowOffsetY = 0;
  state = states[stateno = 0] = (canvas_state_t *) malloc(sizeof(canvas_state_t));
  state->globalAlpha = -1;
  state->fillPattern = state->strokePattern = NULL;
  RGBA(state->fill,0,0,0,1);
  RGBA(state->stroke,0,0,0,1);
}

/*
 * Destroy cairo context.
 */

Context2d::~Context2d() {
  cairo_destroy(_context);
}

/*
 * Save the current state.
 */

void
Context2d::saveState() {
  if (stateno == CANVAS_MAX_STATES) return;
  states[++stateno] = (canvas_state_t *) malloc(sizeof(canvas_state_t));
  memcpy(states[stateno], state, sizeof(canvas_state_t));
  state = states[stateno];
}

/*
 * Restore state.
 */

void
Context2d::restoreState() {
  if (0 == stateno) return;
  state = states[--stateno];
}

/*
 * Get global alpha.
 */

Handle<Value>
Context2d::GetGlobalAlpha(Local<String> prop, const AccessorInfo &info) {
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  return Number::New(context->state->globalAlpha);
}

/*
 * Set global alpha.
 */

void
Context2d::SetGlobalAlpha(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
  double n = val->NumberValue();
  if (n >= 0 && n <= 1) {
    Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
    context->state->globalAlpha = n;
  }
}

/*
 * Get global composite operation.
 */

Handle<Value>
Context2d::GetGlobalCompositeOperation(Local<String> prop, const AccessorInfo &info) {
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->getContext();
  switch (cairo_get_operator(ctx)) {
    case CAIRO_OPERATOR_ATOP:
      return String::NewSymbol("source-atop");
    case CAIRO_OPERATOR_IN:
      return String::NewSymbol("source-in");
    case CAIRO_OPERATOR_OUT:
      return String::NewSymbol("source-out");
    case CAIRO_OPERATOR_XOR:
      return String::NewSymbol("xor");
    case CAIRO_OPERATOR_DEST_ATOP:
      return String::NewSymbol("destination-atop");
    case CAIRO_OPERATOR_DEST_IN:
      return String::NewSymbol("destination-in");
    case CAIRO_OPERATOR_DEST_OUT:
      return String::NewSymbol("destination-out");
    case CAIRO_OPERATOR_DEST_OVER:
      return String::NewSymbol("destination-over");
    case CAIRO_OPERATOR_ADD:
      return String::NewSymbol("lighter");
    default:
      return String::NewSymbol("source-over");
  }
}

/*
 * Set global composite operation.
 */

void
Context2d::SetGlobalCompositeOperation(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->getContext();
  String::AsciiValue type(val->ToString());
  if (0 == strcmp("xor", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_XOR);
  }else if (0 == strcmp("lighter", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_ADD);
  }else if (0 == strcmp("source-atop", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_ATOP);
  } else if (0 == strcmp("source-in", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_IN);
  } else if (0 == strcmp("source-out", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_OUT);
  } else if (0 == strcmp("destination-atop", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_DEST_ATOP);
  } else if (0 == strcmp("destination-in", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_DEST_IN);
  } else if (0 == strcmp("destination-out", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_DEST_OUT);
  } else if (0 == strcmp("destination-over", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_DEST_OVER);
  } else {
    cairo_set_operator(ctx, CAIRO_OPERATOR_OVER);
  }
}

/*
 * Get shadow offset x.
 */

Handle<Value>
Context2d::GetShadowOffsetX(Local<String> prop, const AccessorInfo &info) {
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  return Number::New(context->shadowOffsetX);
}

/*
 * Set shadow offset x.
 */

void
Context2d::SetShadowOffsetX(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  context->shadowOffsetX = val->NumberValue();
}

/*
 * Get shadow offset y.
 */

Handle<Value>
Context2d::GetShadowOffsetY(Local<String> prop, const AccessorInfo &info) {
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  return Number::New(context->shadowOffsetY);
}

/*
 * Set shadow offset y.
 */

void
Context2d::SetShadowOffsetY(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  context->shadowOffsetY = val->NumberValue();
}

/*
 * Get shadow blur.
 */

Handle<Value>
Context2d::GetShadowBlur(Local<String> prop, const AccessorInfo &info) {
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  return Number::New(context->shadowBlur);
}

/*
 * Set shadow blur.
 */

void
Context2d::SetShadowBlur(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
  double n = val->NumberValue();
  if (n > 0) {
    Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
    context->shadowBlur = n;
  }
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
  double n = val->NumberValue();
  if (n > 0) {
    Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
    cairo_set_miter_limit(context->getContext(), n);
  }
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
  double n = val->NumberValue();
  if (n > 0) {
    Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
    cairo_set_line_width(context->getContext(), n);
  }
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
  String::AsciiValue type(val->ToString());
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
  String::AsciiValue type(val->ToString());
  if (0 == strcmp("round", *type)) {
    cairo_set_line_cap(ctx, CAIRO_LINE_CAP_ROUND);
  } else if (0 == strcmp("square", *type)) {
    cairo_set_line_cap(ctx, CAIRO_LINE_CAP_SQUARE);
  } else {
    cairo_set_line_cap(ctx, CAIRO_LINE_CAP_BUTT);
  }
}

/*
 * Check if the given point is within the current path.
 */

Handle<Value>
Context2d::IsPointInPath(const Arguments &args) {
  HandleScope scope;
  if (args[0]->IsNumber() && args[1]->IsNumber()) {
    Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
    cairo_t *ctx = context->getContext();
    double x = args[0]->NumberValue()
         , y = args[1]->NumberValue();
    return Boolean::New(cairo_in_fill(ctx, x, y));
  }
  return False();
}

/*
 * Set fill pattern, used internally for fillStyle=
 */

Handle<Value>
Context2d::SetFillPattern(const Arguments &args) {
  HandleScope scope;
  // TODO: HasInstance / error handling
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  Gradient *grad = ObjectWrap::Unwrap<Gradient>(args[0]->ToObject());
  context->state->fillPattern = grad->getPattern();
  return Undefined();
}

/*
 * Set stroke pattern, used internally for strokeStyle=
 */

Handle<Value>
Context2d::SetStrokePattern(const Arguments &args) {
  HandleScope scope;
  // TODO: HasInstance / error handling
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  Gradient *grad = ObjectWrap::Unwrap<Gradient>(args[0]->ToObject());
  context->state->strokePattern = grad->getPattern();
  return Undefined();
}

/*
 * Set shadow RGBA, used internally for shadowColor=
 */

Handle<Value>
Context2d::SetShadowRGBA(const Arguments &args) {
  HandleScope scope;
  RGBA_ARGS(0);
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  RGBA(context->shadow,r,g,b,a);
  return Undefined();
}

/*
 * Set fill RGBA, used internally for fillStyle=
 */

Handle<Value>
Context2d::SetFillRGBA(const Arguments &args) {
  HandleScope scope;
  RGBA_ARGS(0);
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  RGBA(context->state->fill,r,g,b,a);
  return Undefined();
}

/*
 * Set stroke RGBA, used internally for strokeStyle=
 */

Handle<Value>
Context2d::SetStrokeRGBA(const Arguments &args) {
  HandleScope scope;
  RGBA_ARGS(0);
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  RGBA(context->state->stroke,r,g,b,a);
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
  context->saveState();
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
  context->restoreState();
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
 * Modify the CTM.
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
 * Reset the CTM, used internally by setTransform().
 */

Handle<Value>
Context2d::ResetTransform(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_identity_matrix(context->getContext());
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
 * Use path as clipping region.
 */

Handle<Value>
Context2d::Clip(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_t *ctx = context->getContext();
  cairo_clip_preserve(ctx);
  return Undefined();
}

/*
 * Fill the path.
 */

Handle<Value>
Context2d::Fill(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_t *ctx = context->getContext();
  SET_SOURCE(context->state->fill);
  cairo_fill_preserve(ctx);
  return Undefined();
}

/*
 * Stroke the path.
 */

Handle<Value>
Context2d::Stroke(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_t *ctx = context->getContext();
  SET_SOURCE(context->state->stroke);
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
  if (0 == width || 0 == height) return Undefined();
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_t *ctx = context->getContext();
  cairo_rectangle(ctx, x, y, width, height);
  SET_SOURCE(context->state->fill);
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
  if (0 == width && 0 == height) return Undefined();
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_t *ctx = context->getContext();
  cairo_rectangle(ctx, x, y, width, height);
  SET_SOURCE(context->state->stroke);
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
  if (0 == width || 0 == height) return Undefined();
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_t *ctx = context->getContext();
  cairo_set_operator(ctx, CAIRO_OPERATOR_CLEAR);
  cairo_rectangle(ctx, x, y, width, height);
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
