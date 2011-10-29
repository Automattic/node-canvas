
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
#include <node_version.h>
#include <cairo.h>

using namespace v8;
using namespace node;

/*
 * Maxmimum states per context.
 * TODO: remove/resize
 */

#ifndef CANVAS_MAX_STATES
#define CANVAS_MAX_STATES 64
#endif

/*
 * Canvas.
 */

class Canvas: public node::ObjectWrap {
  public:
    int width;
    int height;
    static Persistent<FunctionTemplate> constructor;
    static void Initialize(Handle<Object> target);
    static Handle<Value> New(const Arguments &args);
    static Handle<Value> ToBuffer(const Arguments &args);
    static Handle<Value> GetWidth(Local<String> prop, const AccessorInfo &info);
    static Handle<Value> GetHeight(Local<String> prop, const AccessorInfo &info);
    static void SetWidth(Local<String> prop, Local<Value> val, const AccessorInfo &info);
    static void SetHeight(Local<String> prop, Local<Value> val, const AccessorInfo &info);
    static Handle<Value> StreamPNGSync(const Arguments &args);
    static Local<Value> Error(cairo_status_t status);
    static
#if NODE_VERSION_AT_LEAST(0, 5, 4)
      void
#else
      int
#endif
      EIO_ToBuffer(eio_req *req);
    static int EIO_AfterToBuffer(eio_req *req);
    inline cairo_surface_t *surface(){ return _surface; }
    inline uint8_t *data(){ return cairo_image_surface_get_data(_surface); }
    inline int stride(){ return cairo_image_surface_get_stride(_surface); }
    Canvas(int width, int height);
    void resurface(Handle<Object> canvas);

  private:
    ~Canvas();
    cairo_surface_t *_surface;
};

#endif
