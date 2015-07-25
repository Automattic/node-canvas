
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

#if HAVE_PANGO
#include <pango/pangocairo.h>
#else
#include <cairo.h>
#endif

#include <nan.h>

#include "backend/Backend.h"

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
    static Persistent<FunctionTemplate> constructor;
    static void Initialize(Handle<Object> target);
    static NAN_METHOD(New);
    static NAN_METHOD(ToBuffer);
    static NAN_GETTER(GetType);
    static NAN_GETTER(GetWidth);
    static NAN_GETTER(GetHeight);
    static NAN_SETTER(SetWidth);
    static NAN_SETTER(SetHeight);
    static NAN_METHOD(StreamPNGSync);
    static NAN_METHOD(StreamJPEGSync);
    static Local<Value> Error(cairo_status_t status);

    static void ToBufferAsync(uv_work_t *req);
    static void ToBufferAsyncAfter(uv_work_t *req);

    inline Backend *backend() { return _backend; }
    inline cairo_surface_t *surface(){ return backend()->getSurface(); }
    inline uint8_t *data(){ return cairo_image_surface_get_data(backend()->getSurface()); }
    inline int stride(){ return cairo_image_surface_get_stride(backend()->getSurface()); }

    inline int getWidth() { return backend()->getWidth(); }
    inline int getHeight() { return backend()->getHeight(); }

    Canvas(Backend *backend);
    void resurface(Handle<Object> canvas);

    inline void *closure(){ return _closure; }

  private:
    ~Canvas();
    Backend *_backend;
    void *_closure;
};

#endif
