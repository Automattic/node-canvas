// Copyright (c) 2010 LearnBoost <tj@learnboost.com>

#include "CanvasPattern.h"

#include "Canvas.h"
#include "Image.h"
#include "InstanceData.h"

/*
 * Initialize CanvasPattern.
 */

void
Pattern::Initialize(Napi::Env& env, Napi::Object& exports) {
  InstanceData* data = env.GetInstanceData<InstanceData>();

  // Constructor
  Napi::Function ctor = DefineClass(env, "CanvasPattern", {
    InstanceMethod<&Pattern::setTransform>("setTransform", napi_default_method)
  });

  // Prototype
  exports.Set("CanvasPattern", ctor);
  data->CanvasPatternCtor = Napi::Persistent(ctor);
}

/*
 * Initialize a new CanvasPattern.
 */

Pattern::Pattern(const Napi::CallbackInfo& info) : ObjectWrap<Pattern>(info), env(info.Env()) {
  if (!info[0].IsObject()) {
    Napi::TypeError::New(env, "Image or Canvas expected").ThrowAsJavaScriptException();
    return;
  }

  Napi::Object obj = info[0].As<Napi::Object>();
  InstanceData* data = env.GetInstanceData<InstanceData>();

  // Image
  if (obj.InstanceOf(data->ImageCtor.Value()).UnwrapOr(false)) {
    image = Image::Unwrap(obj);
    if (!image->isComplete()) {
      Napi::Error::New(env, "Image given has not completed loading").ThrowAsJavaScriptException();
      return;
    }
    value = Napi::Persistent(obj);

  // Canvas
  } else if (obj.InstanceOf(data->CanvasCtor.Value()).UnwrapOr(false)) {
    canvas = Canvas::Unwrap(obj);
    value = Napi::Persistent(obj);
  // Invalid
  } else {
    if (!env.IsExceptionPending()) {
      Napi::TypeError::New(env, "Image or Canvas expected").ThrowAsJavaScriptException();
    }
    return;
  }

  if (info[1].IsString()) {
    if ("no-repeat" == info[1].As<Napi::String>().Utf8Value()) {
      _repeat = NO_REPEAT;
    } else if ("repeat-x" == info[1].As<Napi::String>().Utf8Value()) {
      _repeat = REPEAT_X;
    } else if ("repeat-y" == info[1].As<Napi::String>().Utf8Value()) {
      _repeat = REPEAT_Y;
    }
  }

  cairo_matrix_init_identity(&matrix);
  cairo_matrix_invert(&matrix);
}

/*
 * Set the pattern-space to user-space transform.
 */

void
Pattern::setTransform(const Napi::CallbackInfo& info) {
  if (!info[0].IsObject()) {
    Napi::TypeError::New(env, "Expected DOMMatrix").ThrowAsJavaScriptException();
    return;
  }

  Napi::Object mat = info[0].As<Napi::Object>();

  InstanceData* data = env.GetInstanceData<InstanceData>();
  if (!mat.InstanceOf(data->DOMMatrixCtor.Value()).UnwrapOr(false)) {
    if (!env.IsExceptionPending()) {
      Napi::TypeError::New(env, "Expected DOMMatrix").ThrowAsJavaScriptException();
    }
    return;
  }

  Napi::Value one = Napi::Number::New(env, 1);
  Napi::Value zero = Napi::Number::New(env, 0);

  cairo_matrix_init(&matrix,
    mat.Get("a").UnwrapOr(one).As<Napi::Number>().DoubleValue(),
    mat.Get("b").UnwrapOr(zero).As<Napi::Number>().DoubleValue(),
    mat.Get("c").UnwrapOr(zero).As<Napi::Number>().DoubleValue(),
    mat.Get("d").UnwrapOr(one).As<Napi::Number>().DoubleValue(),
    mat.Get("e").UnwrapOr(zero).As<Napi::Number>().DoubleValue(),
    mat.Get("f").UnwrapOr(zero).As<Napi::Number>().DoubleValue()
  );

  cairo_matrix_invert(&matrix);
}

/*
 * Create a cairo pattern on-demand
 */

cairo_pattern_t*
Pattern::createCairoPattern(double alpha, cairo_filter_t patternQuality) {
  cairo_surface_t *source_surface = nullptr;

  if (canvas) {
    source_surface = canvas->ensureSurface();
  } else if (image) {
    source_surface = image->surface();
  }

  if (!source_surface) return nullptr;

  cairo_pattern_t *pattern = cairo_pattern_create_for_surface(source_surface);

  if (alpha < 1) {
    int width = cairo_image_surface_get_width(source_surface);
    int height = cairo_image_surface_get_height(source_surface);
    cairo_surface_t *mask_surface = cairo_image_surface_create(
      CAIRO_FORMAT_ARGB32,
      width,
      height
    );
    cairo_t *mask_context = cairo_create(mask_surface);
    if (cairo_status(mask_context) != CAIRO_STATUS_SUCCESS) {
      return NULL;
    }
    cairo_set_source(mask_context, pattern);
    cairo_paint_with_alpha(mask_context, alpha);
    cairo_destroy(mask_context);
    cairo_pattern_destroy(pattern);
    pattern = cairo_pattern_create_for_surface(mask_surface);
    cairo_surface_destroy(mask_surface);
  }

  cairo_pattern_set_filter(pattern, patternQuality);
  cairo_pattern_set_matrix(pattern, &matrix);

  return pattern;
}
