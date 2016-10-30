
//
// CanvasRenderingContext2d.cc
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#include <math.h>
#include <string.h>
#include <stdlib.h>
#include <limits>
#include <vector>
#include <algorithm>
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

// Windows doesn't support the C99 names for these
#ifdef _MSC_VER
#define isnan(x) _isnan(x)
#define isinf(x) (!_finite(x))
#endif

#ifndef isnan
#define isnan(x) std::isnan(x)
#define isinf(x) std::isinf(x)
#endif

Nan::Persistent<FunctionTemplate> Context2d::constructor;

/*
 * Rectangle arg assertions.
 */

#define RECT_ARGS \
  if (!info[0]->IsNumber() \
    ||!info[1]->IsNumber() \
    ||!info[2]->IsNumber() \
    ||!info[3]->IsNumber()) return; \
  double x = info[0]->NumberValue(); \
  double y = info[1]->NumberValue(); \
  double width = info[2]->NumberValue(); \
  double height = info[3]->NumberValue();

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
Context2d::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // Constructor
  Local<FunctionTemplate> ctor = Nan::New<FunctionTemplate>(Context2d::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("CanvasRenderingContext2D").ToLocalChecked());

  // Prototype
  Local<ObjectTemplate> proto = ctor->PrototypeTemplate();
  Nan::SetPrototypeMethod(ctor, "drawImage", DrawImage);
  Nan::SetPrototypeMethod(ctor, "putImageData", PutImageData);
  Nan::SetPrototypeMethod(ctor, "getImageData", GetImageData);
  Nan::SetPrototypeMethod(ctor, "addPage", AddPage);
  Nan::SetPrototypeMethod(ctor, "save", Save);
  Nan::SetPrototypeMethod(ctor, "restore", Restore);
  Nan::SetPrototypeMethod(ctor, "rotate", Rotate);
  Nan::SetPrototypeMethod(ctor, "translate", Translate);
  Nan::SetPrototypeMethod(ctor, "transform", Transform);
  Nan::SetPrototypeMethod(ctor, "resetTransform", ResetTransform);
  Nan::SetPrototypeMethod(ctor, "isPointInPath", IsPointInPath);
  Nan::SetPrototypeMethod(ctor, "scale", Scale);
  Nan::SetPrototypeMethod(ctor, "clip", Clip);
  Nan::SetPrototypeMethod(ctor, "fill", Fill);
  Nan::SetPrototypeMethod(ctor, "stroke", Stroke);
  Nan::SetPrototypeMethod(ctor, "fillText", FillText);
  Nan::SetPrototypeMethod(ctor, "strokeText", StrokeText);
  Nan::SetPrototypeMethod(ctor, "fillRect", FillRect);
  Nan::SetPrototypeMethod(ctor, "strokeRect", StrokeRect);
  Nan::SetPrototypeMethod(ctor, "clearRect", ClearRect);
  Nan::SetPrototypeMethod(ctor, "rect", Rect);
  Nan::SetPrototypeMethod(ctor, "measureText", MeasureText);
  Nan::SetPrototypeMethod(ctor, "moveTo", MoveTo);
  Nan::SetPrototypeMethod(ctor, "lineTo", LineTo);
  Nan::SetPrototypeMethod(ctor, "bezierCurveTo", BezierCurveTo);
  Nan::SetPrototypeMethod(ctor, "quadraticCurveTo", QuadraticCurveTo);
  Nan::SetPrototypeMethod(ctor, "beginPath", BeginPath);
  Nan::SetPrototypeMethod(ctor, "closePath", ClosePath);
  Nan::SetPrototypeMethod(ctor, "arc", Arc);
  Nan::SetPrototypeMethod(ctor, "arcTo", ArcTo);
  Nan::SetPrototypeMethod(ctor, "setLineDash", SetLineDash);
  Nan::SetPrototypeMethod(ctor, "getLineDash", GetLineDash);
  Nan::SetPrototypeMethod(ctor, "_setFont", SetFont);
#ifdef HAVE_FREETYPE
  Nan::SetPrototypeMethod(ctor, "_setFontFace", SetFontFace);
#endif
  Nan::SetPrototypeMethod(ctor, "_setFillColor", SetFillColor);
  Nan::SetPrototypeMethod(ctor, "_setStrokeColor", SetStrokeColor);
  Nan::SetPrototypeMethod(ctor, "_setFillPattern", SetFillPattern);
  Nan::SetPrototypeMethod(ctor, "_setStrokePattern", SetStrokePattern);
  Nan::SetPrototypeMethod(ctor, "_setTextBaseline", SetTextBaseline);
  Nan::SetPrototypeMethod(ctor, "_setTextAlignment", SetTextAlignment);
  Nan::SetAccessor(proto, Nan::New("patternQuality").ToLocalChecked(), GetPatternQuality, SetPatternQuality);
  Nan::SetAccessor(proto, Nan::New("globalCompositeOperation").ToLocalChecked(), GetGlobalCompositeOperation, SetGlobalCompositeOperation);
  Nan::SetAccessor(proto, Nan::New("globalAlpha").ToLocalChecked(), GetGlobalAlpha, SetGlobalAlpha);
  Nan::SetAccessor(proto, Nan::New("shadowColor").ToLocalChecked(), GetShadowColor, SetShadowColor);
  Nan::SetAccessor(proto, Nan::New("fillColor").ToLocalChecked(), GetFillColor);
  Nan::SetAccessor(proto, Nan::New("strokeColor").ToLocalChecked(), GetStrokeColor);
  Nan::SetAccessor(proto, Nan::New("miterLimit").ToLocalChecked(), GetMiterLimit, SetMiterLimit);
  Nan::SetAccessor(proto, Nan::New("lineWidth").ToLocalChecked(), GetLineWidth, SetLineWidth);
  Nan::SetAccessor(proto, Nan::New("lineCap").ToLocalChecked(), GetLineCap, SetLineCap);
  Nan::SetAccessor(proto, Nan::New("lineJoin").ToLocalChecked(), GetLineJoin, SetLineJoin);
  Nan::SetAccessor(proto, Nan::New("lineDashOffset").ToLocalChecked(), GetLineDashOffset, SetLineDashOffset);
  Nan::SetAccessor(proto, Nan::New("shadowOffsetX").ToLocalChecked(), GetShadowOffsetX, SetShadowOffsetX);
  Nan::SetAccessor(proto, Nan::New("shadowOffsetY").ToLocalChecked(), GetShadowOffsetY, SetShadowOffsetY);
  Nan::SetAccessor(proto, Nan::New("shadowBlur").ToLocalChecked(), GetShadowBlur, SetShadowBlur);
  Nan::SetAccessor(proto, Nan::New("antialias").ToLocalChecked(), GetAntiAlias, SetAntiAlias);
  Nan::SetAccessor(proto, Nan::New("textDrawingMode").ToLocalChecked(), GetTextDrawingMode, SetTextDrawingMode);
  Nan::SetAccessor(proto, Nan::New("filter").ToLocalChecked(), GetFilter, SetFilter);
  Nan::Set(target, Nan::New("CanvasRenderingContext2d").ToLocalChecked(), ctor->GetFunction());
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
Context2d::setFillRule(v8::Local<v8::Value> value) {
  cairo_fill_rule_t rule = CAIRO_FILL_RULE_WINDING;
  if (value->IsString()) {
    String::Utf8Value str(value);
    if (std::strcmp(*str, "evenodd") == 0) {
      rule = CAIRO_FILL_RULE_EVEN_ODD;
    }
  }
  cairo_set_fill_rule(_context, rule);
}

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

  // shadowOffset is unaffected by current transform
  cairo_matrix_t path_matrix;
  cairo_get_matrix(_context, &path_matrix);
  cairo_identity_matrix(_context);

  // Apply shadow
  cairo_push_group(_context);

  // No need to invoke blur if shadowBlur is 0
  if (state->shadowBlur) {
    // find out extent of path
    double x1, y1, x2, y2;
    if (fn == cairo_fill || fn == cairo_fill_preserve) {
      cairo_fill_extents(_context, &x1, &y1, &x2, &y2);
    } else {
      cairo_stroke_extents(_context, &x1, &y1, &x2, &y2);
    }

    // create new image surface that size + padding for blurring
    double dx = x2-x1, dy = y2-y1;
    cairo_user_to_device_distance(_context, &dx, &dy);
    int pad = state->shadowBlur * 2;
    cairo_surface_t *shadow_surface = cairo_image_surface_create(
      CAIRO_FORMAT_ARGB32,
      dx + 2 * pad,
      dy + 2 * pad);
    cairo_t *shadow_context = cairo_create(shadow_surface);

    // transform path to the right place
    cairo_translate(shadow_context, pad-x1, pad-y1);
    cairo_transform(shadow_context, &path_matrix);

    // draw the path and blur
    cairo_set_line_width(shadow_context, cairo_get_line_width(_context));
    cairo_new_path(shadow_context);
    cairo_append_path(shadow_context, path);
    setSourceRGBA(shadow_context, state->shadow);
    fn(shadow_context);
    blur(shadow_surface, state->shadowBlur);

    // paint to original context
    cairo_set_source_surface(_context, shadow_surface,
      x1 - pad + state->shadowOffsetX + 1,
      y1 - pad + state->shadowOffsetY + 1);
    cairo_paint(_context);
    cairo_destroy(shadow_context);
    cairo_surface_destroy(shadow_surface);
  } else {
    // Offset first, then apply path's transform
    cairo_translate(
        _context
      , state->shadowOffsetX
      , state->shadowOffsetY);
    cairo_transform(_context, &path_matrix);

    // Apply shadow
    cairo_new_path(_context);
    cairo_append_path(_context, path);
    setSourceRGBA(state->shadow);

    fn(_context);
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
 * Set source RGBA for the current context
 */

void
Context2d::setSourceRGBA(rgba_t color) {
  setSourceRGBA(_context, color);
}

/*
 * Set source RGBA
 */

void
Context2d::setSourceRGBA(cairo_t *ctx, rgba_t color) {
  cairo_set_source_rgba(
      ctx
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
  radius = radius * 0.57735f + 0.5f;
  // get width, height
  int width = cairo_image_surface_get_width( surface );
  int height = cairo_image_surface_get_height( surface );
  unsigned* precalc =
      (unsigned*)malloc(width*height*sizeof(unsigned));
  cairo_surface_flush( surface );
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

  cairo_surface_mark_dirty(surface);
  free(precalc);
}

/*
 * Initialize a new Context2d with the given canvas.
 */

NAN_METHOD(Context2d::New) {
  if (!info.IsConstructCall()) {
    return Nan::ThrowTypeError("Class constructors cannot be invoked without 'new'");
  }

  Local<Object> obj = info[0]->ToObject();
  if (!Nan::New(Canvas::constructor)->HasInstance(obj))
    return Nan::ThrowTypeError("Canvas expected");
  Canvas *canvas = Nan::ObjectWrap::Unwrap<Canvas>(obj);
  Context2d *context = new Context2d(canvas);
  context->Wrap(info.This());
  info.GetReturnValue().Set(info.This());
}

/*
 * Create a new page.
 */

NAN_METHOD(Context2d::AddPage) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  if (!context->canvas()->isPDF()) {
    return Nan::ThrowError("only PDF canvases support .nextPage()");
  }
  cairo_show_page(context->context());
  return;
}

/*
 * Put image data.
 *
 *  - imageData, dx, dy
 *  - imageData, dx, dy, sx, sy, sw, sh
 *
 */

NAN_METHOD(Context2d::PutImageData) {
  if (!info[0]->IsObject())
    return Nan::ThrowTypeError("ImageData expected");
  Local<Object> obj = info[0]->ToObject();
  if (!Nan::New(ImageData::constructor)->HasInstance(obj))
    return Nan::ThrowTypeError("ImageData expected");

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  ImageData *imageData = Nan::ObjectWrap::Unwrap<ImageData>(obj);

  uint8_t *src = imageData->data();
  uint8_t *dst = context->canvas()->data();

  int srcStride = imageData->stride()
    , dstStride = context->canvas()->stride();

  int sx = 0
    , sy = 0
    , sw = 0
    , sh = 0
    , dx = info[1]->Int32Value()
    , dy = info[2]->Int32Value()
    , rows
    , cols;

  switch (info.Length()) {
    // imageData, dx, dy
    case 3:
      // Need to wrap std::min calls using parens to prevent macro expansion on
      // windows. See http://stackoverflow.com/questions/5004858/stdmin-gives-error
      cols = (std::min)(imageData->width(), context->canvas()->width - dx);
      rows = (std::min)(imageData->height(), context->canvas()->height - dy);
      break;
    // imageData, dx, dy, sx, sy, sw, sh
    case 7:
      sx = info[3]->Int32Value();
      sy = info[4]->Int32Value();
      sw = info[5]->Int32Value();
      sh = info[6]->Int32Value();
      // fix up negative height, width
      if (sw < 0) sx += sw, sw = -sw;
      if (sh < 0) sy += sh, sh = -sh;
      // clamp the left edge
      if (sx < 0) sw += sx, sx = 0;
      if (sy < 0) sh += sy, sy = 0;
      // clamp the right edge
      if (sx + sw > imageData->width()) sw = imageData->width() - sx;
      if (sy + sh > imageData->height()) sh = imageData->height() - sy;
      // start destination at source offset
      dx += sx;
      dy += sy;
      // chop off outlying source data
      if (dx < 0) sw += dx, sx -= dx, dx = 0;
      if (dy < 0) sh += dy, sy -= dy, dy = 0;
      // clamp width at canvas size
      // Need to wrap std::min calls using parens to prevent macro expansion on
      // windows. See http://stackoverflow.com/questions/5004858/stdmin-gives-error
      cols = (std::min)(sw, context->canvas()->width - dx);
      rows = (std::min)(sh, context->canvas()->height - dy);
      break;
    default:
      return Nan::ThrowError("invalid arguments");
  }

  if (cols <= 0 || rows <= 0) return;

  src += sy * srcStride + sx * 4;
  dst += dstStride * dy + 4 * dx;
  for (int y = 0; y < rows; ++y) {
    uint8_t *dstRow = dst;
    uint8_t *srcRow = src;
    for (int x = 0; x < cols; ++x) {
      // rgba
      uint8_t r = *srcRow++;
      uint8_t g = *srcRow++;
      uint8_t b = *srcRow++;
      uint8_t a = *srcRow++;

      // argb
      // performance optimization: fully transparent/opaque pixels can be
      // processed more efficiently.
      if (a == 0) {
        *dstRow++ = 0;
        *dstRow++ = 0;
        *dstRow++ = 0;
        *dstRow++ = 0;
      } else if (a == 255) {
        *dstRow++ = b;
        *dstRow++ = g;
        *dstRow++ = r;
        *dstRow++ = a;
      } else {
        float alpha = (float)a / 255;
        *dstRow++ = b * alpha;
        *dstRow++ = g * alpha;
        *dstRow++ = r * alpha;
        *dstRow++ = a;
      }
    }
    dst += dstStride;
    src += srcStride;
  }

  cairo_surface_mark_dirty_rectangle(
      context->canvas()->surface()
    , dx
    , dy
    , cols
    , rows);
}

/*
 * Get image data.
 *
 *  - sx, sy, sw, sh
 *
 */

NAN_METHOD(Context2d::GetImageData) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  Canvas *canvas = context->canvas();

  int sx = info[0]->Int32Value();
  int sy = info[1]->Int32Value();
  int sw = info[2]->Int32Value();
  int sh = info[3]->Int32Value();

  if (!sw)
    return Nan::ThrowError("IndexSizeError: The source width is 0.");
  if (!sh)
    return Nan::ThrowError("IndexSizeError: The source height is 0.");

  // WebKit and Firefox have this behavior:
  // Flip the coordinates so the origin is top/left-most:
  if (sw < 0) {
    sx += sw;
    sw = -sw;
  }
  if (sh < 0) {
    sy += sh;
    sh = -sh;
  }

  if (sx + sw > canvas->width) sw = canvas->width - sx;
  if (sy + sh > canvas->height) sh = canvas->height - sy;

  // WebKit/moz functionality. node-canvas used to return in either case.
  if (sw <= 0) sw = 1;
  if (sh <= 0) sh = 1;

  // Non-compliant. "Pixels outside the canvas must be returned as transparent
  // black." This instead clips the returned array to the canvas area.
  if (sx < 0) {
    sw += sx;
    sx = 0;
  }
  if (sy < 0) {
    sh += sy;
    sy = 0;
  }

  int size = sw * sh * 4;

  int srcStride = canvas->stride();
  int dstStride = sw * 4;

  uint8_t *src = canvas->data();

#if NODE_MAJOR_VERSION == 0 && NODE_MINOR_VERSION <= 10
  Local<Object> global = Context::GetCurrent()->Global();

  Local<Int32> sizeHandle = Nan::New(size);
  Local<Value> caargv[] = { sizeHandle };
  Local<Object> clampedArray = global->Get(Nan::New("Uint8ClampedArray").ToLocalChecked()).As<Function>()->NewInstance(1, caargv);
#else
  Local<ArrayBuffer> buffer = ArrayBuffer::New(Isolate::GetCurrent(), size);
  Local<Uint8ClampedArray> clampedArray = Uint8ClampedArray::New(buffer, 0, size);
#endif

  Nan::TypedArrayContents<uint8_t> typedArrayContents(clampedArray);
  uint8_t* dst = *typedArrayContents;

  // Normalize data (argb -> rgba)
  for (int y = 0; y < sh; ++y) {
    uint32_t *row = (uint32_t *)(src + srcStride * (y + sy));
    for (int x = 0; x < sw; ++x) {
      int bx = x * 4;
      uint32_t *pixel = row + x + sx;
      uint8_t a = *pixel >> 24;
      uint8_t r = *pixel >> 16;
      uint8_t g = *pixel >> 8;
      uint8_t b = *pixel;
      dst[bx + 3] = a;

      // Performance optimization: fully transparent/opaque pixels can be
      // processed more efficiently.
      if (a == 0 || a == 255) {
        dst[bx + 0] = r;
        dst[bx + 1] = g;
        dst[bx + 2] = b;
      } else {
        float alpha = (float)a / 255;
        dst[bx + 0] = (int)((float)r / alpha);
        dst[bx + 1] = (int)((float)g / alpha);
        dst[bx + 2] = (int)((float)b / alpha);
      }

    }
    dst += dstStride;
  }

  const int argc = 3;
  Local<Int32> swHandle = Nan::New(sw);
  Local<Int32> shHandle = Nan::New(sh);
  Local<Value> argv[argc] = { clampedArray, swHandle, shHandle };

  Local<Function> constructor = Nan::GetFunction(Nan::New(ImageData::constructor)).ToLocalChecked();
  Local<Object> instance = Nan::NewInstance(constructor, argc, argv).ToLocalChecked();

  info.GetReturnValue().Set(instance);
}

/*
 * Draw image src image to the destination (context).
 *
 *  - dx, dy
 *  - dx, dy, dw, dh
 *  - sx, sy, sw, sh, dx, dy, dw, dh
 *
 */

NAN_METHOD(Context2d::DrawImage) {
  if (info.Length() < 3)
    return Nan::ThrowTypeError("invalid arguments");

  float sx = 0
    , sy = 0
    , sw = 0
    , sh = 0
    , dx, dy, dw, dh;

  cairo_surface_t *surface;

  Local<Object> obj = info[0]->ToObject();

  // Image
  if (Nan::New(Image::constructor)->HasInstance(obj)) {
    Image *img = Nan::ObjectWrap::Unwrap<Image>(obj);
    if (!img->isComplete()) {
      return Nan::ThrowError("Image given has not completed loading");
    }
    sw = img->width;
    sh = img->height;
    surface = img->surface();

  // Canvas
  } else if (Nan::New(Canvas::constructor)->HasInstance(obj)) {
    Canvas *canvas = Nan::ObjectWrap::Unwrap<Canvas>(obj);
    sw = canvas->width;
    sh = canvas->height;
    surface = canvas->surface();

  // Invalid
  } else {
    return Nan::ThrowTypeError("Image or Canvas expected");
  }

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();

  // Arguments
  switch (info.Length()) {
    // img, sx, sy, sw, sh, dx, dy, dw, dh
    case 9:
      sx = info[1]->NumberValue();
      sy = info[2]->NumberValue();
      sw = info[3]->NumberValue();
      sh = info[4]->NumberValue();
      dx = info[5]->NumberValue();
      dy = info[6]->NumberValue();
      dw = info[7]->NumberValue();
      dh = info[8]->NumberValue();
      break;
    // img, dx, dy, dw, dh
    case 5:
      dx = info[1]->NumberValue();
      dy = info[2]->NumberValue();
      dw = info[3]->NumberValue();
      dh = info[4]->NumberValue();
      break;
    // img, dx, dy
    case 3:
      dx = info[1]->NumberValue();
      dy = info[2]->NumberValue();
      dw = sw;
      dh = sh;
      break;
    default:
      return Nan::ThrowTypeError("invalid arguments");
  }

  // Start draw
  cairo_save(ctx);

  // Scale src
  float fx = (float) dw / sw;
  float fy = (float) dh / sh;

  if (dw != sw || dh != sh) {
    cairo_scale(ctx, fx, fy);
    dx /= fx;
    dy /= fy;
    dw /= fx;
    dh /= fy;
  }

  // apply shadow if there is one
  if (context->hasShadow()) {
    if(context->state->shadowBlur) {
      // we need to create a new surface in order to blur
      int pad = context->state->shadowBlur * 2;
      cairo_surface_t *shadow_surface = cairo_image_surface_create(CAIRO_FORMAT_ARGB32, dw + 2 * pad, dh + 2 * pad);
      cairo_t *shadow_context = cairo_create(shadow_surface);

      // mask and blur
      context->setSourceRGBA(shadow_context, context->state->shadow);
      cairo_mask_surface(shadow_context, surface, pad, pad);
      context->blur(shadow_surface, context->state->shadowBlur);

      // paint
      // @note: ShadowBlur looks different in each browser. This implementation matches chrome as close as possible.
      //        The 1.4 offset comes from visual tests with Chrome. I have read the spec and part of the shadowBlur
      //        implementation, and its not immediately clear why an offset is necessary, but without it, the result
      //        in chrome is different.
      cairo_set_source_surface(ctx, shadow_surface,
        dx - sx + (context->state->shadowOffsetX / fx) - pad + 1.4,
        dy - sy + (context->state->shadowOffsetY / fy) - pad + 1.4);
      cairo_paint(ctx);

      // cleanup
      cairo_destroy(shadow_context);
      cairo_surface_destroy(shadow_surface);
    } else {
      context->setSourceRGBA(context->state->shadow);
      cairo_mask_surface(ctx, surface,
        dx - sx + (context->state->shadowOffsetX / fx),
        dy - sy + (context->state->shadowOffsetY / fy));
    }
  }

  context->savePath();
  cairo_rectangle(ctx, dx, dy, dw, dh);
  cairo_clip(ctx);
  context->restorePath();

  // Paint
  cairo_set_source_surface(ctx, surface, dx - sx, dy - sy);
  cairo_pattern_set_filter(cairo_get_source(ctx), context->state->patternQuality);
  cairo_paint_with_alpha(ctx, context->state->globalAlpha);

  cairo_restore(ctx);
}

/*
 * Get global alpha.
 */

NAN_GETTER(Context2d::GetGlobalAlpha) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  info.GetReturnValue().Set(Nan::New<Number>(context->state->globalAlpha));
}

/*
 * Set global alpha.
 */

NAN_SETTER(Context2d::SetGlobalAlpha) {
  double n = value->NumberValue();
  if (n >= 0 && n <= 1) {
    Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
    context->state->globalAlpha = n;
  }
}

/*
 * Get global composite operation.
 */

NAN_GETTER(Context2d::GetGlobalCompositeOperation) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
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
    case CAIRO_OPERATOR_CLEAR: op = "clear"; break;
    case CAIRO_OPERATOR_SOURCE: op = "source"; break;
    case CAIRO_OPERATOR_DEST: op = "dest"; break;
    case CAIRO_OPERATOR_OVER: op = "over"; break;
    case CAIRO_OPERATOR_SATURATE: op = "saturate"; break;
    // Non-standard
    // supported by resent versions of cairo
#if CAIRO_VERSION_MINOR >= 10
    case CAIRO_OPERATOR_LIGHTEN: op = "lighten"; break;
    case CAIRO_OPERATOR_ADD: op = "add"; break;
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
#else
    case CAIRO_OPERATOR_ADD: op = "lighter"; break;
#endif
  }

  info.GetReturnValue().Set(Nan::New(op).ToLocalChecked());
}

/*
 * Set pattern quality.
 */

NAN_SETTER(Context2d::SetPatternQuality) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  String::Utf8Value quality(value->ToString());
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

NAN_GETTER(Context2d::GetPatternQuality) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  const char *quality;
  switch (context->state->patternQuality) {
    case CAIRO_FILTER_FAST: quality = "fast"; break;
    case CAIRO_FILTER_BEST: quality = "best"; break;
    case CAIRO_FILTER_NEAREST: quality = "nearest"; break;
    case CAIRO_FILTER_BILINEAR: quality = "bilinear"; break;
    default: quality = "good";
  }
  info.GetReturnValue().Set(Nan::New(quality).ToLocalChecked());
}

/*
 * Set global composite operation.
 */

NAN_SETTER(Context2d::SetGlobalCompositeOperation) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();
  String::Utf8Value type(value->ToString());
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
  } else if (0 == strcmp("add", *type)) {
    cairo_set_operator(ctx, CAIRO_OPERATOR_ADD);
  } else if (0 == strcmp("lighten", *type)) {
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

NAN_GETTER(Context2d::GetShadowOffsetX) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  info.GetReturnValue().Set(Nan::New<Number>(context->state->shadowOffsetX));
}

/*
 * Set shadow offset x.
 */

NAN_SETTER(Context2d::SetShadowOffsetX) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  context->state->shadowOffsetX = value->NumberValue();
}

/*
 * Get shadow offset y.
 */

NAN_GETTER(Context2d::GetShadowOffsetY) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  info.GetReturnValue().Set(Nan::New<Number>(context->state->shadowOffsetY));
}

/*
 * Set shadow offset y.
 */

NAN_SETTER(Context2d::SetShadowOffsetY) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  context->state->shadowOffsetY = value->NumberValue();
}

/*
 * Get shadow blur.
 */

NAN_GETTER(Context2d::GetShadowBlur) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  info.GetReturnValue().Set(Nan::New<Number>(context->state->shadowBlur));
}

/*
 * Set shadow blur.
 */

NAN_SETTER(Context2d::SetShadowBlur) {
  int n = value->NumberValue();
  if (n >= 0) {
    Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
    context->state->shadowBlur = n;
  }
}

/*
 * Get current antialiasing setting.
 */

NAN_GETTER(Context2d::GetAntiAlias) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  const char *aa;
  switch (cairo_get_antialias(context->context())) {
    case CAIRO_ANTIALIAS_NONE: aa = "none"; break;
    case CAIRO_ANTIALIAS_GRAY: aa = "gray"; break;
    case CAIRO_ANTIALIAS_SUBPIXEL: aa = "subpixel"; break;
    default: aa = "default";
  }
  info.GetReturnValue().Set(Nan::New(aa).ToLocalChecked());
}

/*
 * Set antialiasing.
 */

NAN_SETTER(Context2d::SetAntiAlias) {
  String::Utf8Value str(value->ToString());
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
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

NAN_GETTER(Context2d::GetTextDrawingMode) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  const char *mode;
  if (context->state->textDrawingMode == TEXT_DRAW_PATHS) {
    mode = "path";
  } else if (context->state->textDrawingMode == TEXT_DRAW_GLYPHS) {
    mode = "glyph";
  } else {
    mode = "unknown";
  }
  info.GetReturnValue().Set(Nan::New(mode).ToLocalChecked());
}

/*
 * Set text drawing mode.
 */

NAN_SETTER(Context2d::SetTextDrawingMode) {
  String::Utf8Value str(value->ToString());
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  if (0 == strcmp("path", *str)) {
    context->state->textDrawingMode = TEXT_DRAW_PATHS;
  } else if (0 == strcmp("glyph", *str)) {
    context->state->textDrawingMode = TEXT_DRAW_GLYPHS;
  }
}

/*
 * Get filter.
 */

NAN_GETTER(Context2d::GetFilter) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  const char *filter;
  switch (cairo_pattern_get_filter(cairo_get_source(context->context()))) {
    case CAIRO_FILTER_FAST: filter = "fast"; break;
    case CAIRO_FILTER_BEST: filter = "best"; break;
    case CAIRO_FILTER_NEAREST: filter = "nearest"; break;
    case CAIRO_FILTER_BILINEAR: filter = "bilinear"; break;
    default: filter = "good";
  }
  info.GetReturnValue().Set(Nan::New(filter).ToLocalChecked());
}

/*
 * Set filter.
 */

NAN_SETTER(Context2d::SetFilter) {
  String::Utf8Value str(value->ToString());
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
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

NAN_GETTER(Context2d::GetMiterLimit) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  info.GetReturnValue().Set(Nan::New<Number>(cairo_get_miter_limit(context->context())));
}

/*
 * Set miter limit.
 */

NAN_SETTER(Context2d::SetMiterLimit) {
  double n = value->NumberValue();
  if (n > 0) {
    Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
    cairo_set_miter_limit(context->context(), n);
  }
}

/*
 * Get line width.
 */

NAN_GETTER(Context2d::GetLineWidth) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  info.GetReturnValue().Set(Nan::New<Number>(cairo_get_line_width(context->context())));
}

/*
 * Set line width.
 */

NAN_SETTER(Context2d::SetLineWidth) {
  double n = value->NumberValue();
  if (n > 0 && n != std::numeric_limits<double>::infinity()) {
    Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
    cairo_set_line_width(context->context(), n);
  }
}

/*
 * Get line join.
 */

NAN_GETTER(Context2d::GetLineJoin) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  const char *join;
  switch (cairo_get_line_join(context->context())) {
    case CAIRO_LINE_JOIN_BEVEL: join = "bevel"; break;
    case CAIRO_LINE_JOIN_ROUND: join = "round"; break;
    default: join = "miter";
  }
  info.GetReturnValue().Set(Nan::New(join).ToLocalChecked());
}

/*
 * Set line join.
 */

NAN_SETTER(Context2d::SetLineJoin) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();
  String::Utf8Value type(value->ToString());
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

NAN_GETTER(Context2d::GetLineCap) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  const char *cap;
  switch (cairo_get_line_cap(context->context())) {
    case CAIRO_LINE_CAP_ROUND: cap = "round"; break;
    case CAIRO_LINE_CAP_SQUARE: cap = "square"; break;
    default: cap = "butt";
  }
  info.GetReturnValue().Set(Nan::New(cap).ToLocalChecked());
}

/*
 * Set line cap.
 */

NAN_SETTER(Context2d::SetLineCap) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();
  String::Utf8Value type(value->ToString());
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

NAN_METHOD(Context2d::IsPointInPath) {
  if (info[0]->IsNumber() && info[1]->IsNumber()) {
    Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
    cairo_t *ctx = context->context();
    double x = info[0]->NumberValue()
         , y = info[1]->NumberValue();
    context->setFillRule(info[2]);
    info.GetReturnValue().Set(Nan::New<Boolean>(cairo_in_fill(ctx, x, y) || cairo_in_stroke(ctx, x, y)));
    return;
  }
  info.GetReturnValue().Set(Nan::False());
}

/*
 * Set fill pattern, useV internally for fillStyle=
 */

NAN_METHOD(Context2d::SetFillPattern) {
  Local<Object> obj = info[0]->ToObject();
  if (Nan::New(Gradient::constructor)->HasInstance(obj)){
    Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
    Gradient *grad = Nan::ObjectWrap::Unwrap<Gradient>(obj);
    context->state->fillGradient = grad->pattern();
  } else if(Nan::New(Pattern::constructor)->HasInstance(obj)){
    Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
    Pattern *pattern = Nan::ObjectWrap::Unwrap<Pattern>(obj);
    context->state->fillPattern = pattern->pattern();
  } else {
    return Nan::ThrowTypeError("Gradient or Pattern expected");
  }
}

/*
 * Set stroke pattern, used internally for strokeStyle=
 */

NAN_METHOD(Context2d::SetStrokePattern) {
  Local<Object> obj = info[0]->ToObject();
  if (Nan::New(Gradient::constructor)->HasInstance(obj)){
    Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
    Gradient *grad = Nan::ObjectWrap::Unwrap<Gradient>(obj);
    context->state->strokeGradient = grad->pattern();
  } else if(Nan::New(Pattern::constructor)->HasInstance(obj)){
    Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
    Pattern *pattern = Nan::ObjectWrap::Unwrap<Pattern>(obj);
    context->state->strokePattern = pattern->pattern();
  } else {
    return Nan::ThrowTypeError("Gradient or Pattern expected");
  }
}

/*
 * Set shadow color.
 */

NAN_SETTER(Context2d::SetShadowColor) {
  short ok;
  String::Utf8Value str(value->ToString());
  uint32_t rgba = rgba_from_string(*str, &ok);
  if (ok) {
    Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
    context->state->shadow = rgba_create(rgba);
  }
}

/*
 * Get shadow color.
 */

NAN_GETTER(Context2d::GetShadowColor) {
  char buf[64];
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  rgba_to_string(context->state->shadow, buf, sizeof(buf));
  info.GetReturnValue().Set(Nan::New<String>(buf).ToLocalChecked());
}

/*
 * Set fill color, used internally for fillStyle=
 */

NAN_METHOD(Context2d::SetFillColor) {
  short ok;
  if (!info[0]->IsString()) return;
  String::Utf8Value str(info[0]);
  uint32_t rgba = rgba_from_string(*str, &ok);
  if (!ok) return;
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  context->state->fillPattern = context->state->fillGradient = NULL;
  context->state->fill = rgba_create(rgba);
}

/*
 * Get fill color.
 */

NAN_GETTER(Context2d::GetFillColor) {
  char buf[64];
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  rgba_to_string(context->state->fill, buf, sizeof(buf));
  info.GetReturnValue().Set(Nan::New<String>(buf).ToLocalChecked());
}

/*
 * Set stroke color, used internally for strokeStyle=
 */

NAN_METHOD(Context2d::SetStrokeColor) {
  short ok;
  if (!info[0]->IsString()) return;
  String::Utf8Value str(info[0]);
  uint32_t rgba = rgba_from_string(*str, &ok);
  if (!ok) return;
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  context->state->strokePattern = context->state->strokeGradient = NULL;
  context->state->stroke = rgba_create(rgba);
}

/*
 * Get stroke color.
 */

NAN_GETTER(Context2d::GetStrokeColor) {
  char buf[64];
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  rgba_to_string(context->state->stroke, buf, sizeof(buf));
  info.GetReturnValue().Set(Nan::New<String>(buf).ToLocalChecked());
}

/*
 * Bezier curve.
 */

NAN_METHOD(Context2d::BezierCurveTo) {
  if (!info[0]->IsNumber()
    ||!info[1]->IsNumber()
    ||!info[2]->IsNumber()
    ||!info[3]->IsNumber()
    ||!info[4]->IsNumber()
    ||!info[5]->IsNumber()) return;

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_curve_to(context->context()
    , info[0]->NumberValue()
    , info[1]->NumberValue()
    , info[2]->NumberValue()
    , info[3]->NumberValue()
    , info[4]->NumberValue()
    , info[5]->NumberValue());
}

/*
 * Quadratic curve approximation from libsvg-cairo.
 */

NAN_METHOD(Context2d::QuadraticCurveTo) {
  if (!info[0]->IsNumber()
    ||!info[1]->IsNumber()
    ||!info[2]->IsNumber()
    ||!info[3]->IsNumber()) return;

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();

  double x, y
    , x1 = info[0]->NumberValue()
    , y1 = info[1]->NumberValue()
    , x2 = info[2]->NumberValue()
    , y2 = info[3]->NumberValue();

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
}

/*
 * Save state.
 */

NAN_METHOD(Context2d::Save) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  context->save();
}

/*
 * Restore state.
 */

NAN_METHOD(Context2d::Restore) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  context->restore();
}

/*
 * Creates a new subpath.
 */

NAN_METHOD(Context2d::BeginPath) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_new_path(context->context());
}

/*
 * Marks the subpath as closed.
 */

NAN_METHOD(Context2d::ClosePath) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_close_path(context->context());
}

/*
 * Rotate transformation.
 */

NAN_METHOD(Context2d::Rotate) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_rotate(context->context()
    , info[0]->IsNumber() ? info[0]->NumberValue() : 0);
}

/*
 * Modify the CTM.
 */

NAN_METHOD(Context2d::Transform) {
  cairo_matrix_t matrix;
  cairo_matrix_init(&matrix
    , info[0]->IsNumber() ? info[0]->NumberValue() : 0
    , info[1]->IsNumber() ? info[1]->NumberValue() : 0
    , info[2]->IsNumber() ? info[2]->NumberValue() : 0
    , info[3]->IsNumber() ? info[3]->NumberValue() : 0
    , info[4]->IsNumber() ? info[4]->NumberValue() : 0
    , info[5]->IsNumber() ? info[5]->NumberValue() : 0);

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_transform(context->context(), &matrix);
}

/*
 * Reset the CTM, used internally by setTransform().
 */

NAN_METHOD(Context2d::ResetTransform) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_identity_matrix(context->context());
}

/*
 * Translate transformation.
 */

NAN_METHOD(Context2d::Translate) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_translate(context->context()
    , info[0]->IsNumber() ? info[0]->NumberValue() : 0
    , info[1]->IsNumber() ? info[1]->NumberValue() : 0);
}

/*
 * Scale transformation.
 */

NAN_METHOD(Context2d::Scale) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_scale(context->context()
    , info[0]->IsNumber() ? info[0]->NumberValue() : 0
    , info[1]->IsNumber() ? info[1]->NumberValue() : 0);
}

/*
 * Use path as clipping region.
 */

NAN_METHOD(Context2d::Clip) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  context->setFillRule(info[0]);
  cairo_t *ctx = context->context();
  cairo_clip_preserve(ctx);
}

/*
 * Fill the path.
 */

NAN_METHOD(Context2d::Fill) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  context->setFillRule(info[0]);
  context->fill(true);
}

/*
 * Stroke the path.
 */

NAN_METHOD(Context2d::Stroke) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  context->stroke(true);
}

/*
 * Fill text at (x, y).
 */

NAN_METHOD(Context2d::FillText) {
  if (!info[1]->IsNumber()
    || !info[2]->IsNumber()) return;

  String::Utf8Value str(info[0]->ToString());
  double x = info[1]->NumberValue();
  double y = info[2]->NumberValue();

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());

  context->savePath();
  if (context->state->textDrawingMode == TEXT_DRAW_GLYPHS) {
    context->fill();
    context->setTextPath(*str, x, y);
  } else if (context->state->textDrawingMode == TEXT_DRAW_PATHS) {
    context->setTextPath(*str, x, y);
    context->fill();
  }
  context->restorePath();
}

/*
 * Stroke text at (x ,y).
 */

NAN_METHOD(Context2d::StrokeText) {
  if (!info[1]->IsNumber()
    || !info[2]->IsNumber()) return;

  String::Utf8Value str(info[0]->ToString());
  double x = info[1]->NumberValue();
  double y = info[2]->NumberValue();

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());

  context->savePath();
  if (context->state->textDrawingMode == TEXT_DRAW_GLYPHS) {
    context->stroke();
    context->setTextPath(*str, x, y);
  } else if (context->state->textDrawingMode == TEXT_DRAW_PATHS) {
    context->setTextPath(*str, x, y);
    context->stroke();
  }
  context->restorePath();
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

NAN_METHOD(Context2d::LineTo) {
  if (!info[0]->IsNumber())
    return Nan::ThrowTypeError("lineTo() x must be a number");
  if (!info[1]->IsNumber())
    return Nan::ThrowTypeError("lineTo() y must be a number");

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_line_to(context->context()
    , info[0]->NumberValue()
    , info[1]->NumberValue());
}

/*
 * Creates a new subpath at the given point.
 */

NAN_METHOD(Context2d::MoveTo) {
  if (!info[0]->IsNumber())
    return Nan::ThrowTypeError("moveTo() x must be a number");
  if (!info[1]->IsNumber())
    return Nan::ThrowTypeError("moveTo() y must be a number");

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_move_to(context->context()
    , info[0]->NumberValue()
    , info[1]->NumberValue());
}

/*
 * Set font face.
 */

#ifdef HAVE_FREETYPE
NAN_METHOD(Context2d::SetFontFace) {
  // Ignore invalid args
  if (!info[0]->IsObject()
    || !info[1]->IsNumber())
    return Nan::ThrowTypeError("Expected object and number");

  Local<Object> obj = info[0]->ToObject();

  if (!Nan::New(FontFace::constructor)->HasInstance(obj))
    return Nan::ThrowTypeError("FontFace expected");

  FontFace *face = Nan::ObjectWrap::Unwrap<FontFace>(obj);
  double size = info[1]->NumberValue();

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();

  cairo_set_font_size(ctx, size);
  cairo_set_font_face(ctx, face->cairoFace());

  return;
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

NAN_METHOD(Context2d::SetFont) {
  // Ignore invalid args
  if (!info[0]->IsString()
    || !info[1]->IsString()
    || !info[2]->IsNumber()
    || !info[3]->IsString()
    || !info[4]->IsString()) return;

  String::Utf8Value weight(info[0]);
  String::Utf8Value style(info[1]);
  double size = info[2]->NumberValue();
  String::Utf8Value unit(info[3]);
  String::Utf8Value family(info[4]);

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());

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

NAN_METHOD(Context2d::MeasureText) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();

  String::Utf8Value str(info[0]->ToString());
  Local<Object> obj = Nan::New<Object>();

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

  obj->Set(Nan::New<String>("width").ToLocalChecked(),
           Nan::New<Number>(logical_rect.width));
  obj->Set(Nan::New<String>("actualBoundingBoxLeft").ToLocalChecked(),
           Nan::New<Number>(x_offset - PANGO_LBEARING(logical_rect)));
  obj->Set(Nan::New<String>("actualBoundingBoxRight").ToLocalChecked(),
           Nan::New<Number>(x_offset + PANGO_RBEARING(logical_rect)));
  obj->Set(Nan::New<String>("actualBoundingBoxAscent").ToLocalChecked(),
           Nan::New<Number>(-(y_offset+ink_rect.y)));
  obj->Set(Nan::New<String>("actualBoundingBoxDescent").ToLocalChecked(),
           Nan::New<Number>((PANGO_DESCENT(ink_rect) + y_offset)));
  obj->Set(Nan::New<String>("emHeightAscent").ToLocalChecked(),
           Nan::New<Number>(PANGO_ASCENT(logical_rect) - y_offset));
  obj->Set(Nan::New<String>("emHeightDescent").ToLocalChecked(),
           Nan::New<Number>(PANGO_DESCENT(logical_rect) + y_offset));
  obj->Set(Nan::New<String>("alphabeticBaseline").ToLocalChecked(),
           Nan::New<Number>((pango_font_metrics_get_ascent(metrics) / PANGO_SCALE)
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

  obj->Set(Nan::New<String>("width").ToLocalChecked(),
           Nan::New<Number>(te.x_advance));
  obj->Set(Nan::New<String>("actualBoundingBoxLeft").ToLocalChecked(),
           Nan::New<Number>(x_offset - te.x_bearing));
  obj->Set(Nan::New<String>("actualBoundingBoxRight").ToLocalChecked(),
           Nan::New<Number>((te.x_bearing + te.width) - x_offset));
  obj->Set(Nan::New<String>("actualBoundingBoxAscent").ToLocalChecked(),
           Nan::New<Number>(-(te.y_bearing + y_offset)));
  obj->Set(Nan::New<String>("actualBoundingBoxDescent").ToLocalChecked(),
           Nan::New<Number>(te.height + te.y_bearing + y_offset));
  obj->Set(Nan::New<String>("emHeightAscent").ToLocalChecked(),
           Nan::New<Number>(fe.ascent - y_offset));
  obj->Set(Nan::New<String>("emHeightDescent").ToLocalChecked(),
           Nan::New<Number>(fe.descent + y_offset));
  obj->Set(Nan::New<String>("alphabeticBaseline").ToLocalChecked(),
           Nan::New<Number>(y_offset));

#endif

  info.GetReturnValue().Set(obj);
}

/*
 * Set text baseline.
 */

NAN_METHOD(Context2d::SetTextBaseline) {
  if (!info[0]->IsInt32()) return;
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  context->state->textBaseline = info[0]->Int32Value();
}

/*
 * Set text alignment. -1 0 1
 */

NAN_METHOD(Context2d::SetTextAlignment) {
  if (!info[0]->IsInt32()) return;
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  context->state->textAlignment = info[0]->Int32Value();
}

/*
 * Set line dash
 * ref: http://www.w3.org/TR/2dcontext/#dom-context-2d-setlinedash
 */
NAN_METHOD(Context2d::SetLineDash) {
  if (!info[0]->IsArray()) return;
  Local<Array> dash = Local<Array>::Cast(info[0]);
  uint32_t dashes = dash->Length() & 1 ? dash->Length() * 2 : dash->Length();

  std::vector<double> a(dashes);
  for (uint32_t i=0; i<dashes; i++) {
    Local<Value> d = dash->Get(i % dash->Length());
    if (!d->IsNumber()) return;
    a[i] = d->NumberValue();
    if (a[i] < 0 || isnan(a[i]) || isinf(a[i])) return;
  }

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();
  double offset;
  cairo_get_dash(ctx, NULL, &offset);
  cairo_set_dash(ctx, a.data(), dashes, offset);
}

/*
 * Get line dash
 * ref: http://www.w3.org/TR/2dcontext/#dom-context-2d-setlinedash
 */
NAN_METHOD(Context2d::GetLineDash) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();
  int dashes = cairo_get_dash_count(ctx);
  std::vector<double> a(dashes);
  cairo_get_dash(ctx, a.data(), NULL);

  Local<Array> dash = Nan::New<Array>(dashes);
  for (int i=0; i<dashes; i++)
      dash->Set(Nan::New<Number>(i), Nan::New<Number>(a[i]));

  info.GetReturnValue().Set(dash);
}

/*
 * Set line dash offset
 * ref: http://www.w3.org/TR/2dcontext/#dom-context-2d-setlinedash
 */
NAN_SETTER(Context2d::SetLineDashOffset) {
  double offset = value->NumberValue();
  if (isnan(offset) || isinf(offset)) return;

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();

  int dashes = cairo_get_dash_count(ctx);
  std::vector<double> a(dashes);
  cairo_get_dash(ctx, a.data(), NULL);
  cairo_set_dash(ctx, a.data(), dashes, offset);
}

/*
 * Get line dash offset
 * ref: http://www.w3.org/TR/2dcontext/#dom-context-2d-setlinedash
 */
NAN_GETTER(Context2d::GetLineDashOffset) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();
  double offset;
  cairo_get_dash(ctx, NULL, &offset);

  info.GetReturnValue().Set(Nan::New<Number>(offset));
}

/*
 * Fill the rectangle defined by x, y, width and height.
 */

NAN_METHOD(Context2d::FillRect) {
  RECT_ARGS;
  if (0 == width || 0 == height) return;
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();
  context->savePath();
  cairo_rectangle(ctx, x, y, width, height);
  context->fill();
  context->restorePath();
}

/*
 * Stroke the rectangle defined by x, y, width and height.
 */

NAN_METHOD(Context2d::StrokeRect) {
  RECT_ARGS;
  if (0 == width && 0 == height) return;
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();
  context->savePath();
  cairo_rectangle(ctx, x, y, width, height);
  context->stroke();
  context->restorePath();
}

/*
 * Clears all pixels defined by x, y, width and height.
 */

NAN_METHOD(Context2d::ClearRect) {
  RECT_ARGS;
  if (0 == width || 0 == height) return;
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();
  cairo_save(ctx);
  context->savePath();
  cairo_rectangle(ctx, x, y, width, height);
  cairo_set_operator(ctx, CAIRO_OPERATOR_CLEAR);
  cairo_fill(ctx);
  context->restorePath();
  cairo_restore(ctx);
}

/*
 * Adds a rectangle subpath.
 */

NAN_METHOD(Context2d::Rect) {
  RECT_ARGS;
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
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
}

/*
 * Adds an arc at x, y with the given radis and start/end angles.
 */

NAN_METHOD(Context2d::Arc) {
  if (!info[0]->IsNumber()
    || !info[1]->IsNumber()
    || !info[2]->IsNumber()
    || !info[3]->IsNumber()
    || !info[4]->IsNumber()) return;

  bool anticlockwise = info[5]->BooleanValue();

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();

  if (anticlockwise && M_PI * 2 != info[4]->NumberValue()) {
    cairo_arc_negative(ctx
      , info[0]->NumberValue()
      , info[1]->NumberValue()
      , info[2]->NumberValue()
      , info[3]->NumberValue()
      , info[4]->NumberValue());
  } else {
    cairo_arc(ctx
      , info[0]->NumberValue()
      , info[1]->NumberValue()
      , info[2]->NumberValue()
      , info[3]->NumberValue()
      , info[4]->NumberValue());
  }
}

/*
 * Adds an arcTo point (x0,y0) to (x1,y1) with the given radius.
 *
 * Implementation influenced by WebKit.
 */

NAN_METHOD(Context2d::ArcTo) {
  if (!info[0]->IsNumber()
    || !info[1]->IsNumber()
    || !info[2]->IsNumber()
    || !info[3]->IsNumber()
    || !info[4]->IsNumber()) return;

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();

  // Current path point
  double x, y;
  cairo_get_current_point(ctx, &x, &y);
  Point<float> p0(x, y);

  // Point (x0,y0)
  Point<float> p1(info[0]->NumberValue(), info[1]->NumberValue());

  // Point (x1,y1)
  Point<float> p2(info[2]->NumberValue(), info[3]->NumberValue());

  float radius = info[4]->NumberValue();

  if ((p1.x == p0.x && p1.y == p0.y)
    || (p1.x == p2.x && p1.y == p2.y)
    || radius == 0.f) {
    cairo_line_to(ctx, p1.x, p1.y);
    return;
  }

  Point<float> p1p0((p0.x - p1.x),(p0.y - p1.y));
  Point<float> p1p2((p2.x - p1.x),(p2.y - p1.y));
  float p1p0_length = sqrtf(p1p0.x * p1p0.x + p1p0.y * p1p0.y);
  float p1p2_length = sqrtf(p1p2.x * p1p2.x + p1p2.y * p1p2.y);

  double cos_phi = (p1p0.x * p1p2.x + p1p0.y * p1p2.y) / (p1p0_length * p1p2_length);
  // all points on a line logic
  if (-1 == cos_phi) {
    cairo_line_to(ctx, p1.x, p1.y);
    return;
  }

  if (1 == cos_phi) {
    // add infinite far away point
    unsigned int max_length = 65535;
    double factor_max = max_length / p1p0_length;
    Point<float> ep((p0.x + factor_max * p1p0.x), (p0.y + factor_max * p1p0.y));
    cairo_line_to(ctx, ep.x, ep.y);
    return;
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
}
