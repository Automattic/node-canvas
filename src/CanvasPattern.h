
//
// CanvasPattern.h
//
// Copyright (c) 2011 LearnBoost <tj@learnboost.com>
//

#ifndef __NODE_PATTERN_H__
#define __NODE_PATTERN_H__

#include "Canvas.h"

class Pattern: public Nan::ObjectWrap {
  public:
    static Nan::Persistent<FunctionTemplate> constructor;
    static void Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target);
    static NAN_METHOD(New);
    Pattern(cairo_surface_t *surface, int w, int h);
    inline cairo_pattern_t *pattern(){ return _pattern; }

  private:
    ~Pattern();
    int _width, _height;
    // TODO REPEAT/REPEAT_X/REPEAT_Y
    cairo_pattern_t *_pattern;
};

#endif
