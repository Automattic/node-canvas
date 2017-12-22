
//
// CanvasPattern.h
//
// Copyright (c) 2011 LearnBoost <tj@learnboost.com>
//

#ifndef __NODE_PATTERN_H__
#define __NODE_PATTERN_H__

#include "Canvas.h"

/*
 * Canvas types.
 */

typedef enum {
  NO_REPEAT,  // match CAIRO_EXTEND_NONE
  REPEAT,  // match CAIRO_EXTEND_REPEAT
  REPEAT_X, // needs custom processing
  REPEAT_Y // needs custom processing
} repeat_type_t;

class Pattern: public Nan::ObjectWrap {
  public:
    static Nan::Persistent<FunctionTemplate> constructor;
    static void Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target);
    static NAN_METHOD(New);
    Pattern(cairo_surface_t *surface, repeat_type_t repeat);
    inline cairo_pattern_t *pattern(){ return _pattern; }
    inline repeat_type_t repeat(){ return _repeat; }
  private:
    ~Pattern();
    // TODO REPEAT/REPEAT_X/REPEAT_Y
    cairo_pattern_t *_pattern;
    repeat_type_t _repeat;
};

#endif
