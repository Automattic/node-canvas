
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

Persistent<FunctionTemplate> Context2d::constructor;

/*
 * Rectangle arg assertions.
 */

#define RECT_ARGS \
  if (!args[0]->IsNumber() \
    ||!args[1]->IsNumber() \
    ||!args[2]->IsNumber() \
    ||!args[3]->IsNumber()) return Undefined(); \
  double x = args[0]->NumberValue(); \
  double y = args[1]->NumberValue(); \
  double width = args[2]->NumberValue(); \
  double height = args[3]->NumberValue();

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
  HandleScope scope;

  // Constructor
  constructor = Persistent<FunctionTemplate>::New(FunctionTemplate::New(Context2d::New));
  constructor->InstanceTemplate()->SetInternalFieldCount(1);
  constructor->SetClassName(String::NewSymbol("CanvasRenderingContext2d"));

  // Prototype
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
  NODE_SET_PROTOTYPE_METHOD(constructor, "_setFillColor", SetFillColor);
  NODE_SET_PROTOTYPE_METHOD(constructor, "_setStrokeColor", SetStrokeColor);
  NODE_SET_PROTOTYPE_METHOD(constructor, "_setFillPattern", SetFillPattern);
  NODE_SET_PROTOTYPE_METHOD(constructor, "_setStrokePattern", SetStrokePattern);
  NODE_SET_PROTOTYPE_METHOD(constructor, "_setTextBaseline", SetTextBaseline);
  NODE_SET_PROTOTYPE_METHOD(constructor, "_setTextAlignment", SetTextAlignment);
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
  target->Set(String::NewSymbol("CanvasRenderingContext2d"), constructor->GetFunction());
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

Handle<Value>
Context2d::New(const Arguments &args) {
  HandleScope scope;
  Local<Object> obj = args[0]->ToObject();
  if (!Canvas::constructor->HasInstance(obj))
    return ThrowException(Exception::TypeError(String::New("Canvas expected")));
  Canvas *canvas = ObjectWrap::Unwrap<Canvas>(obj);
  Context2d *context = new Context2d(canvas);
  context->Wrap(args.This());
  return args.This();
}

/*
 * Create a new page.
 */

Handle<Value>
Context2d::AddPage(const Arguments &args) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  if (!context->canvas()->isPDF()) {
    return ThrowException(Exception::Error(String::New("only PDF canvases support .nextPage()")));
  }
  cairo_show_page(context->context());
  return Undefined();
}

/*
 * Put image data.
 *
 *  - imageData, dx, dy
 *  - imageData, dx, dy, sx, sy, sw, sh
 *
 */

Handle<Value>
Context2d::PutImageData(const Arguments &args) {
  HandleScope scope;

  Local<Object> obj = args[0]->ToObject();
  if (!ImageData::constructor->HasInstance(obj))
    return ThrowException(Exception::TypeError(String::New("ImageData expected")));

  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
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
    , dx = args[1]->Int32Value()
    , dy = args[2]->Int32Value()
    , rows
    , cols;

  switch (args.Length()) {
    // imageData, dx, dy
    case 3:
      cols = arr->width();
      rows = arr->height();
      break;
    // imageData, dx, dy, sx, sy, sw, sh
    case 7:
      sx = args[3]->Int32Value();
      sy = args[4]->Int32Value();
      sw = args[5]->Int32Value();
      sh = args[6]->Int32Value();
      if (sx < 0) sw += sx, sx = 0;
      if (sy < 0) sh += sy, sy = 0;
      if (sx + sw > arr->width()) sw = arr->width() - sx;
      if (sy + sh > arr->height()) sh = arr->height() - sy;
      if (sw <= 0 || sh <= 0) return Undefined();
      cols = sw;
      rows = sh;
      dx += sx; 
      dy += sy; 
      break;
    default:
      return ThrowException(Exception::Error(String::New("invalid arguments")));
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

  return Undefined();
}

/*
 * Draw image src image to the destination (context).
 *
 *  - dx, dy
 *  - dx, dy, dw, dh
 *  - sx, sy, sw, sh, dx, dy, dw, dh
 *
 */

Handle<Value>
Context2d::DrawImage(const Arguments &args) {
  HandleScope scope;

  if (args.Length() < 3)
    return ThrowException(Exception::TypeError(String::New("invalid arguments")));

  int sx = 0
    , sy = 0
    , sw = 0
    , sh = 0
    , dx, dy, dw, dh;

  cairo_surface_t *surface;

  Local<Object> obj = args[0]->ToObject();

  // Image
  if (Image::constructor->HasInstance(obj)) {
    Image *img = ObjectWrap::Unwrap<Image>(obj);
    if (!img->isComplete()) {
      return ThrowException(Exception::Error(String::New("Image given has not completed loading")));
    }
    sw = img->width;
    sh = img->height;
    surface = img->surface();

  // Canvas
  } else if (Canvas::constructor->HasInstance(obj)) {
    Canvas *canvas = ObjectWrap::Unwrap<Canvas>(obj);
    sw = canvas->width;
    sh = canvas->height;
    surface = canvas->surface();

  // Invalid
  } else {
    return ThrowException(Exception::TypeError(String::New("Image or Canvas expected")));
  }

  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_t *ctx = context->context();

  // Arguments
  switch (args.Length()) {
    // img, sx, sy, sw, sh, dx, dy, dw, dh
    case 9:
      sx = args[1]->NumberValue();
      sy = args[2]->NumberValue();
      sw = args[3]->NumberValue();
      sh = args[4]->NumberValue();
      dx = args[5]->NumberValue();
      dy = args[6]->NumberValue();
      dw = args[7]->NumberValue();
      dh = args[8]->NumberValue();
      break;
    // img, dx, dy, dw, dh
    case 5:
      dx = args[1]->NumberValue();
      dy = args[2]->NumberValue();
      dw = args[3]->NumberValue();
      dh = args[4]->NumberValue();
      break;
    // img, dx, dy
    case 3:
      dx = args[1]->NumberValue();
      dy = args[2]->NumberValue();
      dw = sw;
      dh = sh;
      break;
    default:
      return ThrowException(Exception::TypeError(String::New("invalid arguments")));
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

  return Undefined();
}

/*
 * Get global alpha.
 */

Handle<Value>
Context2d::GetGlobalAlpha(Local<String> prop, const AccessorInfo &info) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  return scope.Close(Number::New(context->state->globalAlpha));
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
  HandleScope scope;
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

  return scope.Close(String::NewSymbol(op));
}

/*
 * Set pattern quality.
 */

void
Context2d::SetPatternQuality(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  String::AsciiValue quality(val->ToString());
  if (0 == strcmp("fast", *quality)) {
    context->state->patternQuality = CAIRO_FILTER_FAST;
  } else if (0 == strcmp("good", *quality)) {
    context->state->patternQuality = CAIRO_FILTER_GOOD;
  } else if (0 == strcmp("best", *quality)) {
    context->state->patternQuality = CAIRO_FILTER_BEST;
  }
}

/*
 * Get pattern quality.
 */

Handle<Value>
Context2d::GetPatternQuality(Local<String> prop, const AccessorInfo &info) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  const char *quality;
  switch (context->state->patternQuality) {
    case CAIRO_FILTER_FAST: quality = "fast"; break;
    case CAIRO_FILTER_BEST: quality = "best"; break;
    default: quality = "good";
  }
  return scope.Close(String::NewSymbol(quality));
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

Handle<Value>
Context2d::GetShadowOffsetX(Local<String> prop, const AccessorInfo &info) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  return scope.Close(Number::New(context->state->shadowOffsetX));
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
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  return scope.Close(Number::New(context->state->shadowOffsetY));
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
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  return scope.Close(Number::New(context->state->shadowBlur));
}

/*
 * Set shadow blur.
 */

void
Context2d::SetShadowBlur(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
  int n = val->NumberValue();
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
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  const char *aa;
  switch (cairo_get_antialias(context->context())) {
    case CAIRO_ANTIALIAS_NONE: aa = "none"; break;
    case CAIRO_ANTIALIAS_GRAY: aa = "gray"; break;
    case CAIRO_ANTIALIAS_SUBPIXEL: aa = "subpixel"; break;
    default: aa = "default";
  }
  return scope.Close(String::NewSymbol(aa));
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
 * Get text drawing mode.
 */

Handle<Value>
Context2d::GetTextDrawingMode(Local<String> prop, const AccessorInfo &info) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  const char *mode;
  if (context->state->textDrawingMode == TEXT_DRAW_PATHS) {
    mode = "path";
  } else if (context->state->textDrawingMode == TEXT_DRAW_GLYPHS) {
    mode = "glyph";
  } else {
    mode = "unknown";
  }
  return scope.Close(String::NewSymbol(mode));
}

/*
 * Set text drawing mode.
 */

void
Context2d::SetTextDrawingMode(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
  String::AsciiValue str(val->ToString());
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  if (0 == strcmp("path", *str)) {
    context->state->textDrawingMode = TEXT_DRAW_PATHS;
  } else if (0 == strcmp("glyph", *str)) {
    context->state->textDrawingMode = TEXT_DRAW_GLYPHS;
  }
}

/*
 * Get miter limit.
 */

Handle<Value>
Context2d::GetMiterLimit(Local<String> prop, const AccessorInfo &info) {
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  return scope.Close(Number::New(cairo_get_miter_limit(context->context())));
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
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  return scope.Close(Number::New(cairo_get_line_width(context->context())));
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
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  const char *join;
  switch (cairo_get_line_join(context->context())) {
    case CAIRO_LINE_JOIN_BEVEL: join = "bevel"; break;
    case CAIRO_LINE_JOIN_ROUND: join = "round"; break;
    default: join = "miter";
  }
  return scope.Close(String::NewSymbol(join));
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
  HandleScope scope;
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  const char *cap;
  switch (cairo_get_line_cap(context->context())) {
    case CAIRO_LINE_CAP_ROUND: cap = "round"; break;
    case CAIRO_LINE_CAP_SQUARE: cap = "square"; break;
    default: cap = "butt";
  }
  return scope.Close(String::NewSymbol(cap));
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
    return scope.Close(Boolean::New(cairo_in_fill(ctx, x, y) || cairo_in_stroke(ctx, x, y)));
  }
  return False();
}

/*
 * Set fill pattern, used internally for fillStyle=
 */

Handle<Value>
Context2d::SetFillPattern(const Arguments &args) {
  HandleScope scope;

  Local<Object> obj = args[0]->ToObject();
  if (Gradient::constructor->HasInstance(obj)){
    Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
    Gradient *grad = ObjectWrap::Unwrap<Gradient>(obj);
    context->state->fillGradient = grad->pattern();
  } else if(Pattern::constructor->HasInstance(obj)){
    Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
    Pattern *pattern = ObjectWrap::Unwrap<Pattern>(obj);
    context->state->fillPattern = pattern->pattern();
  } else {
    return ThrowException(Exception::TypeError(String::New("Gradient or Pattern expected")));
  }
  return Undefined();
}

/*
 * Set stroke pattern, used internally for strokeStyle=
 */

Handle<Value>
Context2d::SetStrokePattern(const Arguments &args) {
  HandleScope scope;

  Local<Object> obj = args[0]->ToObject();
  if (Gradient::constructor->HasInstance(obj)){
    Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
    Gradient *grad = ObjectWrap::Unwrap<Gradient>(obj);
    context->state->strokeGradient = grad->pattern();
  } else if(Pattern::constructor->HasInstance(obj)){
    Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
    Pattern *pattern = ObjectWrap::Unwrap<Pattern>(obj);
    context->state->strokePattern = pattern->pattern();
  } else {
    return ThrowException(Exception::TypeError(String::New("Gradient or Pattern expected")));
  }

  return Undefined();
}

/*
 * Set shadow color.
 */

void
Context2d::SetShadowColor(Local<String> prop, Local<Value> val, const AccessorInfo &info) {
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

Handle<Value>
Context2d::GetShadowColor(Local<String> prop, const AccessorInfo &info) {
  HandleScope scope;
  char buf[64];
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  rgba_to_string(context->state->shadow, buf, sizeof(buf));
  return scope.Close(String::New(buf));
}

/*
 * Set fill color, used internally for fillStyle=
 */

Handle<Value>
Context2d::SetFillColor(const Arguments &args) {
  HandleScope scope;
  short ok;
  if (!args[0]->IsString()) return Undefined();
  String::AsciiValue str(args[0]);
  uint32_t rgba = rgba_from_string(*str, &ok);
  if (!ok) return Undefined();
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  context->state->fillPattern = context->state->fillGradient = NULL;
  context->state->fill = rgba_create(rgba);
  return Undefined();
}

/*
 * Get fill color.
 */

Handle<Value>
Context2d::GetFillColor(Local<String> prop, const AccessorInfo &info) {
  HandleScope scope;
  char buf[64];
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  rgba_to_string(context->state->fill, buf, sizeof(buf));
  return scope.Close(String::New(buf));
}

/*
 * Set stroke color, used internally for strokeStyle=
 */

Handle<Value>
Context2d::SetStrokeColor(const Arguments &args) {
  HandleScope scope;
  short ok;
  if (!args[0]->IsString()) return Undefined();
  String::AsciiValue str(args[0]);
  uint32_t rgba = rgba_from_string(*str, &ok);
  if (!ok) return Undefined();
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  context->state->strokePattern = context->state->strokeGradient = NULL;
  context->state->stroke = rgba_create(rgba);
  return Undefined();
}

/*
 * Get stroke color.
 */

Handle<Value>
Context2d::GetStrokeColor(Local<String> prop, const AccessorInfo &info) {
  HandleScope scope;
  char buf[64];
  Context2d *context = ObjectWrap::Unwrap<Context2d>(info.This());
  rgba_to_string(context->state->stroke, buf, sizeof(buf));
  return scope.Close(String::New(buf));
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

  if (0 == x && 0 == y) {
    x = x1;
    y = y1;
  }

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

  if (!args[1]->IsNumber()
    || !args[2]->IsNumber()) return Undefined();

  String::Utf8Value str(args[0]->ToString());
  double x = args[1]->NumberValue();
  double y = args[2]->NumberValue();

  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());

  context->savePath();
  if (context->state->textDrawingMode == TEXT_DRAW_GLYPHS) {
    context->fill();
    context->setTextPath(*str, x, y);
  } else if (context->state->textDrawingMode == TEXT_DRAW_PATHS) {
    context->setTextPath(*str, x, y);
    context->fill();
  }
  context->restorePath();

  return Undefined();
}

/*
 * Stroke text at (x ,y).
 */

Handle<Value>
Context2d::StrokeText(const Arguments &args) {
  HandleScope scope;
  
  if (!args[1]->IsNumber()
    || !args[2]->IsNumber()) return Undefined();

  String::Utf8Value str(args[0]->ToString());
  double x = args[1]->NumberValue();
  double y = args[2]->NumberValue();
  
  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());

  context->savePath();
  if (context->state->textDrawingMode == TEXT_DRAW_GLYPHS) {
    context->stroke();
    context->setTextPath(*str, x, y);
  } else if (context->state->textDrawingMode == TEXT_DRAW_PATHS) {
    context->setTextPath(*str, x, y);
    context->stroke();
  }
  context->restorePath();

  return Undefined();
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

Handle<Value>
Context2d::LineTo(const Arguments &args) {
  HandleScope scope;

  if (!args[0]->IsNumber()) 
    return ThrowException(Exception::TypeError(String::New("lineTo() x must be a number")));
  if (!args[1]->IsNumber()) 
    return ThrowException(Exception::TypeError(String::New("lineTo() y must be a number")));

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
    return ThrowException(Exception::TypeError(String::New("moveTo() x must be a number")));
  if (!args[1]->IsNumber()) 
    return ThrowException(Exception::TypeError(String::New("moveTo() y must be a number")));

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
  String::AsciiValue family(args[4]);

  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());

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

  return Undefined();
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

Handle<Value>
Context2d::MeasureText(const Arguments &args) {
  HandleScope scope;

  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_t *ctx = context->context();

  String::Utf8Value str(args[0]->ToString());
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
  context->savePath();
  cairo_rectangle(ctx, x, y, width, height);
  context->fill();
  context->restorePath();
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
  context->savePath();
  cairo_rectangle(ctx, x, y, width, height);
  context->stroke();
  context->restorePath();
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
  context->savePath();
  cairo_rectangle(ctx, x, y, width, height);
  cairo_set_operator(ctx, CAIRO_OPERATOR_CLEAR);
  cairo_fill(ctx);
  context->restorePath();
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
  return Undefined();
}

/*
 * Adds an arc at x, y with the given radis and start/end angles.
 */

Handle<Value>
Context2d::Arc(const Arguments &args) {
  HandleScope scope;

  if (!args[0]->IsNumber()
    || !args[1]->IsNumber()
    || !args[2]->IsNumber()
    || !args[3]->IsNumber()
    || !args[4]->IsNumber()) return Undefined();

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

/*
 * Adds an arcTo point (x0,y0) to (x1,y1) with the given radius.
 *
 * Implementation influenced by WebKit.
 */

Handle<Value>
Context2d::ArcTo(const Arguments &args) {
  HandleScope scope;

  if (!args[0]->IsNumber()
    || !args[1]->IsNumber()
    || !args[2]->IsNumber()
    || !args[3]->IsNumber()
    || !args[4]->IsNumber()) return Undefined();

  Context2d *context = ObjectWrap::Unwrap<Context2d>(args.This());
  cairo_t *ctx = context->context();

  // Current path point
  double x, y;
  cairo_get_current_point(ctx, &x, &y);
  Point<float> p0(x, y);

  // Point (x0,y0)
  Point<float> p1(args[0]->NumberValue(), args[1]->NumberValue());

  // Point (x1,y1)
  Point<float> p2(args[2]->NumberValue(), args[3]->NumberValue());

  float radius = args[4]->NumberValue();

  if ((p1.x == p0.x && p1.y == p0.y)
    || (p1.x == p2.x && p1.y == p2.y)
    || radius == 0.f) {
    cairo_line_to(ctx, p1.x, p1.y);
    return Undefined();
  }

  Point<float> p1p0((p0.x - p1.x),(p0.y - p1.y));
  Point<float> p1p2((p2.x - p1.x),(p2.y - p1.y));
  float p1p0_length = sqrtf(p1p0.x * p1p0.x + p1p0.y * p1p0.y);
  float p1p2_length = sqrtf(p1p2.x * p1p2.x + p1p2.y * p1p2.y);

  double cos_phi = (p1p0.x * p1p2.x + p1p0.y * p1p2.y) / (p1p0_length * p1p2_length);
  // all points on a line logic
  if (-1 == cos_phi) {
    cairo_line_to(ctx, p1.x, p1.y);
    return Undefined();
  }

  if (1 == cos_phi) {
    // add infinite far away point
    unsigned int max_length = 65535;
    double factor_max = max_length / p1p0_length;
    Point<float> ep((p0.x + factor_max * p1p0.x), (p0.y + factor_max * p1p0.y));
    cairo_line_to(ctx, ep.x, ep.y);
    return Undefined();
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

  return Undefined();
}
