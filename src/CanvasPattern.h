// Copyright (c) 2011 LearnBoost <tj@learnboost.com>

#pragma once

#include <cairo.h>
#include <napi.h>
#include "Canvas.h"
#include "Image.h"

/*
 * Canvas types.
 */

typedef enum {
  NO_REPEAT,  // match CAIRO_EXTEND_NONE
  REPEAT,  // match CAIRO_EXTEND_REPEAT
  REPEAT_X, // needs custom processing
  REPEAT_Y // needs custom processing
} repeat_type_t;

class Pattern : public Napi::ObjectWrap<Pattern> {
  public:
    Pattern(const Napi::CallbackInfo& info);
    static void Initialize(Napi::Env& env, Napi::Object& target);
    void setTransform(const Napi::CallbackInfo& info);
    inline repeat_type_t repeat() { return _repeat; };
    cairo_pattern_t* createCairoPattern(double alpha, cairo_filter_t patternQuality);
    Napi::Env env;
  private:
    repeat_type_t _repeat = REPEAT;
    // TODO: we're actually supposed to "copy" the data from the canvas or image
    // according to spec. Can't reference Cairo surfaces since they can change.
    // https://html.spec.whatwg.org/multipage/canvas.html#dom-context-2d-createpattern
    Napi::ObjectReference value;
    cairo_matrix_t matrix;
    Canvas* canvas = nullptr;
    Image* image = nullptr;
};
