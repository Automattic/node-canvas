//
// CanvasRenderingContext2d.cc
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#include <math.h>
#include <string.h>
#include <stdlib.h>
#include "Canvas.h"
#include "Point.h"
#include "Image.h"
#include "ImageData.h"
#include "CanvasRenderingContext2d.h"
#include "CanvasGradient.h"
#include "CanvasPattern.h"

#ifdef HAVE_FREETYPE
#include "FontFace.h"
#endif

Persistent<FunctionTemplate> Context2d::constructor;

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
/*
 * Rectangle arg assertions.
 */
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
/*
 * Rectangle info assertions.
 */
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
#define RECT_ARGS \
  if (!args[0]->IsNumber() \
    ||!args[1]->IsNumber() \
    ||!args[2]->IsNumber() \
    ||!args[3]->IsNumber()) return Undefined(); \
  double x = args[0]->NumberValue(); \
  double y = args[1]->NumberValue(); \
  double width = args[2]->NumberValue(); \
  double height = args[3]->NumberValue();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
#define RECT_INFO \
  if (!info[0]->IsNumber() \
    ||!info[1]->IsNumber() \
    ||!info[2]->IsNumber() \
    ||!info[3]->IsNumber()) {info.GetReturnValue().SetUndefined(); return;}\
  double x = info[0]->NumberValue(); \
  double y = info[1]->NumberValue(); \
  double width = info[2]->NumberValue(); \
  double height = info[3]->NumberValue();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

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

#if HAVE_PANGO

/*
 * State helper function
 */

void state_assign_fontFamily(canvas_state_t *state, const char *str) {
  free(state->fontFamily);
  state->fontFamily = strndup(str, 100);
}


/*
 * Simple helper macro for a rather verbose function call.
 */

#define PANGO_LAYOUT_GET_METRICS(LAYOUT) pango_context_get_metrics( \
   pango_layout_get_context(LAYOUT), \
   pango_layout_get_font_description(LAYOUT), \
   pango_context_get_language(pango_layout_get_context(LAYOUT)))

#endif

/*
 * Initialize Context2d.
 */

void
Context2d::Initialize(Handle<Object> target) {
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

  // Constructor
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  constructor = Persistent<FunctionTemplate>::New(FunctionTemplate::New(Context2d::New));
  constructor->InstanceTemplate()->SetInternalFieldCount(1);
  constructor->SetClassName(String::NewSymbol("CanvasRenderingContext2d"));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Local<FunctionTemplate> lconstructor = Local<FunctionTemplate>::New(isolate, FunctionTemplate::New(Context2d::New));
  lconstructor->InstanceTemplate()->SetInternalFieldCount(1);
  lconstructor->SetClassName(String::NewSymbol("CanvasRenderingContext2d"));
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

  // Prototype
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  Local<ObjectTemplate> proto = constructor->PrototypeTemplate();
  NODE_SET_PROTOTYPE_METHOD(constructor, "drawImage", DrawImage);
  NODE_SET_PROTOTYPE_METHOD(constructor, "putImageData", PutImageData);
  NODE_SET_PROTOTYPE_METHOD(constructor, "addPage", AddPage);
  NODE_SET_PROTOTYPE_METHOD(constructor, "save", Save);
  NODE_SET_PROTOTYPE_METHOD(constructor, "restore", Restore);
  NODE_SET_PROTOTYPE_METHOD(constructor, "rotate", Rotate);
  NODE_SET_PROTOTYPE_METHOD(constructor, "translate", Translate);
  NODE_SET_PROTOTYPE_METHOD(constructor, "transform", Transform);
  NODE_SET_PROTOTYPE_METHOD(constructor, "resetTransform", ResetTransform);
  NODE_SET_PROTOTYPE_METHOD(constructor, "isPointInPath", IsPointInPath);
  NODE_SET_PROTOTYPE_METHOD(constructor, "scale", Scale);
  NODE_SET_PROTOTYPE_METHOD(constructor, "clip", Clip);
  NODE_SET_PROTOTYPE_METHOD(constructor, "fill", Fill);
  NODE_SET_PROTOTYPE_METHOD(constructor, "stroke", Stroke);
  NODE_SET_PROTOTYPE_METHOD(constructor, "fillText", FillText);
  NODE_SET_PROTOTYPE_METHOD(constructor, "strokeText", StrokeText);
  NODE_SET_PROTOTYPE_METHOD(constructor, "fillRect", FillRect);
  NODE_SET_PROTOTYPE_METHOD(constructor, "strokeRect", StrokeRect);
  NODE_SET_PROTOTYPE_METHOD(constructor, "clearRect", ClearRect);
  NODE_SET_PROTOTYPE_METHOD(constructor, "rect", Rect);
  NODE_SET_PROTOTYPE_METHOD(constructor, "measureText", MeasureText);
  NODE_SET_PROTOTYPE_METHOD(constructor, "moveTo", MoveTo);
  NODE_SET_PROTOTYPE_METHOD(constructor, "lineTo", LineTo);
  NODE_SET_PROTOTYPE_METHOD(constructor, "bezierCurveTo", BezierCurveTo);
  NODE_SET_PROTOTYPE_METHOD(constructor, "quadraticCurveTo", QuadraticCurveTo);
  NODE_SET_PROTOTYPE_METHOD(constructor, "beginPath", BeginPath);
  NODE_SET_PROTOTYPE_METHOD(constructor, "closePath", ClosePath);
  NODE_SET_PROTOTYPE_METHOD(constructor, "arc", Arc);
  NODE_SET_PROTOTYPE_METHOD(constructor, "arcTo", ArcTo);
  NODE_SET_PROTOTYPE_METHOD(constructor, "_setFont", SetFont);
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Local<ObjectTemplate> proto = lconstructor->PrototypeTemplate();
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "drawImage", DrawImage);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "putImageData", PutImageData);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "addPage", AddPage);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "save", Save);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "restore", Restore);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "rotate", Rotate);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "translate", Translate);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "transform", Transform);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "resetTransform", ResetTransform);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "isPointInPath", IsPointInPath);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "scale", Scale);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "clip", Clip);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "fill", Fill);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "stroke", Stroke);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "fillText", FillText);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "strokeText", StrokeText);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "fillRect", FillRect);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "strokeRect", StrokeRect);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "clearRect", ClearRect);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "rect", Rect);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "measureText", MeasureText);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "moveTo", MoveTo);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "lineTo", LineTo);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "bezierCurveTo", BezierCurveTo);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "quadraticCurveTo", QuadraticCurveTo);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "beginPath", BeginPath);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "closePath", ClosePath);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "arc", Arc);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "arcTo", ArcTo);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "_setFont", SetFont);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
#ifdef HAVE_FREETYPE
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  NODE_SET_PROTOTYPE_METHOD(constructor, "_setFontFace", SetFontFace);
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "_setFontFace", SetFontFace);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
#endif
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  NODE_SET_PROTOTYPE_METHOD(constructor, "_setFillColor", SetFillColor);
  NODE_SET_PROTOTYPE_METHOD(constructor, "_setStrokeColor", SetStrokeColor);
  NODE_SET_PROTOTYPE_METHOD(constructor, "_setFillPattern", SetFillPattern);
  NODE_SET_PROTOTYPE_METHOD(constructor, "_setStrokePattern", SetStrokePattern);
  NODE_SET_PROTOTYPE_METHOD(constructor, "_setTextBaseline", SetTextBaseline);
  NODE_SET_PROTOTYPE_METHOD(constructor, "_setTextAlignment", SetTextAlignment);
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "_setFillColor", SetFillColor);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "_setStrokeColor", SetStrokeColor);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "_setFillPattern", SetFillPattern);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "_setStrokePattern", SetStrokePattern);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "_setTextBaseline", SetTextBaseline);
  NODE_SET_PROTOTYPE_METHOD(lconstructor, "_setTextAlignment", SetTextAlignment);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  proto->SetAccessor(String::NewSymbol("patternQuality"), GetPatternQuality, SetPatternQuality);
  proto->SetAccessor(String::NewSymbol("globalCompositeOperation"), GetGlobalCompositeOperation, SetGlobalCompositeOperation);
  proto->SetAccessor(String::NewSymbol("globalAlpha"), GetGlobalAlpha, SetGlobalAlpha);
  proto->SetAccessor(String::NewSymbol("shadowColor"), GetShadowColor, SetShadowColor);
  proto->SetAccessor(String::NewSymbol("fillColor"), GetFillColor);
  proto->SetAccessor(String::NewSymbol("strokeColor"), GetStrokeColor);
  proto->SetAccessor(String::NewSymbol("miterLimit"), GetMiterLimit, SetMiterLimit);
  proto->SetAccessor(String::NewSymbol("lineWidth"), GetLineWidth, SetLineWidth);
  proto->SetAccessor(String::NewSymbol("lineCap"), GetLineCap, SetLineCap);
  proto->SetAccessor(String::NewSymbol("lineJoin"), GetLineJoin, SetLineJoin);
  proto->SetAccessor(String::NewSymbol("shadowOffsetX"), GetShadowOffsetX, SetShadowOffsetX);
  proto->SetAccessor(String::NewSymbol("shadowOffsetY"), GetShadowOffsetY, SetShadowOffsetY);
  proto->SetAccessor(String::NewSymbol("shadowBlur"), GetShadowBlur, SetShadowBlur);
  proto->SetAccessor(String::NewSymbol("antialias"), GetAntiAlias, SetAntiAlias);
  proto->SetAccessor(String::NewSymbol("textDrawingMode"), GetTextDrawingMode, SetTextDrawingMode);
  proto->SetAccessor(String::NewSymbol("filter"), GetFilter, SetFilter);
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  target->Set(String::NewSymbol("CanvasRenderingContext2d"), constructor->GetFunction());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */

  constructor.Reset(Isolate::GetCurrent(), lconstructor);

  target->Set(String::NewSymbol("CanvasRenderingContext2d"), lconstructor->GetFunction());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Create a cairo context.
 */

Context2d::Context2d(Canvas *canvas) {
  _canvas = canvas;
  _context = cairo_create(canvas->surface());
#if HAVE_PANGO
  _layout = pango_cairo_create_layout(_context);
#endif
  cairo_set_line_width(_context, 1);
  state = states[stateno = 0] = (canvas_state_t *) malloc(sizeof(canvas_state_t));
  state->shadowBlur = 0;
  state->shadowOffsetX = state->shadowOffsetY = 0;
  state->globalAlpha = 1;
  state->textAlignment = -1;
  state->fillPattern = state->strokePattern = NULL;
  state->fillGradient = state->strokeGradient = NULL;
  state->textBaseline = TEXT_BASELINE_ALPHABETIC;
  rgba_t transparent = { 0,0,0,1 };
  rgba_t transparent_black = { 0,0,0,0 };
  state->fill = transparent;
  state->stroke = transparent;
  state->shadow = transparent_black;
  state->patternQuality = CAIRO_FILTER_GOOD;
  state->textDrawingMode = TEXT_DRAW_PATHS;
#if HAVE_PANGO
  state->fontWeight = PANGO_WEIGHT_NORMAL;
  state->fontStyle = PANGO_STYLE_NORMAL;
  state->fontSize = 10;
  state->fontFamily = NULL;
  state_assign_fontFamily(state, "sans serif");
  setFontFromState();
#endif
}

/*
 * Destroy cairo context.
 */

Context2d::~Context2d() {
  while(stateno >= 0) {
#if HAVE_PANGO
    free(states[stateno]->fontFamily);
#endif
    free(states[stateno--]);
  }
#if HAVE_PANGO
  g_object_unref(_layout);
#endif
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
#if HAVE_PANGO
  states[stateno]->fontFamily = strndup(state->fontFamily, 100);
#endif
  state = states[stateno];
}

/*
 * Restore state.
 */

void
Context2d::restoreState() {
  if (0 == stateno) return;
  // Olaf (2011-02-21): Free old state data
#if HAVE_PANGO
  free(states[stateno]->fontFamily);
#endif
  free(states[stateno]);
  states[stateno] = NULL;
  state = states[--stateno];
#if HAVE_PANGO
  setFontFromState();
#endif
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
  cairo_new_path(_context);
  cairo_append_path(_context, _path);
  cairo_path_destroy(_path);
}

/*
 * Fill and apply shadow.
 */

void
Context2d::fill(bool preserve) {
  if (state->fillPattern) {
    cairo_set_source(_context, state->fillPattern);
    cairo_pattern_set_extend(cairo_get_source(_context), CAIRO_EXTEND_REPEAT);
    // TODO repeat/repeat-x/repeat-y
  } else if (state->fillGradient) {
    cairo_pattern_set_filter(state->fillGradient, state->patternQuality);
    cairo_set_source(_context, state->fillGradient);
  } else {
    setSourceRGBA(state->fill);
  }

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
  if (state->strokePattern) {
    cairo_set_source(_context, state->strokePattern);
    cairo_pattern_set_extend(cairo_get_source(_context), CAIRO_EXTEND_REPEAT);
  } else if (state->strokeGradient) {
    cairo_pattern_set_filter(state->strokeGradient, state->patternQuality);
    cairo_set_source(_context, state->strokeGradient);
  } else {
    setSourceRGBA(state->stroke);
  }

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
    && (state->shadowBlur || state->shadowOffsetX || state->shadowOffsetY);
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

  free(precalc);
}

/*
 * Initialize a new Context2d with the given canvas.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::New(const Arguments &args) {
  HandleScope scope;
  Local<Object> obj = args[0]->ToObject();
  if (!Canvas::constructor->HasInstance(obj))
    return ThrowException(Exception::TypeError(String::New("Canvas expected")));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::New(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  Local<Object> obj = info[0]->ToObject();
  if (!Local<FunctionTemplate>::New(isolate, Canvas::constructor)->HasInstance(obj))  {
    info.GetReturnValue().Set(ThrowException(Exception::TypeError(String::New("Canvas expected"))));
    return;
  }
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(obj);
  Context2d *context = new Context2d(canvas);
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  context->Wrap(args.This());
  return args.This();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  context->Wrap(info.This());
  info.GetReturnValue().Set(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Create a new page.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::AddPage(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::AddPage(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  if (!context->canvas()->isPDF()) {
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    return ThrowException(Exception::Error(String::New("only PDF canvases support .nextPage()")));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
   info.GetReturnValue().Set(ThrowException(Exception::Error(String::New("only PDF canvases support .nextPage()"))));
   return;
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  }
  cairo_show_page(context->context());
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Put image data.
 *
 *  - imageData, dx, dy
 *  - imageData, dx, dy, sx, sy, sw, sh
 *
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::PutImageData(const Arguments &args) {
  HandleScope scope;

  Local<Object> obj = args[0]->ToObject();
  if (!ImageData::constructor->HasInstance(obj))
    return ThrowException(Exception::TypeError(String::New("ImageData expected")));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::PutImageData(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);

  Local<Object> obj = info[0]->ToObject();
  if (!Local<FunctionTemplate>::New(isolate, ImageData::constructor)->HasInstance(obj)) {
    info.GetReturnValue().Set(ThrowException(Exception::TypeError(String::New("ImageData expected"))));
    return;
  }
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  ImageData *imageData = ObjectWrap::Unwrap<ImageData>(obj);
  PixelArray *arr = imageData->pixelArray();

  uint8_t *src = arr->data();
  uint8_t *dst = context->canvas()->data();

  int srcStride = arr->stride()
    , dstStride = context->canvas()->stride();

  int sx = 0
    , sy = 0
    , sw = 0
    , sh = 0
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    , dx = args[1]->Int32Value()
    , dy = args[2]->Int32Value()
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    , dx = info[1]->Int32Value()
    , dy = info[2]->Int32Value()
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    , rows
    , cols;

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  switch (args.Length()) {
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  switch (info.Length()) {
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    // imageData, dx, dy
    case 3:
      cols = arr->width();
      rows = arr->height();
      break;
    // imageData, dx, dy, sx, sy, sw, sh
    case 7:
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
      sx = args[3]->Int32Value();
      sy = args[4]->Int32Value();
      sw = args[5]->Int32Value();
      sh = args[6]->Int32Value();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
      sx = info[3]->Int32Value();
      sy = info[4]->Int32Value();
      sw = info[5]->Int32Value();
      sh = info[6]->Int32Value();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
      if (sx < 0) sw += sx, sx = 0;
      if (sy < 0) sh += sy, sy = 0;
      if (sx + sw > arr->width()) sw = arr->width() - sx;
      if (sy + sh > arr->height()) sh = arr->height() - sy;
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
      if (sw <= 0 || sh <= 0) return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
      if (sw <= 0 || sh <= 0) {
        info.GetReturnValue().SetUndefined();
        return;
      }
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
      cols = sw;
      rows = sh;
      dx += sx;
      dy += sy;
      break;
    default:
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
      return ThrowException(Exception::Error(String::New("invalid arguments")));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
      info.GetReturnValue().Set(ThrowException(Exception::Error(String::New("invalid v8::FunctionCallbackInfo<T>"))));
      return;
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  }

  uint8_t *srcRows = src + sy * srcStride + sx * 4;
  for (int y = 0; y < rows; ++y) {
    uint32_t *row = (uint32_t *)(dst + dstStride * (y + dy));
    for (int x = 0; x < cols; ++x) {
      int bx = x * 4;
      uint32_t *pixel = row + x + dx;

      // RGBA
      uint8_t a = srcRows[bx + 3];
      uint8_t r = srcRows[bx + 0];
      uint8_t g = srcRows[bx + 1];
      uint8_t b = srcRows[bx + 2];
      float alpha = (float) a / 255;

      // ARGB
      *pixel = a << 24
        | (int)((float) r * alpha) << 16
        | (int)((float) g * alpha) << 8
        | (int)((float) b * alpha);
    }
    srcRows += srcStride;
  }

  cairo_surface_mark_dirty_rectangle(
      context->canvas()->surface()
    , dx
    , dy
    , cols
    , rows);

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Draw image src image to the destination (context).
 *
 *  - dx, dy
 *  - dx, dy, dw, dh
 *  - sx, sy, sw, sh, dx, dy, dw, dh
 *
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::DrawImage(const Arguments &args) {
  HandleScope scope;

  if (args.Length() < 3)
    return ThrowException(Exception::TypeError(String::New("invalid arguments")));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::DrawImage(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);

  if (info.Length() < 3) {
    info.GetReturnValue().Set(ThrowException(Exception::TypeError(String::New("invalid v8::FunctionCallbackInfo<T>"))));
    return;
  }
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

  int sx = 0
    , sy = 0
    , sw = 0
    , sh = 0
    , dx, dy, dw, dh;

  cairo_surface_t *surface;

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  Local<Object> obj = args[0]->ToObject();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Local<Object> obj = info[0]->ToObject();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

  // Image
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  if (Image::constructor->HasInstance(obj)) {
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  if (Local<FunctionTemplate>::New(isolate, Image::constructor)->HasInstance(obj)) {
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    Image *img = ObjectWrap::Unwrap<Image>(obj);
    if (!img->isComplete()) {
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
      return ThrowException(Exception::Error(String::New("Image given has not completed loading")));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
      info.GetReturnValue().Set(ThrowException(Exception::Error(String::New("Image given has not completed loading"))));
      return;
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    }
    sw = img->width;
    sh = img->height;
    surface = img->surface();

  // Canvas
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  } else if (Canvas::constructor->HasInstance(obj)) {
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  } else if (Local<FunctionTemplate>::New(isolate, Canvas::constructor)->HasInstance(obj)) {
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    Canvas *canvas = ObjectWrap::Unwrap<Canvas>(obj);
    sw = canvas->width;
    sh = canvas->height;
    surface = canvas->surface();

  // Invalid
  } else {
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    return ThrowException(Exception::TypeError(String::New("Image or Canvas expected")));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    info.GetReturnValue().Set(ThrowException(Exception::TypeError(String::New("Image or Canvas expected"))));
    return;
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  }

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  cairo_t *ctx = context->context();

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  // Arguments
  switch (args.Length()) {
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  // v8::FunctionCallbackInfo<T>
  switch (info.Length()) {
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    // img, sx, sy, sw, sh, dx, dy, dw, dh
    case 9:
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
      sx = args[1]->NumberValue();
      sy = args[2]->NumberValue();
      sw = args[3]->NumberValue();
      sh = args[4]->NumberValue();
      dx = args[5]->NumberValue();
      dy = args[6]->NumberValue();
      dw = args[7]->NumberValue();
      dh = args[8]->NumberValue();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
      sx = info[1]->NumberValue();
      sy = info[2]->NumberValue();
      sw = info[3]->NumberValue();
      sh = info[4]->NumberValue();
      dx = info[5]->NumberValue();
      dy = info[6]->NumberValue();
      dw = info[7]->NumberValue();
      dh = info[8]->NumberValue();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
      break;
    // img, dx, dy, dw, dh
    case 5:
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
      dx = args[1]->NumberValue();
      dy = args[2]->NumberValue();
      dw = args[3]->NumberValue();
      dh = args[4]->NumberValue();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
      dx = info[1]->NumberValue();
      dy = info[2]->NumberValue();
      dw = info[3]->NumberValue();
      dh = info[4]->NumberValue();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
      break;
    // img, dx, dy
    case 3:
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
      dx = args[1]->NumberValue();
      dy = args[2]->NumberValue();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
      dx = info[1]->NumberValue();
      dy = info[2]->NumberValue();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
      dw = sw;
      dh = sh;
      break;
    default:
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
      return ThrowException(Exception::TypeError(String::New("invalid arguments")));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
      info.GetReturnValue().Set(ThrowException(Exception::TypeError(String::New("invalid v8::FunctionCallbackInfo<T>"))));
      return;
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  }

  // Start draw
  cairo_save(ctx);

  context->savePath();
  cairo_rectangle(ctx, dx, dy, dw, dh);
  cairo_clip(ctx);
  context->restorePath();

  // Scale src
  if (dw != sw || dh != sh) {
    float fx = (float) dw / sw;
    float fy = (float) dh / sh;
    cairo_scale(ctx, fx, fy);
    dx /= fx;
    dy /= fy;
  }

  // Paint
  cairo_set_source_surface(ctx, surface, dx - sx, dy - sy);
  cairo_pattern_set_filter(cairo_get_source(ctx), context->state->patternQuality);
  cairo_paint_with_alpha(ctx, context->state->globalAlpha);

  cairo_restore(ctx);

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Get global alpha.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::GetGlobalAlpha(Local<String> prop, const AccessorInfo &info) {
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
void
Context2d::GetGlobalAlpha(Local<String> prop, const PropertyCallbackInfo<Value> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return scope.Close(Number::New(context->state->globalAlpha));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().Set(Number::New(context->state->globalAlpha));
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Set global alpha.
 */

void
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Context2d::SetGlobalAlpha(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
Context2d::SetGlobalAlpha(Local<String> prop, Local<Value> val, const PropertyCallbackInfo<void> &info) {
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  double n = val->NumberValue();
  if (n >= 0 && n <= 1) {
    Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
    context->state->globalAlpha = n;
  }
}

/*
 * Get global composite operation.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::GetGlobalCompositeOperation(Local<String> prop, const AccessorInfo &info) {
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
void
Context2d::GetGlobalCompositeOperation(Local<String> prop, const PropertyCallbackInfo<Value> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();

  const char *op = "source-over";
  switch (cairo_get_operator(ctx)) {
    case CAIRO_OPERATOR_ATOP: op = "source-atop"; break;
    case CAIRO_OPERATOR_IN: op = "source-in"; break;
    case CAIRO_OPERATOR_OUT: op = "source-out"; break;
    case CAIRO_OPERATOR_XOR: op = "xor"; break;
    case CAIRO_OPERATOR_DEST_ATOP: op = "destination-atop"; break;
    case CAIRO_OPERATOR_DEST_IN: op = "destination-in"; break;
    case CAIRO_OPERATOR_DEST_OUT: op = "destination-out"; break;
    case CAIRO_OPERATOR_DEST_OVER: op = "destination-over"; break;
    case CAIRO_OPERATOR_ADD: op = "lighter"; break;
    case CAIRO_OPERATOR_CLEAR: op = "clear"; break;
    case CAIRO_OPERATOR_SOURCE: op = "source"; break;
    case CAIRO_OPERATOR_DEST: op = "dest"; break;
    case CAIRO_OPERATOR_OVER: op = "over"; break;
    case CAIRO_OPERATOR_SATURATE: op = "saturate"; break;
    // Non-standard
    // supported by resent versions of cairo
#if CAIRO_VERSION_MINOR >= 10
    case CAIRO_OPERATOR_LIGHTEN: op = "lighter"; break;
    case CAIRO_OPERATOR_DARKEN: op = "darker"; break;
    case CAIRO_OPERATOR_MULTIPLY: op = "multiply"; break;
    case CAIRO_OPERATOR_SCREEN: op = "screen"; break;
    case CAIRO_OPERATOR_OVERLAY: op = "overlay"; break;
    case CAIRO_OPERATOR_HARD_LIGHT: op = "hard-light"; break;
    case CAIRO_OPERATOR_SOFT_LIGHT: op = "soft-light"; break;
    case CAIRO_OPERATOR_HSL_HUE: op = "hsl-hue"; break;
    case CAIRO_OPERATOR_HSL_SATURATION: op = "hsl-saturation"; break;
    case CAIRO_OPERATOR_HSL_COLOR: op = "hsl-color"; break;
    case CAIRO_OPERATOR_HSL_LUMINOSITY: op = "hsl-luminosity"; break;
    case CAIRO_OPERATOR_COLOR_DODGE: op = "color-dodge"; break;
    case CAIRO_OPERATOR_COLOR_BURN: op = "color-burn"; break;
    case CAIRO_OPERATOR_DIFFERENCE: op = "difference"; break;
    case CAIRO_OPERATOR_EXCLUSION: op = "exclusion"; break;
#endif
  }

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return scope.Close(String::NewSymbol(op));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().Set(String::NewSymbol(op));
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Set pattern quality.
 */

void
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Context2d::SetPatternQuality(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
Context2d::SetPatternQuality(Local<String> prop, Local<Value> val, const PropertyCallbackInfo<void> &info) {
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  String::AsciiValue quality(val->ToString());
  if (0 == strcmp("fast", *quality)) {
    context->state->patternQuality = CAIRO_FILTER_FAST;
  } else if (0 == strcmp("good", *quality)) {
    context->state->patternQuality = CAIRO_FILTER_GOOD;
  } else if (0 == strcmp("best", *quality)) {
    context->state->patternQuality = CAIRO_FILTER_BEST;
  } else if (0 == strcmp("nearest", *quality)) {
    context->state->patternQuality = CAIRO_FILTER_NEAREST;
  } else if (0 == strcmp("bilinear", *quality)) {
    context->state->patternQuality = CAIRO_FILTER_BILINEAR;
  }
}

/*
 * Get pattern quality.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::GetPatternQuality(Local<String> prop, const AccessorInfo &info) {
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
void
Context2d::GetPatternQuality(Local<String> prop, const PropertyCallbackInfo<Value> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  const char *quality;
  switch (context->state->patternQuality) {
    case CAIRO_FILTER_FAST: quality = "fast"; break;
    case CAIRO_FILTER_BEST: quality = "best"; break;
    case CAIRO_FILTER_NEAREST: quality = "nearest"; break;
    case CAIRO_FILTER_BILINEAR: quality = "bilinear"; break;
    default: quality = "good";
  }
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return scope.Close(String::NewSymbol(quality));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().Set(String::NewSymbol(quality));
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Set global composite operation.
 */

void
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Context2d::SetGlobalCompositeOperation(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
Context2d::SetGlobalCompositeOperation(Local<String> prop, Local<Value> val, const PropertyCallbackInfo<void> &info) {
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();
  String::AsciiValue type(val->ToString());
  if (0 == strcmp("xor", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_XOR);
  } else if (0 == strcmp("source-atop", *type)) {
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
  } else if (0 == strcmp("clear", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_CLEAR);
  } else if (0 == strcmp("source", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_SOURCE);
  } else if (0 == strcmp("dest", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_DEST);
  } else if (0 == strcmp("saturate", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_SATURATE);
  } else if (0 == strcmp("over", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_OVER);
  // Non-standard
  // supported by resent versions of cairo
#if CAIRO_VERSION_MINOR >= 10
  } else if (0 == strcmp("lighter", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_LIGHTEN);
  } else if (0 == strcmp("darker", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_DARKEN);
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
  } else if (0 == strcmp("color-dodge", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_COLOR_DODGE);
  } else if (0 == strcmp("color-burn", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_COLOR_BURN);
  } else if (0 == strcmp("difference", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_DIFFERENCE);
  } else if (0 == strcmp("exclusion", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_EXCLUSION);
#endif
  } else if (0 == strcmp("lighter", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_ADD);
  } else {
    cairo_set_operator(ctx, CAIRO_OPERATOR_OVER);
  }
}

/*
 * Get shadow offset x.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::GetShadowOffsetX(Local<String> prop, const AccessorInfo &info) {
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
void
Context2d::GetShadowOffsetX(Local<String> prop, const PropertyCallbackInfo<Value> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return scope.Close(Number::New(context->state->shadowOffsetX));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().Set(Number::New(context->state->shadowOffsetX));
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Set shadow offset x.
 */

void
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Context2d::SetShadowOffsetX(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
Context2d::SetShadowOffsetX(Local<String> prop, Local<Value> val, const PropertyCallbackInfo<void> &info) {
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  context->state->shadowOffsetX = val->NumberValue();
}

/*
 * Get shadow offset y.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::GetShadowOffsetY(Local<String> prop, const AccessorInfo &info) {
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
void
Context2d::GetShadowOffsetY(Local<String> prop, const PropertyCallbackInfo<Value> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return scope.Close(Number::New(context->state->shadowOffsetY));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().Set(Number::New(context->state->shadowOffsetY));
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Set shadow offset y.
 */

void
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Context2d::SetShadowOffsetY(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
Context2d::SetShadowOffsetY(Local<String> prop, Local<Value> val, const PropertyCallbackInfo<void> &info) {
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  context->state->shadowOffsetY = val->NumberValue();
}

/*
 * Get shadow blur.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::GetShadowBlur(Local<String> prop, const AccessorInfo &info) {
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
void
Context2d::GetShadowBlur(Local<String> prop, const PropertyCallbackInfo<Value> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return scope.Close(Number::New(context->state->shadowBlur));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().Set(Number::New(context->state->shadowBlur));
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Set shadow blur.
 */

void
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Context2d::SetShadowBlur(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
Context2d::SetShadowBlur(Local<String> prop, Local<Value> val, const PropertyCallbackInfo<void> &info) {
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  int n = val->NumberValue();
  if (n >= 0) {
    Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
    context->state->shadowBlur = n;
  }
}

/*
 * Get current antialiasing setting.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::GetAntiAlias(Local<String> prop, const AccessorInfo &info) {
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
void
Context2d::GetAntiAlias(Local<String> prop, const PropertyCallbackInfo<Value> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  const char *aa;
  switch (cairo_get_antialias(context->context())) {
    case CAIRO_ANTIALIAS_NONE: aa = "none"; break;
    case CAIRO_ANTIALIAS_GRAY: aa = "gray"; break;
    case CAIRO_ANTIALIAS_SUBPIXEL: aa = "subpixel"; break;
    default: aa = "default";
  }
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return scope.Close(String::NewSymbol(aa));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().Set(String::NewSymbol(aa));
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Set antialiasing.
 */

void
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Context2d::SetAntiAlias(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
Context2d::SetAntiAlias(Local<String> prop, Local<Value> val, const PropertyCallbackInfo<void> &info) {
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
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
 * Get text drawing mode.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::GetTextDrawingMode(Local<String> prop, const AccessorInfo &info) {
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
void
Context2d::GetTextDrawingMode(Local<String> prop, const PropertyCallbackInfo<Value> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  const char *mode;
  if (context->state->textDrawingMode == TEXT_DRAW_PATHS) {
    mode = "path";
  } else if (context->state->textDrawingMode == TEXT_DRAW_GLYPHS) {
    mode = "glyph";
  } else {
    mode = "unknown";
  }
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return scope.Close(String::NewSymbol(mode));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().Set(String::NewSymbol(mode));
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Set text drawing mode.
 */

void
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Context2d::SetTextDrawingMode(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
Context2d::SetTextDrawingMode(Local<String> prop, Local<Value> val, const PropertyCallbackInfo<void> &info) {
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  String::AsciiValue str(val->ToString());
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  if (0 == strcmp("path", *str)) {
    context->state->textDrawingMode = TEXT_DRAW_PATHS;
  } else if (0 == strcmp("glyph", *str)) {
    context->state->textDrawingMode = TEXT_DRAW_GLYPHS;
  }
}

/*
 * Get filter.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::GetFilter(Local<String> prop, const AccessorInfo &info) {
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
void
Context2d::GetFilter(Local<String> prop, const PropertyCallbackInfo<Value> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  const char *filter;
  switch (cairo_pattern_get_filter(cairo_get_source(context->context()))) {
    case CAIRO_FILTER_FAST: filter = "fast"; break;
    case CAIRO_FILTER_BEST: filter = "best"; break;
    case CAIRO_FILTER_NEAREST: filter = "nearest"; break;
    case CAIRO_FILTER_BILINEAR: filter = "bilinear"; break;
    default: filter = "good";
  }
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return scope.Close(String::NewSymbol(filter));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().Set(String::NewSymbol(filter));
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Set filter.
 */

void
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Context2d::SetFilter(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
Context2d::SetFilter(Local<String> prop, Local<Value> val, const PropertyCallbackInfo<void> &info) {
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  String::AsciiValue str(val->ToString());
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_filter_t filter;
  if (0 == strcmp("fast", *str)) {
    filter = CAIRO_FILTER_FAST;
  } else if (0 == strcmp("best", *str)) {
    filter = CAIRO_FILTER_BEST;
  } else if (0 == strcmp("nearest", *str)) {
    filter = CAIRO_FILTER_NEAREST;
  } else if (0 == strcmp("bilinear", *str)) {
    filter = CAIRO_FILTER_BILINEAR;
  } else {
    filter = CAIRO_FILTER_GOOD;
  }
  cairo_pattern_set_filter(cairo_get_source(context->context()), filter);
}

/*
 * Get miter limit.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::GetMiterLimit(Local<String> prop, const AccessorInfo &info) {
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
void
Context2d::GetMiterLimit(Local<String> prop, const PropertyCallbackInfo<Value> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return scope.Close(Number::New(cairo_get_miter_limit(context->context())));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().Set(Number::New(cairo_get_miter_limit(context->context())));
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Set miter limit.
 */

void
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Context2d::SetMiterLimit(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
Context2d::SetMiterLimit(Local<String> prop, Local<Value> val, const PropertyCallbackInfo<void> &info) {
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  double n = val->NumberValue();
  if (n > 0) {
    Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
    cairo_set_miter_limit(context->context(), n);
  }
}

/*
 * Get line width.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::GetLineWidth(Local<String> prop, const AccessorInfo &info) {
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
void
Context2d::GetLineWidth(Local<String> prop, const PropertyCallbackInfo<Value> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return scope.Close(Number::New(cairo_get_line_width(context->context())));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().Set(Number::New(cairo_get_line_width(context->context())));
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Set line width.
 */

void
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Context2d::SetLineWidth(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
Context2d::SetLineWidth(Local<String> prop, Local<Value> val, const PropertyCallbackInfo<void> &info) {
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  double n = val->NumberValue();
  if (n > 0) {
    Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
    cairo_set_line_width(context->context(), n);
  }
}

/*
 * Get line join.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::GetLineJoin(Local<String> prop, const AccessorInfo &info) {
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
void
Context2d::GetLineJoin(Local<String> prop, const PropertyCallbackInfo<Value> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  const char *join;
  switch (cairo_get_line_join(context->context())) {
    case CAIRO_LINE_JOIN_BEVEL: join = "bevel"; break;
    case CAIRO_LINE_JOIN_ROUND: join = "round"; break;
    default: join = "miter";
  }
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return scope.Close(String::NewSymbol(join));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().Set(String::NewSymbol(join));
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Set line join.
 */

void
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Context2d::SetLineJoin(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
Context2d::SetLineJoin(Local<String> prop, Local<Value> val, const PropertyCallbackInfo<void> &info) {
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
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

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::GetLineCap(Local<String> prop, const AccessorInfo &info) {
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
void
Context2d::GetLineCap(Local<String> prop, const PropertyCallbackInfo<Value> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  const char *cap;
  switch (cairo_get_line_cap(context->context())) {
    case CAIRO_LINE_CAP_ROUND: cap = "round"; break;
    case CAIRO_LINE_CAP_SQUARE: cap = "square"; break;
    default: cap = "butt";
  }
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return scope.Close(String::NewSymbol(cap));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().Set(String::NewSymbol(cap));
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Set line cap.
 */

void
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Context2d::SetLineCap(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
Context2d::SetLineCap(Local<String> prop, Local<Value> val, const PropertyCallbackInfo<void> &info) {
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
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

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::IsPointInPath(const Arguments &args) {
  HandleScope scope;
  if (args[0]->IsNumber() && args[1]->IsNumber()) {
    Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::IsPointInPath(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  if (info[0]->IsNumber() && info[1]->IsNumber()) {
    Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    cairo_t *ctx = context->context();
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    double x = args[0]->NumberValue()
         , y = args[1]->NumberValue();
    return scope.Close(Boolean::New(cairo_in_fill(ctx, x, y) || cairo_in_stroke(ctx, x, y)));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    double x = info[0]->NumberValue()
         , y = info[1]->NumberValue();
    info.GetReturnValue().Set(Boolean::New(cairo_in_fill(ctx, x, y) || cairo_in_stroke(ctx, x, y)));
  } else {
    info.GetReturnValue().Set(False());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  }
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return False();
#endif /* ! NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Set fill pattern, used internally for fillStyle=
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::SetFillPattern(const Arguments &args) {
  HandleScope scope;

  Local<Object> obj = args[0]->ToObject();
  if (Gradient::constructor->HasInstance(obj)){
    Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::SetFillPattern(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);

  Local<Object> obj = info[0]->ToObject();
  if (Local<FunctionTemplate>::New(isolate, Gradient::constructor)->HasInstance(obj)){
    Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    Gradient *grad = ObjectWrap::Unwrap<Gradient>(obj);
    context->state->fillGradient = grad->pattern();
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  } else if(Pattern::constructor->HasInstance(obj)){
    Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  } else if(Local<FunctionTemplate>::New(isolate, Pattern::constructor)->HasInstance(obj)){
    Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    Pattern *pattern = ObjectWrap::Unwrap<Pattern>(obj);
    context->state->fillPattern = pattern->pattern();
  } else {
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    return ThrowException(Exception::TypeError(String::New("Gradient or Pattern expected")));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    info.GetReturnValue().Set(ThrowException(Exception::TypeError(String::New("Gradient or Pattern expected"))));
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
 * Set stroke pattern, used internally for strokeStyle=
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::SetStrokePattern(const Arguments &args) {
  HandleScope scope;

  Local<Object> obj = args[0]->ToObject();
  if (Gradient::constructor->HasInstance(obj)){
    Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::SetStrokePattern(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);

  Local<Object> obj = info[0]->ToObject();
  if (Local<FunctionTemplate>::New(isolate, Gradient::constructor)->HasInstance(obj)){
    Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    Gradient *grad = ObjectWrap::Unwrap<Gradient>(obj);
    context->state->strokeGradient = grad->pattern();
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  } else if(Pattern::constructor->HasInstance(obj)){
    Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  } else if(Local<FunctionTemplate>::New(isolate, Pattern::constructor)->HasInstance(obj)){
    Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    Pattern *pattern = ObjectWrap::Unwrap<Pattern>(obj);
    context->state->strokePattern = pattern->pattern();
  } else {
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    return ThrowException(Exception::TypeError(String::New("Gradient or Pattern expected")));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    info.GetReturnValue().Set(ThrowException(Exception::TypeError(String::New("Gradient or Pattern expected"))));
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
 * Set shadow color.
 */

void
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Context2d::SetShadowColor(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
Context2d::SetShadowColor(Local<String> prop, Local<Value> val, const PropertyCallbackInfo<void> &info) {
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  short ok;
  String::AsciiValue str(val->ToString());
  uint32_t rgba = rgba_from_string(*str, &ok);
  if (ok) {
    Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
    context->state->shadow = rgba_create(rgba);
  }
}

/*
 * Get shadow color.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::GetShadowColor(Local<String> prop, const AccessorInfo &info) {
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
void
Context2d::GetShadowColor(Local<String> prop, const PropertyCallbackInfo<Value> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  char buf[64];
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  rgba_to_string(context->state->shadow, buf, sizeof(buf));
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return scope.Close(String::New(buf));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().Set(String::New(buf));
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Set fill color, used internally for fillStyle=
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::SetFillColor(const Arguments &args) {
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::SetFillColor(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  short ok;
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  if (!args[0]->IsString()) return Undefined();
  String::AsciiValue str(args[0]);
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  if (!info[0]->IsString()) {
    info.GetReturnValue().SetUndefined();
    return;
  }
  String::AsciiValue str(info[0]);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  uint32_t rgba = rgba_from_string(*str, &ok);
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  if (!ok) return Undefined();
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  if (!ok) {
    info.GetReturnValue().SetUndefined();
    return;
  }
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  context->state->fillPattern = context->state->fillGradient = NULL;
  context->state->fill = rgba_create(rgba);
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Get fill color.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::GetFillColor(Local<String> prop, const AccessorInfo &info) {
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
void
Context2d::GetFillColor(Local<String> prop, const PropertyCallbackInfo<Value> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  char buf[64];
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  rgba_to_string(context->state->fill, buf, sizeof(buf));
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return scope.Close(String::New(buf));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().Set(String::New(buf));
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Set stroke color, used internally for strokeStyle=
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::SetStrokeColor(const Arguments &args) {
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::SetStrokeColor(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  short ok;
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  if (!args[0]->IsString()) return Undefined();
  String::AsciiValue str(args[0]);
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  if (!info[0]->IsString()) {
    info.GetReturnValue().SetUndefined();
    return;
  }
  String::AsciiValue str(info[0]);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  uint32_t rgba = rgba_from_string(*str, &ok);
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  if (!ok) return Undefined();
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  if (!ok) {
    info.GetReturnValue().SetUndefined();
    return;
  }
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  context->state->strokePattern = context->state->strokeGradient = NULL;
  context->state->stroke = rgba_create(rgba);
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Get stroke color.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::GetStrokeColor(Local<String> prop, const AccessorInfo &info) {
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
void
Context2d::GetStrokeColor(Local<String> prop, const PropertyCallbackInfo<Value> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  char buf[64];
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  rgba_to_string(context->state->stroke, buf, sizeof(buf));
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return scope.Close(String::New(buf));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().Set(String::New(buf));
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Bezier curve.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::BezierCurveTo(const Arguments &args) {
  HandleScope scope;

  if (!args[0]->IsNumber()
    ||!args[1]->IsNumber()
    ||!args[2]->IsNumber()
    ||!args[3]->IsNumber()
    ||!args[4]->IsNumber()
    ||!args[5]->IsNumber()) return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::BezierCurveTo(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);

  if (!info[0]->IsNumber()
    ||!info[1]->IsNumber()
    ||!info[2]->IsNumber()
    ||!info[3]->IsNumber()
    ||!info[4]->IsNumber()
    ||!info[5]->IsNumber()) {
    info.GetReturnValue().SetUndefined();
    return;
  }
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  cairo_curve_to(context->context()
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    , args[0]->NumberValue()
    , args[1]->NumberValue()
    , args[2]->NumberValue()
    , args[3]->NumberValue()
    , args[4]->NumberValue()
    , args[5]->NumberValue());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    , info[0]->NumberValue()
    , info[1]->NumberValue()
    , info[2]->NumberValue()
    , info[3]->NumberValue()
    , info[4]->NumberValue()
    , info[5]->NumberValue());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Quadratic curve approximation from libsvg-cairo.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::QuadraticCurveTo(const Arguments &args) {
  HandleScope scope;

  if (!args[0]->IsNumber()
    ||!args[1]->IsNumber()
    ||!args[2]->IsNumber()
    ||!args[3]->IsNumber()) return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::QuadraticCurveTo(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);

  if (!info[0]->IsNumber()
    ||!info[1]->IsNumber()
    ||!info[2]->IsNumber()
    ||!info[3]->IsNumber()) {
    info.GetReturnValue().SetUndefined();
    return;
  }
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  cairo_t *ctx = context->context();

  double x, y
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    , x1 = args[0]->NumberValue()
    , y1 = args[1]->NumberValue()
    , x2 = args[2]->NumberValue()
    , y2 = args[3]->NumberValue();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    , x1 = info[0]->NumberValue()
    , y1 = info[1]->NumberValue()
    , x2 = info[2]->NumberValue()
    , y2 = info[3]->NumberValue();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

  cairo_get_current_point(ctx, &x, &y);

  if (0 == x && 0 == y) {
    x = x1;
    y = y1;
  }

  cairo_curve_to(ctx
    , x  + 2.0 / 3.0 * (x1 - x),  y  + 2.0 / 3.0 * (y1 - y)
    , x2 + 2.0 / 3.0 * (x1 - x2), y2 + 2.0 / 3.0 * (y1 - y2)
    , x2
    , y2);

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Save state.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::Save(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::Save(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  context->save();
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Restore state.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::Restore(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::Restore(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  context->restore();
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Creates a new subpath.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::BeginPath(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::BeginPath(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  cairo_new_path(context->context());
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Marks the subpath as closed.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::ClosePath(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::ClosePath(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  cairo_close_path(context->context());
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Rotate transformation.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::Rotate(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::Rotate(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  cairo_rotate(context->context()
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    , args[0]->IsNumber() ? args[0]->NumberValue() : 0);
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    , info[0]->IsNumber() ? info[0]->NumberValue() : 0);
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Modify the CTM.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::Transform(const Arguments &args) {
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::Transform(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

  cairo_matrix_t matrix;
  cairo_matrix_init(&matrix
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    , args[0]->IsNumber() ? args[0]->NumberValue() : 0
    , args[1]->IsNumber() ? args[1]->NumberValue() : 0
    , args[2]->IsNumber() ? args[2]->NumberValue() : 0
    , args[3]->IsNumber() ? args[3]->NumberValue() : 0
    , args[4]->IsNumber() ? args[4]->NumberValue() : 0
    , args[5]->IsNumber() ? args[5]->NumberValue() : 0);
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    , info[0]->IsNumber() ? info[0]->NumberValue() : 0
    , info[1]->IsNumber() ? info[1]->NumberValue() : 0
    , info[2]->IsNumber() ? info[2]->NumberValue() : 0
    , info[3]->IsNumber() ? info[3]->NumberValue() : 0
    , info[4]->IsNumber() ? info[4]->NumberValue() : 0
    , info[5]->IsNumber() ? info[5]->NumberValue() : 0);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  cairo_transform(context->context(), &matrix);

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Reset the CTM, used internally by setTransform().
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::ResetTransform(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::ResetTransform(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  cairo_identity_matrix(context->context());
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Translate transformation.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::Translate(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::Translate(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  cairo_translate(context->context()
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    , args[0]->IsNumber() ? args[0]->NumberValue() : 0
    , args[1]->IsNumber() ? args[1]->NumberValue() : 0);
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    , info[0]->IsNumber() ? info[0]->NumberValue() : 0
    , info[1]->IsNumber() ? info[1]->NumberValue() : 0);
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Scale transformation.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::Scale(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::Scale(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  cairo_scale(context->context()
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    , args[0]->IsNumber() ? args[0]->NumberValue() : 0
    , args[1]->IsNumber() ? args[1]->NumberValue() : 0);
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    , info[0]->IsNumber() ? info[0]->NumberValue() : 0
    , info[1]->IsNumber() ? info[1]->NumberValue() : 0);
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Use path as clipping region.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::Clip(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::Clip(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  cairo_t *ctx = context->context();
  cairo_clip_preserve(ctx);
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Fill the path.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::Fill(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::Fill(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  context->fill(true);
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Stroke the path.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::Stroke(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::Stroke(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  context->stroke(true);
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Fill text at (x, y).
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::FillText(const Arguments &args) {
  HandleScope scope;

  if (!args[1]->IsNumber()
    || !args[2]->IsNumber()) return Undefined();

  String::Utf8Value str(args[0]->ToString());
  double x = args[1]->NumberValue();
  double y = args[2]->NumberValue();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::FillText(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);

  if (!info[1]->IsNumber()
    || !info[2]->IsNumber()) {
    info.GetReturnValue().SetUndefined();
    return;
  }

  String::Utf8Value str(info[0]->ToString());
  double x = info[1]->NumberValue();
  double y = info[2]->NumberValue();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

  context->savePath();
  if (context->state->textDrawingMode == TEXT_DRAW_GLYPHS) {
    context->fill();
    context->setTextPath(*str, x, y);
  } else if (context->state->textDrawingMode == TEXT_DRAW_PATHS) {
    context->setTextPath(*str, x, y);
    context->fill();
  }
  context->restorePath();

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Stroke text at (x ,y).
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::StrokeText(const Arguments &args) {
  HandleScope scope;

  if (!args[1]->IsNumber()
    || !args[2]->IsNumber()) return Undefined();

  String::Utf8Value str(args[0]->ToString());
  double x = args[1]->NumberValue();
  double y = args[2]->NumberValue();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::StrokeText(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);

  if (!info[1]->IsNumber()
    || !info[2]->IsNumber()) {
    info.GetReturnValue().SetUndefined();
    return;
  }

  String::Utf8Value str(info[0]->ToString());
  double x = info[1]->NumberValue();
  double y = info[2]->NumberValue();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

  context->savePath();
  if (context->state->textDrawingMode == TEXT_DRAW_GLYPHS) {
    context->stroke();
    context->setTextPath(*str, x, y);
  } else if (context->state->textDrawingMode == TEXT_DRAW_PATHS) {
    context->setTextPath(*str, x, y);
    context->stroke();
  }
  context->restorePath();

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Set text path for the given string at (x, y).
 */

void
Context2d::setTextPath(const char *str, double x, double y) {
#if HAVE_PANGO

  PangoRectangle ink_rect, logical_rect;
  PangoFontMetrics *metrics = NULL;

  pango_layout_set_text(_layout, str, -1);
  pango_cairo_update_layout(_context, _layout);

  switch (state->textAlignment) {
    // center
    case 0:
      pango_layout_get_pixel_extents(_layout, &ink_rect, &logical_rect);
      x -= logical_rect.width / 2;
      break;
    // right
    case 1:
      pango_layout_get_pixel_extents(_layout, &ink_rect, &logical_rect);
      x -= logical_rect.width;
      break;
  }

  switch (state->textBaseline) {
    case TEXT_BASELINE_ALPHABETIC:
      metrics = PANGO_LAYOUT_GET_METRICS(_layout);
      y -= pango_font_metrics_get_ascent(metrics) / PANGO_SCALE;
      break;
    case TEXT_BASELINE_MIDDLE:
      metrics = PANGO_LAYOUT_GET_METRICS(_layout);
      y -= (pango_font_metrics_get_ascent(metrics) + pango_font_metrics_get_descent(metrics))/(2.0 * PANGO_SCALE);
      break;
    case TEXT_BASELINE_BOTTOM:
      metrics = PANGO_LAYOUT_GET_METRICS(_layout);
      y -= (pango_font_metrics_get_ascent(metrics) + pango_font_metrics_get_descent(metrics)) / PANGO_SCALE;
      break;
  }

  if (metrics) pango_font_metrics_unref(metrics);

  cairo_move_to(_context, x, y);
  if (state->textDrawingMode == TEXT_DRAW_PATHS) {
    pango_cairo_layout_path(_context, _layout);
  } else if (state->textDrawingMode == TEXT_DRAW_GLYPHS) {
    pango_cairo_show_layout(_context, _layout);
  }

#else

  cairo_text_extents_t te;
  cairo_font_extents_t fe;

  // Alignment
  switch (state->textAlignment) {
    // center
    case 0:
      // Olaf (2011-02-19): te.x_bearing does not concern the alignment
      cairo_text_extents(_context, str, &te);
      x -= te.width / 2;
      break;
    // right
    case 1:
      // Olaf (2011-02-19): te.x_bearing does not concern the alignment
      cairo_text_extents(_context, str, &te);
      x -= te.width;
      break;
  }

  // Baseline approx
  switch (state->textBaseline) {
    case TEXT_BASELINE_TOP:
    case TEXT_BASELINE_HANGING:
      // Olaf (2011-02-26): fe.ascent approximates the distance between
      // the top of the em square and the alphabetic baseline
      cairo_font_extents(_context, &fe);
      y += fe.ascent;
      break;
    case TEXT_BASELINE_MIDDLE:
      // Olaf (2011-02-26): fe.ascent approximates the distance between
      // the top of the em square and the alphabetic baseline
      cairo_font_extents(_context, &fe);
      y += (fe.ascent - fe.descent)/2;
      break;
    case TEXT_BASELINE_BOTTOM:
      // Olaf (2011-02-26): we need to know the distance between the alphabetic
      // baseline and the bottom of the em square
      cairo_font_extents(_context, &fe);
      y -= fe.descent;
      break;
  }

  cairo_move_to(_context, x, y);
  if (state->textDrawingMode == TEXT_DRAW_PATHS) {
    cairo_text_path(_context, str);
  } else if (state->textDrawingMode == TEXT_DRAW_GLYPHS) {
    cairo_show_text(_context, str);
  }

#endif
}

/*
 * Adds a point to the current subpath.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::LineTo(const Arguments &args) {
  HandleScope scope;

  if (!args[0]->IsNumber())
    return ThrowException(Exception::TypeError(String::New("lineTo() x must be a number")));
  if (!args[1]->IsNumber())
    return ThrowException(Exception::TypeError(String::New("lineTo() y must be a number")));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::LineTo(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);

  if (!info[0]->IsNumber()) {
    info.GetReturnValue().Set(ThrowException(Exception::TypeError(String::New("lineTo() x must be a number"))));
    return;
  }
  if (!info[1]->IsNumber()) {
    info.GetReturnValue().Set(ThrowException(Exception::TypeError(String::New("lineTo() y must be a number"))));
    return;
  }
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  cairo_line_to(context->context()
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    , args[0]->NumberValue()
    , args[1]->NumberValue());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    , info[0]->NumberValue()
    , info[1]->NumberValue());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Creates a new subpath at the given point.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::MoveTo(const Arguments &args) {
  HandleScope scope;

  if (!args[0]->IsNumber())
    return ThrowException(Exception::TypeError(String::New("moveTo() x must be a number")));
  if (!args[1]->IsNumber())
    return ThrowException(Exception::TypeError(String::New("moveTo() y must be a number")));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::MoveTo(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);

  if (!info[0]->IsNumber()) {
    info.GetReturnValue().Set(ThrowException(Exception::TypeError(String::New("moveTo() x must be a number"))));
    return;
  }
  if (!info[1]->IsNumber()) {
    info.GetReturnValue().Set(ThrowException(Exception::TypeError(String::New("moveTo() y must be a number"))));
    return;
  }
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  cairo_move_to(context->context()
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    , args[0]->NumberValue()
    , args[1]->NumberValue());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    , info[0]->NumberValue()
    , info[1]->NumberValue());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Set font face.
 */

#ifdef HAVE_FREETYPE
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::SetFontFace(const Arguments &args) {
  HandleScope scope;

  // Ignore invalid args
  if (!args[0]->IsObject()
    || !args[1]->IsNumber())
    return ThrowException(Exception::TypeError(String::New("Expected object and number")));

  Local<Object> obj = args[0]->ToObject();

  if (!FontFace::constructor->HasInstance(obj))
    return ThrowException(Exception::TypeError(String::New("FontFace expected")));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::SetFontFace(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);

  // Ignore invalid info
  if (!info[0]->IsObject()
    || !info[1]->IsNumber()) {
    info.GetReturnValue().Set(ThrowException(Exception::TypeError(String::New("Expected object and number"))));
    return;
  }

  Local<Object> obj = info[0]->ToObject();

  if (!Local<FunctionTemplate>::New(isolate, FontFace::constructor)->HasInstance(obj)) {
    info.GetReturnValue().Set(ThrowException(Exception::TypeError(String::New("FontFace expected"))));
    return;
  }
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

  FontFace *face = ObjectWrap::Unwrap<FontFace>(obj);
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  double size = args[1]->NumberValue();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  double size = info[1]->NumberValue();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  cairo_t *ctx = context->context();

  cairo_set_font_size(ctx, size);
  cairo_set_font_face(ctx, face->cairoFace());

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}
#endif

/*
 * Set font:
 *   - weight
 *   - style
 *   - size
 *   - unit
 *   - family
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
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
  String::AsciiValue family(args[4]);
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::SetFont(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);

  // Ignore invalid info
  if (!info[0]->IsString()
    || !info[1]->IsString()
    || !info[2]->IsNumber()
    || !info[3]->IsString()
    || !info[4]->IsString()) {
    info.GetReturnValue().SetUndefined();
  }

  String::AsciiValue weight(info[0]);
  String::AsciiValue style(info[1]);
  double size = info[2]->NumberValue();
  String::AsciiValue unit(info[3]);
  String::AsciiValue family(info[4]);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

#if HAVE_PANGO

  if (strlen(*family) > 0) state_assign_fontFamily(context->state, *family);

  if (size > 0) context->state->fontSize = size;

  PangoStyle s = PANGO_STYLE_NORMAL;
  if (strlen(*style) > 0) {
    if (0 == strcmp("italic", *style)) {
      s = PANGO_STYLE_ITALIC;
    } else if (0 == strcmp("oblique", *style)) {
      s = PANGO_STYLE_OBLIQUE;
    }
  }
  context->state->fontStyle = s;

  PangoWeight w = PANGO_WEIGHT_NORMAL;
  if (strlen(*weight) > 0) {
    if (0 == strcmp("bold", *weight)) {
      w = PANGO_WEIGHT_BOLD;
    } else if (0 == strcmp("200", *weight)) {
      w = PANGO_WEIGHT_ULTRALIGHT;
    } else if (0 == strcmp("300", *weight)) {
      w = PANGO_WEIGHT_LIGHT;
    } else if (0 == strcmp("400", *weight)) {
      w = PANGO_WEIGHT_NORMAL;
    } else if (0 == strcmp("500", *weight)) {
      w = PANGO_WEIGHT_MEDIUM;
    } else if (0 == strcmp("600", *weight)) {
      w = PANGO_WEIGHT_SEMIBOLD;
    } else if (0 == strcmp("700", *weight)) {
      w = PANGO_WEIGHT_BOLD;
    } else if (0 == strcmp("800", *weight)) {
      w = PANGO_WEIGHT_ULTRABOLD;
    } else if (0 == strcmp("900", *weight)) {
      w = PANGO_WEIGHT_HEAVY;
    }
  }
  context->state->fontWeight = w;

  context->setFontFromState();

#else

  cairo_t *ctx = context->context();

  // Size
  cairo_set_font_size(ctx, size);

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

  cairo_select_font_face(ctx, *family, s, w);

#endif

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

#if HAVE_PANGO

/*
 * Sets PangoLayout options from the current font state
 */

void
Context2d::setFontFromState() {
  PangoFontDescription *fd = pango_font_description_new();

  pango_font_description_set_family(fd, state->fontFamily);
  pango_font_description_set_absolute_size(fd, state->fontSize * PANGO_SCALE);
  pango_font_description_set_style(fd, state->fontStyle);
  pango_font_description_set_weight(fd, state->fontWeight);

  pango_layout_set_font_description(_layout, fd);
  pango_font_description_free(fd);
}

#endif

/*
 * Return the given text extents.
 * TODO: Support for:
 * hangingBaseline, ideographicBaseline,
 * fontBoundingBoxAscent, fontBoundingBoxDescent
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::MeasureText(const Arguments &args) {
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::MeasureText(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  cairo_t *ctx = context->context();

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  String::Utf8Value str(args[0]->ToString());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  String::Utf8Value str(info[0]->ToString());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Local<Object> obj = Object::New();

#if HAVE_PANGO

  PangoRectangle ink_rect, logical_rect;
  PangoFontMetrics *metrics;
  PangoLayout *layout = context->layout();

  pango_layout_set_text(layout, *str, -1);
  pango_cairo_update_layout(ctx, layout);

  pango_layout_get_pixel_extents(layout, &ink_rect, &logical_rect);
  metrics = PANGO_LAYOUT_GET_METRICS(layout);

  double x_offset;
  switch (context->state->textAlignment) {
    case 0: // center
      x_offset = logical_rect.width / 2;
      break;
    case 1: // right
      x_offset = logical_rect.width;
      break;
    default: // left
      x_offset = 0.0;
  }

  double y_offset;
  switch (context->state->textBaseline) {
    case TEXT_BASELINE_ALPHABETIC:
      y_offset = -pango_font_metrics_get_ascent(metrics) / PANGO_SCALE;
      break;
    case TEXT_BASELINE_MIDDLE:
      y_offset = -(pango_font_metrics_get_ascent(metrics) + pango_font_metrics_get_descent(metrics))/(2.0 * PANGO_SCALE);
      break;
    case TEXT_BASELINE_BOTTOM:
      y_offset = -(pango_font_metrics_get_ascent(metrics) + pango_font_metrics_get_descent(metrics)) / PANGO_SCALE;
      break;
    default:
      y_offset = 0.0;
  }

  obj->Set(String::New("width"), Number::New(logical_rect.width));
  obj->Set(String::New("actualBoundingBoxLeft"),
           Number::New(x_offset - PANGO_LBEARING(logical_rect)));
  obj->Set(String::New("actualBoundingBoxRight"),
           Number::New(x_offset + PANGO_RBEARING(logical_rect)));
  obj->Set(String::New("actualBoundingBoxAscent"),
           Number::New(-(y_offset+ink_rect.y)));
  obj->Set(String::New("actualBoundingBoxDescent"),
           Number::New((PANGO_DESCENT(ink_rect) + y_offset)));
  obj->Set(String::New("emHeightAscent"),
           Number::New(PANGO_ASCENT(logical_rect) - y_offset));
  obj->Set(String::New("emHeightDescent"),
           Number::New(PANGO_DESCENT(logical_rect) + y_offset));
  obj->Set(String::New("alphabeticBaseline"),
           Number::New((pango_font_metrics_get_ascent(metrics) / PANGO_SCALE)
                       + y_offset));

  pango_font_metrics_unref(metrics);

#else

  cairo_text_extents_t te;
  cairo_font_extents_t fe;

  cairo_text_extents(ctx, *str, &te);
  cairo_font_extents(ctx, &fe);

  double x_offset;
  switch (context->state->textAlignment) {
    case 0: // center
      x_offset = te.width / 2;
      break;
    case 1: // right
      x_offset = te.width;
      break;
    default: // left
      x_offset = 0.0;
  }

  double y_offset;
  switch (context->state->textBaseline) {
    case TEXT_BASELINE_TOP:
    case TEXT_BASELINE_HANGING:
      y_offset = fe.ascent;
      break;
    case TEXT_BASELINE_MIDDLE:
      y_offset = (fe.ascent - fe.descent)/2;
      break;
    case TEXT_BASELINE_BOTTOM:
      y_offset = -fe.descent;
      break;
    default:
      y_offset = 0.0;
  }

  obj->Set(String::New("width"), Number::New(te.x_advance));
  obj->Set(String::New("actualBoundingBoxLeft"),
           Number::New(x_offset - te.x_bearing));
  obj->Set(String::New("actualBoundingBoxRight"),
           Number::New((te.x_bearing + te.width) - x_offset));
  obj->Set(String::New("actualBoundingBoxAscent"),
           Number::New(-(te.y_bearing + y_offset)));
  obj->Set(String::New("actualBoundingBoxDescent"),
           Number::New(te.height + te.y_bearing + y_offset));
  obj->Set(String::New("emHeightAscent"), Number::New(fe.ascent - y_offset));
  obj->Set(String::New("emHeightDescent"), Number::New(fe.descent + y_offset));
  obj->Set(String::New("alphabeticBaseline"), Number::New(y_offset));

#endif

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return scope.Close(obj);
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().Set(obj);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Set text baseline.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::SetTextBaseline(const Arguments &args) {
  HandleScope scope;

  if (!args[0]->IsInt32()) return Undefined();
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  context->state->textBaseline = args[0]->Int32Value();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::SetTextBaseline(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  if (!info[0]->IsInt32()) {
    info.GetReturnValue().SetUndefined();
    return;
  }
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  context->state->textBaseline = info[0]->Int32Value();

  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Set text alignment. -1 0 1
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::SetTextAlignment(const Arguments &args) {
  HandleScope scope;

  if (!args[0]->IsInt32()) return Undefined();
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  context->state->textAlignment = args[0]->Int32Value();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::SetTextAlignment(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);

  if (!info[0]->IsInt32()) {
    info.GetReturnValue().SetUndefined();
    return;
  }
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  context->state->textAlignment = info[0]->Int32Value();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Fill the rectangle defined by x, y, width and height.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::FillRect(const Arguments &args) {
  HandleScope scope;
  RECT_ARGS;
  if (0 == width || 0 == height) return Undefined();
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::FillRect(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  RECT_INFO;
  if (0 == width || 0 == height) {
    info.GetReturnValue().SetUndefined();
    return;
  }
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  cairo_t *ctx = context->context();
  context->savePath();
  cairo_rectangle(ctx, x, y, width, height);
  context->fill();
  context->restorePath();
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Stroke the rectangle defined by x, y, width and height.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::StrokeRect(const Arguments &args) {
  HandleScope scope;
  RECT_ARGS;
  if (0 == width && 0 == height) return Undefined();
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::StrokeRect(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  RECT_INFO;
  if (0 == width && 0 == height) {
    info.GetReturnValue().SetUndefined();
    return;
  }
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  cairo_t *ctx = context->context();
  context->savePath();
  cairo_rectangle(ctx, x, y, width, height);
  context->stroke();
  context->restorePath();
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Clears all pixels defined by x, y, width and height.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::ClearRect(const Arguments &args) {
  HandleScope scope;
  RECT_ARGS;
  if (0 == width || 0 == height) return Undefined();
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::ClearRect(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  RECT_INFO;
  if (0 == width || 0 == height) {
    info.GetReturnValue().SetUndefined();
    return;
  }
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  cairo_t *ctx = context->context();
  cairo_save(ctx);
  context->savePath();
  cairo_rectangle(ctx, x, y, width, height);
  cairo_set_operator(ctx, CAIRO_OPERATOR_CLEAR);
  cairo_fill(ctx);
  context->restorePath();
  cairo_restore(ctx);
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Adds a rectangle subpath.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::Rect(const Arguments &args) {
  HandleScope scope;
  RECT_ARGS;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::Rect(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  RECT_INFO;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  cairo_t *ctx = context->context();
  if (width == 0) {
    cairo_move_to(ctx, x, y);
    cairo_line_to(ctx, x, y + height);
  } else if (height == 0) {
    cairo_move_to(ctx, x, y);
    cairo_line_to(ctx, x + width, y);
  } else {
    cairo_rectangle(ctx, x, y, width, height);
  }
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Adds an arc at x, y with the given radis and start/end angles.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::Arc(const Arguments &args) {
  HandleScope scope;

  if (!args[0]->IsNumber()
    || !args[1]->IsNumber()
    || !args[2]->IsNumber()
    || !args[3]->IsNumber()
    || !args[4]->IsNumber()) return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::Arc(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);

  if (!info[0]->IsNumber()
    || !info[1]->IsNumber()
    || !info[2]->IsNumber()
    || !info[3]->IsNumber()
    || !info[4]->IsNumber()) {
    info.GetReturnValue().SetUndefined();
    return;
  }
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  bool anticlockwise = args[5]->BooleanValue();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  bool anticlockwise = info[5]->BooleanValue();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  cairo_t *ctx = context->context();

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  if (anticlockwise && M_PI * 2 != args[4]->NumberValue()) {
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  if (anticlockwise && M_PI * 2 != info[4]->NumberValue()) {
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    cairo_arc_negative(ctx
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
      , args[0]->NumberValue()
      , args[1]->NumberValue()
      , args[2]->NumberValue()
      , args[3]->NumberValue()
      , args[4]->NumberValue());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
      , info[0]->NumberValue()
      , info[1]->NumberValue()
      , info[2]->NumberValue()
      , info[3]->NumberValue()
      , info[4]->NumberValue());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  } else {
    cairo_arc(ctx
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
      , args[0]->NumberValue()
      , args[1]->NumberValue()
      , args[2]->NumberValue()
      , args[3]->NumberValue()
      , args[4]->NumberValue());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
      , info[0]->NumberValue()
      , info[1]->NumberValue()
      , info[2]->NumberValue()
      , info[3]->NumberValue()
      , info[4]->NumberValue());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  }

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Adds an arcTo point (x0,y0) to (x1,y1) with the given radius.
 *
 * Implementation influenced by WebKit.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
Context2d::ArcTo(const Arguments &args) {
  HandleScope scope;

  if (!args[0]->IsNumber()
    || !args[1]->IsNumber()
    || !args[2]->IsNumber()
    || !args[3]->IsNumber()
    || !args[4]->IsNumber()) return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
Context2d::ArcTo(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);

  if (!info[0]->IsNumber()
    || !info[1]->IsNumber()
    || !info[2]->IsNumber()
    || !info[3]->IsNumber()
    || !info[4]->IsNumber()) {
    info.GetReturnValue().SetUndefined();
    return;
  }
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  cairo_t *ctx = context->context();

  // Current path point
  double x, y;
  cairo_get_current_point(ctx, &x, &y);
  Point<float> p0(x, y);

  // Point (x0,y0)
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  Point<float> p1(args[0]->NumberValue(), args[1]->NumberValue());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Point<float> p1(info[0]->NumberValue(), info[1]->NumberValue());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

  // Point (x1,y1)
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  Point<float> p2(args[2]->NumberValue(), args[3]->NumberValue());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Point<float> p2(info[2]->NumberValue(), info[3]->NumberValue());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  float radius = args[4]->NumberValue();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  float radius = info[4]->NumberValue();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

  if ((p1.x == p0.x && p1.y == p0.y)
    || (p1.x == p2.x && p1.y == p2.y)
    || radius == 0.f) {
    cairo_line_to(ctx, p1.x, p1.y);
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    info.GetReturnValue().SetUndefined();
    return;
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  }

  Point<float> p1p0((p0.x - p1.x),(p0.y - p1.y));
  Point<float> p1p2((p2.x - p1.x),(p2.y - p1.y));
  float p1p0_length = sqrtf(p1p0.x * p1p0.x + p1p0.y * p1p0.y);
  float p1p2_length = sqrtf(p1p2.x * p1p2.x + p1p2.y * p1p2.y);

  double cos_phi = (p1p0.x * p1p2.x + p1p0.y * p1p2.y) / (p1p0_length * p1p2_length);
  // all points on a line logic
  if (-1 == cos_phi) {
    cairo_line_to(ctx, p1.x, p1.y);
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    info.GetReturnValue().SetUndefined();
    return;
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  }

  if (1 == cos_phi) {
    // add infinite far away point
    unsigned int max_length = 65535;
    double factor_max = max_length / p1p0_length;
    Point<float> ep((p0.x + factor_max * p1p0.x), (p0.y + factor_max * p1p0.y));
    cairo_line_to(ctx, ep.x, ep.y);
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    info.GetReturnValue().SetUndefined();
    return;
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  }

  float tangent = radius / tan(acos(cos_phi) / 2);
  float factor_p1p0 = tangent / p1p0_length;
  Point<float> t_p1p0((p1.x + factor_p1p0 * p1p0.x), (p1.y + factor_p1p0 * p1p0.y));

  Point<float> orth_p1p0(p1p0.y, -p1p0.x);
  float orth_p1p0_length = sqrt(orth_p1p0.x * orth_p1p0.x + orth_p1p0.y * orth_p1p0.y);
  float factor_ra = radius / orth_p1p0_length;

  double cos_alpha = (orth_p1p0.x * p1p2.x + orth_p1p0.y * p1p2.y) / (orth_p1p0_length * p1p2_length);
  if (cos_alpha < 0.f)
      orth_p1p0 = Point<float>(-orth_p1p0.x, -orth_p1p0.y);

  Point<float> p((t_p1p0.x + factor_ra * orth_p1p0.x), (t_p1p0.y + factor_ra * orth_p1p0.y));

  orth_p1p0 = Point<float>(-orth_p1p0.x, -orth_p1p0.y);
  float sa = acos(orth_p1p0.x / orth_p1p0_length);
  if (orth_p1p0.y < 0.f)
      sa = 2 * M_PI - sa;

  bool anticlockwise = false;

  float factor_p1p2 = tangent / p1p2_length;
  Point<float> t_p1p2((p1.x + factor_p1p2 * p1p2.x), (p1.y + factor_p1p2 * p1p2.y));
  Point<float> orth_p1p2((t_p1p2.x - p.x),(t_p1p2.y - p.y));
  float orth_p1p2_length = sqrtf(orth_p1p2.x * orth_p1p2.x + orth_p1p2.y * orth_p1p2.y);
  float ea = acos(orth_p1p2.x / orth_p1p2_length);

  if (orth_p1p2.y < 0) ea = 2 * M_PI - ea;
  if ((sa > ea) && ((sa - ea) < M_PI)) anticlockwise = true;
  if ((sa < ea) && ((ea - sa) > M_PI)) anticlockwise = true;

  cairo_line_to(ctx, t_p1p0.x, t_p1p0.y);

  if (anticlockwise && M_PI * 2 != radius) {
    cairo_arc_negative(ctx
      , p.x
      , p.y
      , radius
      , sa
      , ea);
  } else {
    cairo_arc(ctx
      , p.x
      , p.y
      , radius
      , sa
      , ea);
  }

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Undefined();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().SetUndefined();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}
