
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
#include <cairo/cairo.h>
#endif

#include <nan.h>

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
 * Canvas types.
 */

typedef enum {
  CANVAS_TYPE_IMAGE,
  CANVAS_TYPE_PDF,
  CANVAS_TYPE_SVG
} canvas_type_t;

/*
 * Canvas.
 */

class Canvas: public node::ObjectWrap {
  public:
    int width;
    int height;
    canvas_type_t type;
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
#if NODE_VERSION_AT_LEAST(0, 6, 0)
    static void ToBufferAsync(uv_work_t *req);
    static void ToBufferAsyncAfter(uv_work_t *req);
#else
    static
#if NODE_VERSION_AT_LEAST(0, 5, 4)
      void
#else
      int
#endif
      EIO_ToBuffer(eio_req *req);
    static int EIO_AfterToBuffer(eio_req *req);
#endif

    inline bool isPDF(){ return CANVAS_TYPE_PDF == type; }
    inline bool isSVG(){ return CANVAS_TYPE_SVG == type; }
    inline cairo_surface_t *surface(){ return _surface; }
    inline void *closure(){ return _closure; }
    inline uint8_t *data(){ return cairo_image_surface_get_data(_surface); }
    inline int stride(){ return cairo_image_surface_get_stride(_surface); }
    Canvas(int width, int height, canvas_type_t type);
    void resurface(Handle<Object> canvas);

  private:
    ~Canvas();
    cairo_surface_t *_surface;
    void *_closure;
};

#endif
