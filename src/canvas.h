
//
// canvas.h
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#ifndef __NODE_CANVAS_H__
#define __NODE_CANVAS_H__

#include <v8.h>
#include <node.h>
#include <node_object_wrap.h>
#include <cairo.h>

using namespace v8;

class Canvas: public node::ObjectWrap {
  public:
    static void Initialize(Handle<Object> target);
    static Handle<Value> New(const Arguments &args);
    static Handle<Value> SavePNG(const Arguments &args);
    inline cairo_surface_t *getSurface(){ return _surface; }

  protected:
    Canvas(int width, int height);

  private:
    ~Canvas();
    cairo_surface_t *_surface;
};

#endif