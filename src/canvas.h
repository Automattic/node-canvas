
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

/*
 * RGBA arg assertions.
 */

#define RGBA_ARGS(N) \
  if (!args[N]->IsNumber()) \
    return ThrowException(Exception::TypeError(String::New("r required"))); \
  if (!args[N+1]->IsNumber()) \
    return ThrowException(Exception::TypeError(String::New("g required"))); \
  if (!args[N+2]->IsNumber()) \
    return ThrowException(Exception::TypeError(String::New("b required"))); \
  if (!args[N+3]->IsNumber()) \
    return ThrowException(Exception::TypeError(String::New("alpha required"))); \
  float r = args[N]->Int32Value(); \
  float g = args[N+1]->Int32Value(); \
  float b = args[N+2]->Int32Value(); \
  float a = args[N+3]->NumberValue();

using namespace v8;

class Canvas: public node::ObjectWrap {
  public:
    static void Initialize(Handle<Object> target);
    static Handle<Value> New(const Arguments &args);
    static Handle<Value> SavePNG(const Arguments &args);
    static Handle<Value> StreamPNG(const Arguments &args);
    inline cairo_surface_t *getSurface(){ return _surface; }
    static void blur(cairo_surface_t *surface, int radius);
    Canvas(int width, int height);

  private:
    ~Canvas();
    cairo_surface_t *_surface;
};

#endif