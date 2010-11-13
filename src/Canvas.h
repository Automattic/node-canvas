
//
// Canvas.h
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

/*
 * Maxmimum states per context.
 * TODO: remove/resize
 */

#ifndef CANVAS_MAX_STATES
#define CANVAS_MAX_STATES 64
#endif

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
  double r = args[N]->Int32Value(); \
  double g = args[N+1]->Int32Value(); \
  double b = args[N+2]->Int32Value(); \
  double a = args[N+3]->NumberValue();

/*
 * Canvas.
 */

class Canvas: public node::ObjectWrap {
  public:
    int width;
    int height;
    static void Initialize(Handle<Object> target);
    static Handle<Value> New(const Arguments &args);
    static Handle<Value> ToBuffer(const Arguments &args);
    static Handle<Value> GetWidth(Local<String> prop, const AccessorInfo &info);
    static Handle<Value> GetHeight(Local<String> prop, const AccessorInfo &info);
    static void SetWidth(Local<String> prop, Local<Value> val, const AccessorInfo &info);
    static void SetHeight(Local<String> prop, Local<Value> val, const AccessorInfo &info);
    static Handle<Value> StreamPNGSync(const Arguments &args);
    static Local<Value> Error(cairo_status_t status);
    inline cairo_surface_t *surface(){ return _surface; }
    inline uint8_t *data(){ return cairo_image_surface_get_data(_surface); }
    inline int stride(){ return cairo_image_surface_get_stride(_surface); }
    Canvas(int width, int height);
    void resurface();

  private:
    ~Canvas();
    cairo_surface_t *_surface;
};

#endif
