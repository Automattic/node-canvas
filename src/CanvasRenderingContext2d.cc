
//
// CanvasRenderingContext2d.cc
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#include <math.h>
#include <string.h>
#include <stdlib.h>
#include "Canvas.h"
#include "CanvasRenderingContext2d.h"
#include "CanvasGradient.h"

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
 * Rectangle arg assertions.
 */

#define RECT_ARGS \
  if (!args[0]->IsNumber() \
    ||!args[1]->IsNumber() \
    ||!args[2]->IsNumber() \
    ||!args[3]->IsNumber()) return Undefined(); \
  double x = args[0]->Int32Value(); \
  double y = args[1]->Int32Value(); \
  double width = args[2]->Int32Value(); \
  double height = args[3]->Int32Value();

/*
 * Text baselines.
 */

enum {
    TEXT_BASELINE_ALPHABETIC
  , TEXT_BASELINE_TOP
  , TEXT_BASELINE_BOTTOM
  , TEXT_BASELINE_MIDDLE
  , TEXT_BASELINE_IDEOGRAPHIC
  , TEXT_BASELINE_HANGING
};

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
  NODE_SET_PROTOTYPE_METHOD(t, "fillText", FillText);
  NODE_SET_PROTOTYPE_METHOD(t, "strokeText", StrokeText);
  NODE_SET_PROTOTYPE_METHOD(t, "fillRect", FillRect);
  NODE_SET_PROTOTYPE_METHOD(t, "strokeRect", StrokeRect);
  NODE_SET_PROTOTYPE_METHOD(t, "clearRect", ClearRect);
  NODE_SET_PROTOTYPE_METHOD(t, "rect", Rect);
  NODE_SET_PROTOTYPE_METHOD(t, "setTextBaseline", SetTextBaseline);
  NODE_SET_PROTOTYPE_METHOD(t, "setTextAlignment", SetTextAlignment);
  NODE_SET_PROTOTYPE_METHOD(t, "measureText", MeasureText);
  NODE_SET_PROTOTYPE_METHOD(t, "moveTo", MoveTo);
  NODE_SET_PROTOTYPE_METHOD(t, "lineTo", LineTo);
  NODE_SET_PROTOTYPE_METHOD(t, "bezierCurveTo", BezierCurveTo);
  NODE_SET_PROTOTYPE_METHOD(t, "quadraticCurveTo", QuadraticCurveTo);
  NODE_SET_PROTOTYPE_METHOD(t, "beginPath", BeginPath);
  NODE_SET_PROTOTYPE_METHOD(t, "closePath", ClosePath);
  NODE_SET_PROTOTYPE_METHOD(t, "arc", Arc);
  NODE_SET_PROTOTYPE_METHOD(t, "setFont", SetFont);
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
  proto->SetAccessor(String::NewSymbol("antialias"), GetAntiAlias, SetAntiAlias);
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
  _context = cairo_create(canvas->surface());
  cairo_set_line_width(_context, 1);
  state = states[stateno = 0] = (canvas_state_t *) malloc(sizeof(canvas_state_t));
  state->shadowBlur = 0;
  state->shadowOffsetX = state->shadowOffsetY = 0;
  state->globalAlpha = 1;
  state->textAlignment = -1;
  state->fillPattern = state->strokePattern = NULL;
  RGBA(state->fill,0,0,0,1);
  RGBA(state->stroke,0,0,0,1);
  RGBA(state->shadow,0,0,0,0);
}

/*
 * Destroy cairo context.
 */

Context2d::~Context2d() {
  cairo_destroy(_context);
}

/*
 * Save cairo / canvas state.
 */

void
Context2d::save() {
  cairo_save(_context);
  saveState();
}

/*
 * Restore cairo / canvas state.
 */

void
Context2d::restore() {
  cairo_restore(_context);
  restoreState();
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
 * Save flat path.
 */

void
Context2d::savePath() {
  _path = cairo_copy_path_flat(_context);
  cairo_new_path(_context);
}

/*
 * Restore flat path.
 */

void
Context2d::restorePath() {
  cairo_append_path(_context, _path);
}

/*
 * Fill and apply shadow.
 */

void
Context2d::fill(bool preserve) {
  state->fillPattern
    ? cairo_set_source(_context, state->fillPattern)
    : setSourceRGBA(state->fill);

  if (preserve) {
    hasShadow()
      ? shadow(cairo_fill_preserve)
      : cairo_fill_preserve(_context);
  } else {
    hasShadow()
      ? shadow(cairo_fill)
      : cairo_fill(_context);
  }
}

/*
 * Stroke and apply shadow.
 */

void
Context2d::stroke(bool preserve) {
  state->strokePattern
    ? cairo_set_source(_context, state->strokePattern)
    : setSourceRGBA(state->stroke);

  if (preserve) {
    hasShadow()
      ? shadow(cairo_stroke_preserve)
      : cairo_stroke_preserve(_context);
  } else {
    hasShadow()
      ? shadow(cairo_stroke)
      : cairo_stroke(_context);
  }
}

/*
 * Apply shadow with the given draw fn.
 */

void
Context2d::shadow(void (fn)(cairo_t *cr)) {
  cairo_path_t *path = cairo_copy_path_flat(_context);
  cairo_save(_context);

  // Offset
  cairo_translate(
      _context
    , state->shadowOffsetX
    , state->shadowOffsetY);

  // Apply shadow
  cairo_push_group(_context);
  cairo_new_path(_context);
  cairo_append_path(_context, path);
  setSourceRGBA(state->shadow);
  fn(_context);

  // No need to invoke blur if shadowBlur is 0
  if (state->shadowBlur) {
    blur(cairo_get_group_target(_context), state->shadowBlur);
  }

  // Paint the shadow
  cairo_pop_group_to_source(_context);
  cairo_paint(_context);

  // Restore state
  cairo_restore(_context);
  cairo_new_path(_context);
  cairo_append_path(_context, path);
  fn(_context);

  cairo_path_destroy(path);
}

/*
 * Set source RGBA.
 */

void
Context2d::setSourceRGBA(rgba_t color) {
  cairo_set_source_rgba(
      _context
    , color.r
    , color.g
    , color.b
    , color.a * state->globalAlpha);
}

/*
 * Check if the context has a drawable shadow.
 */

bool
Context2d::hasShadow() {
  return state->shadow.a
    && (state->shadowBlur || state->shadowOffsetX || state->shadowOffsetX);
}

/*
 * Blur the given surface with the given radius.
 */

void
Context2d::blur(cairo_surface_t *surface, int radius) {
  // Steve Hanov, 2009
  // Released into the public domain.
  --radius;
  // get width, height
  int width = cairo_image_surface_get_width( surface );
  int height = cairo_image_surface_get_height( surface );
  unsigned* precalc = 
      (unsigned*)malloc(width*height*sizeof(unsigned));
  unsigned char* src = cairo_image_surface_get_data( surface );
  double mul=1.f/((radius*2)*(radius*2));
  int channel;
  
  // The number of times to perform the averaging. According to wikipedia,
  // three iterations is good enough to pass for a gaussian.
  const int MAX_ITERATIONS = 3; 
  int iteration;

  for ( iteration = 0; iteration < MAX_ITERATIONS; iteration++ ) {
      for( channel = 0; channel < 4; channel++ ) {
          int x,y;

          // precomputation step.
          unsigned char* pix = src;
          unsigned* pre = precalc;

          pix += channel;
          for (y=0;y<height;y++) {
              for (x=0;x<width;x++) {
                  int tot=pix[0];
                  if (x>0) tot+=pre[-1];
                  if (y>0) tot+=pre[-width];
                  if (x>0 && y>0) tot-=pre[-width-1];
                  *pre++=tot;
                  pix += 4;
              }
          }

          // blur step.
          pix = src + (int)radius * width * 4 + (int)radius * 4 + channel;
          for (y=radius;y<height-radius;y++) {
              for (x=radius;x<width-radius;x++) {
                  int l = x < radius ? 0 : x - radius;
                  int t = y < radius ? 0 : y - radius;
                  int r = x + radius >= width ? width - 1 : x + radius;
                  int b = y + radius >= height ? height - 1 : y + radius;
                  int tot = precalc[r+b*width] + precalc[l+t*width] - 
                      precalc[l+b*width] - precalc[r+t*width];
                  *pix=(unsigned char)(tot*mul);
                  pix += 4;
              }
              pix += (int)radius * 2 * 4;
          }
      }
  }
  free( precalc );
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
  cairo_t *ctx = context->context();
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
    case CAIRO_OPERATOR_LIGHTEN:
      return String::NewSymbol("lighter");
    case CAIRO_OPERATOR_DARKEN:
      return String::NewSymbol("darkler");
    // Non-standard
    case CAIRO_OPERATOR_MULTIPLY:
      return String::NewSymbol("multiply");
    case CAIRO_OPERATOR_SCREEN:
      return String::NewSymbol("screen");
    case CAIRO_OPERATOR_OVERLAY:
      return String::NewSymbol("overlay");
    case CAIRO_OPERATOR_HARD_LIGHT:
      return String::NewSymbol("hard-light");
    case CAIRO_OPERATOR_SOFT_LIGHT:
      return String::NewSymbol("soft-light");
    case CAIRO_OPERATOR_HSL_HUE:
      return String::NewSymbol("hsl-hue");
    case CAIRO_OPERATOR_HSL_SATURATION:
      return String::NewSymbol("hsl-saturation");
    case CAIRO_OPERATOR_HSL_COLOR:
      return String::NewSymbol("hsl-color");
    case CAIRO_OPERATOR_HSL_LUMINOSITY:
      return String::NewSymbol("hsl-luminosity");
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
  cairo_t *ctx = context->context();
  String::AsciiValue type(val->ToString());
  if (0 == strcmp("xor", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_XOR);
  }else if (0 == strcmp("lighter", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_LIGHTEN);
  }else if (0 == strcmp("darker", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_DARKEN);
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
  // Non-standard
  } else if (0 == strcmp("multiply", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_MULTIPLY);
  } else if (0 == strcmp("screen", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_SCREEN);
  } else if (0 == strcmp("overlay", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_OVERLAY);
  } else if (0 == strcmp("hard-light", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_HARD_LIGHT);
  } else if (0 == strcmp("soft-light", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_SOFT_LIGHT);
  } else if (0 == strcmp("hsl-hue", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_HSL_HUE);
  } else if (0 == strcmp("hsl-saturation", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_HSL_SATURATION);
  } else if (0 == strcmp("hsl-color", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_HSL_COLOR);
  } else if (0 == strcmp("hsl-luminosity", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_HSL_LUMINOSITY);
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
  return Number::New(context->state->shadowOffsetX);
}

/*
 * Set shadow offset x.
 */

void
Context2d::SetShadowOffsetX(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  context->state->shadowOffsetX = val->NumberValue();
}

/*
 * Get shadow offset y.
 */

Handle<Value>
Context2d::GetShadowOffsetY(Local<String> prop, const AccessorInfo &info) {
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  return Number::New(context->state->shadowOffsetY);
}

/*
 * Set shadow offset y.
 */

void
Context2d::SetShadowOffsetY(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  context->state->shadowOffsetY = val->NumberValue();
}

/*
 * Get shadow blur.
 */

Handle<Value>
Context2d::GetShadowBlur(Local<String> prop, const AccessorInfo &info) {
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  return Number::New(context->state->shadowBlur);
}

/*
 * Set shadow blur.
 */

void
Context2d::SetShadowBlur(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
  int n = val->Uint32Value();
  if (n >= 0) {
    Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
    context->state->shadowBlur = n;
  }
}

/*
 * Get current antialiasing setting.
 */

Handle<Value>
Context2d::GetAntiAlias(Local<String> prop, const AccessorInfo &info) {
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  switch (cairo_get_antialias(context->context())) {
    case CAIRO_ANTIALIAS_NONE:
      return String::NewSymbol("none");
    case CAIRO_ANTIALIAS_GRAY:
      return String::NewSymbol("gray");
    case CAIRO_ANTIALIAS_SUBPIXEL:
      return String::NewSymbol("subpixel");
    default:
      return String::NewSymbol("default");
  }
}

/*
 * Set antialiasing.
 */

void
Context2d::SetAntiAlias(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
  String::AsciiValue str(val->ToString());
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();
  cairo_antialias_t a;
  if (0 == strcmp("none", *str)) {
    a = CAIRO_ANTIALIAS_NONE;
  } else if (0 == strcmp("default", *str)) {
    a = CAIRO_ANTIALIAS_DEFAULT;
  } else if (0 == strcmp("gray", *str)) {
    a = CAIRO_ANTIALIAS_GRAY;
  } else if (0 == strcmp("subpixel", *str)) {
    a = CAIRO_ANTIALIAS_SUBPIXEL;
  } else {
    a = cairo_get_antialias(ctx);
  }
  cairo_set_antialias(ctx, a);
}

/*
 * Get miter limit.
 */

Handle<Value>
Context2d::GetMiterLimit(Local<String> prop, const AccessorInfo &info) {
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  return Number::New(cairo_get_miter_limit(context->context()));
}

/*
 * Set miter limit.
 */

void
Context2d::SetMiterLimit(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
  double n = val->NumberValue();
  if (n > 0) {
    Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
    cairo_set_miter_limit(context->context(), n);
  }
}

/*
 * Get line width.
 */

Handle<Value>
Context2d::GetLineWidth(Local<String> prop, const AccessorInfo &info) {
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  return Number::New(cairo_get_line_width(context->context()));
}

/*
 * Set line width.
 */

void
Context2d::SetLineWidth(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
  double n = val->NumberValue();
  if (n > 0) {
    Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
    cairo_set_line_width(context->context(), n);
  }
}

/*
 * Get line join.
 */

Handle<Value>
Context2d::GetLineJoin(Local<String> prop, const AccessorInfo &info) {
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  switch (cairo_get_line_join(context->context())) {
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
  cairo_t *ctx = context->context();
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
  switch (cairo_get_line_cap(context->context())) {
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
  cairo_t *ctx = context->context();
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
    cairo_t *ctx = context->context();
    double x = args[0]->NumberValue()
         , y = args[1]->NumberValue();
    return Boolean::New(cairo_in_fill(ctx, x, y) || cairo_in_stroke(ctx, x, y));
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
  context->state->fillPattern = grad->pattern();
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
  context->state->strokePattern = grad->pattern();
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
  RGBA(context->state->shadow,r,g,b,a);
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
  context->state->fillPattern = NULL;
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
  context->state->strokePattern = NULL;
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
  cairo_curve_to(context->context()
    , args[0]->NumberValue()
    , args[1]->NumberValue()
    , args[2]->NumberValue()
    , args[3]->NumberValue()
    , args[4]->NumberValue()
    , args[5]->NumberValue());

  return Undefined();
}

/*
 * Quadratic curve approximation from libsvg-cairo.
 */

Handle<Value>
Context2d::QuadraticCurveTo(const Arguments &args) {
  HandleScope scope;

  if (!args[0]->IsNumber()
    ||!args[1]->IsNumber()
    ||!args[2]->IsNumber()
    ||!args[3]->IsNumber()) return Undefined();

  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_t *ctx = context->context();

  double x, y
    , x1 = args[0]->NumberValue()
    , y1 = args[1]->NumberValue()
    , x2 = args[2]->NumberValue()
    , y2 = args[3]->NumberValue();

  cairo_get_current_point(ctx, &x, &y);

  cairo_curve_to(ctx
    , x  + 2.0 / 3.0 * (x1 - x),  y  + 2.0 / 3.0 * (y1 - y)
    , x2 + 2.0 / 3.0 * (x1 - x2), y2 + 2.0 / 3.0 * (y1 - y2)
    , x2
    , y2);

  return Undefined();
}

/*
 * Save state.
 */

Handle<Value>
Context2d::Save(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  context->save();
  return Undefined();
}

/*
 * Restore state.
 */

Handle<Value>
Context2d::Restore(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  context->restore();
  return Undefined();
}

/*
 * Creates a new subpath.
 */

Handle<Value>
Context2d::BeginPath(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_new_path(context->context());
  return Undefined();
}

/*
 * Marks the subpath as closed.
 */

Handle<Value>
Context2d::ClosePath(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_close_path(context->context());
  return Undefined();
}

/*
 * Rotate transformation.
 */

Handle<Value>
Context2d::Rotate(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_rotate(context->context()
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
  cairo_transform(context->context(), &matrix);
  
  return Undefined();
}

/*
 * Reset the CTM, used internally by setTransform().
 */

Handle<Value>
Context2d::ResetTransform(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_identity_matrix(context->context());
  return Undefined();
}

/*
 * Translate transformation.
 */

Handle<Value>
Context2d::Translate(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_translate(context->context()
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
  cairo_scale(context->context()
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
  cairo_t *ctx = context->context();
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
  context->fill(true);
  return Undefined();
}

/*
 * Stroke the path.
 */

Handle<Value>
Context2d::Stroke(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  context->stroke(true);
  return Undefined();
}

/*
 * Fill text at (x, y).
 */

Handle<Value>
Context2d::FillText(const Arguments &args) {
  HandleScope scope;

  if (!args[0]->IsString()
    || !args[1]->IsNumber()
    || !args[2]->IsNumber()) return Undefined();

  String::Utf8Value str(args[0]);
  double x = args[1]->NumberValue();
  double y = args[2]->NumberValue();

  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());

  context->savePath();
  context->setTextPath(*str, x, y);
  context->fill();
  context->restorePath();

  return Undefined();
}

/*
 * Stroke text at (x ,y).
 */

Handle<Value>
Context2d::StrokeText(const Arguments &args) {
  HandleScope scope;
  
  if (!args[0]->IsString()
    || !args[1]->IsNumber()
    || !args[2]->IsNumber()) return Undefined();

  String::Utf8Value str(args[0]);
  double x = args[1]->NumberValue();
  double y = args[2]->NumberValue();
  
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());

  context->savePath();
  context->setTextPath(*str, x, y);
  context->stroke();
  context->restorePath();

  return Undefined();
}

/*
 * Set text path for the given string at (x, y).
 */

void
Context2d::setTextPath(const char *str, double x, double y) {
  // Text extents
  cairo_text_extents_t te;
  cairo_text_extents(_context, str, &te);

  cairo_font_extents_t fe;
  cairo_font_extents(_context, &fe);

  // Alignment
  switch (state->textAlignment) {
    // center
    case 0:
      x -= te.width / 2 + te.x_bearing;
      break;
    // right
    case 1:
      x -= te.width + te.x_bearing;
      break;
  }

  // Baseline approx
  // TODO:
  switch (state->textBaseline) {
    case TEXT_BASELINE_TOP:
    case TEXT_BASELINE_HANGING:
      y += te.height;
      break;
    case TEXT_BASELINE_MIDDLE:
      y += te.height / 2;
      break;
    case TEXT_BASELINE_BOTTOM:
      y -= te.height / 2;
      break;
  }

  cairo_move_to(_context, x, y);
  cairo_text_path(_context, str);
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
  cairo_line_to(context->context()
    , args[0]->NumberValue()
    , args[1]->NumberValue());

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
  cairo_move_to(context->context()
    , args[0]->NumberValue()
    , args[1]->NumberValue());

  return Undefined();
}

/*
 * Set font:
 *   - weight
 *   - style
 *   - size
 *   - unit
 *   - family
 */

Handle<Value>
Context2d::SetFont(const Arguments &args) {
  HandleScope scope;

  // Ignore invalid args
  if (!args[0]->IsString()
    || !args[1]->IsString()
    || !args[2]->IsNumber()
    || !args[3]->IsString()
    || !args[4]->IsString()) return Undefined();

  String::AsciiValue weight(args[0]);
  String::AsciiValue style(args[1]);
  double size = args[2]->NumberValue();
  String::AsciiValue unit(args[3]);
  const char *family = *String::AsciiValue(args[4]);
  
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_t *ctx = context->context();

  // Size
  cairo_set_font_size(ctx, size);

  // Family
  if (0 == strcmp("sans-serif", family)) {
    family = "Arial";
  }

  // Style
  cairo_font_slant_t s = CAIRO_FONT_SLANT_NORMAL;
  if (0 == strcmp("italic", *style)) {
    s = CAIRO_FONT_SLANT_ITALIC;
  } else if (0 == strcmp("oblique", *style)) {
    s = CAIRO_FONT_SLANT_OBLIQUE;
  }

  // Weight
  cairo_font_weight_t w = CAIRO_FONT_WEIGHT_NORMAL;
  if (0 == strcmp("bold", *weight)) {
    w = CAIRO_FONT_WEIGHT_BOLD;
  }

  cairo_select_font_face(ctx, family, s, w);
  
  return Undefined();
}

/*
 * Return the given text extents.
 */

Handle<Value>
Context2d::MeasureText(const Arguments &args) {
  HandleScope scope;

  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_t *ctx = context->context();

  String::Utf8Value str(args[0]->ToString());
  Local<Object> obj = Object::New();

  cairo_text_extents_t te;
  cairo_text_extents(ctx, *str, &te);
  obj->Set(String::New("width"), Number::New(te.width));

  return scope.Close(obj);
}

/*
 * Set text baseline.
 */

Handle<Value>
Context2d::SetTextBaseline(const Arguments &args) {
  HandleScope scope;

  if (!args[0]->IsInt32()) return Undefined();
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  context->state->textBaseline = args[0]->Int32Value();

  return Undefined();
}

/*
 * Set text alignment. -1 0 1
 */

Handle<Value>
Context2d::SetTextAlignment(const Arguments &args) {
  HandleScope scope;

  if (!args[0]->IsInt32()) return Undefined();
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  context->state->textAlignment = args[0]->Int32Value();

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
  cairo_t *ctx = context->context();
  cairo_new_path(ctx);
  cairo_rectangle(ctx, x, y, width, height);
  context->fill();
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
  cairo_t *ctx = context->context();
  cairo_new_path(ctx);
  cairo_rectangle(ctx, x, y, width, height);
  context->stroke();
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
  cairo_t *ctx = context->context();
  cairo_save(ctx);
  cairo_rectangle(ctx, x, y, width, height);
  cairo_set_operator(ctx, CAIRO_OPERATOR_CLEAR);
  cairo_fill(ctx);
  cairo_restore(ctx);
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
  cairo_rectangle(context->context(), x, y, width, height);
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
  cairo_t *ctx = context->context();

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
