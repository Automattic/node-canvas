
//
// Canvas.h
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#ifndef __NODE_CANVAS_H__
#define __NODE_CANVAS_H__

#include <node.h>
#include <v8.h>
#include <node_object_wrap.h>
#include <node_version.h>
#include <pango/pangocairo.h>
#include <vector>
#include <cairo.h>
#include <nan.h>

#include "backend/Backend.h"


using namespace node;
using namespace v8;

/*
 * Maxmimum states per context.
 * TODO: remove/resize
 */

#ifndef CANVAS_MAX_STATES
#define CANVAS_MAX_STATES 64
#endif

/*
 * FontFace describes a font file in terms of one PangoFontDescription that
 * will resolve to it and one that the user describes it as (like @font-face)
 */
class FontFace {
  public:
    PangoFontDescription *sys_desc = NULL;
    PangoFontDescription *user_desc = NULL;
};

/*
 * Canvas.
 */

class Canvas: public Nan::ObjectWrap {
  public:
    static Nan::Persistent<FunctionTemplate> constructor;
    static void Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target);
    static NAN_METHOD(New);
    static NAN_METHOD(ToBuffer);
    static NAN_GETTER(GetType);
    static NAN_GETTER(GetStride);
    static NAN_GETTER(GetWidth);
    static NAN_GETTER(GetHeight);
    static NAN_SETTER(SetWidth);
    static NAN_SETTER(SetHeight);
    static NAN_METHOD(StreamPNGSync);
    static NAN_METHOD(StreamPDFSync);
    static NAN_METHOD(StreamJPEGSync);
    static NAN_METHOD(RegisterFont);
    static Local<Value> Error(cairo_status_t status);
    static void ToBufferAsync(uv_work_t *req);
    static void ToBufferAsyncAfter(uv_work_t *req);
    static PangoWeight GetWeightFromCSSString(const char *weight);
    static PangoStyle GetStyleFromCSSString(const char *style);
    static PangoFontDescription *ResolveFontDescription(const PangoFontDescription *desc);

    inline Backend* backend() { return _backend; }
    inline cairo_surface_t* surface(){ return backend()->getSurface(); }

    inline uint8_t *data(){ return cairo_image_surface_get_data(surface()); }
    inline int stride(){ return cairo_image_surface_get_stride(surface()); }
    inline int nBytes(){ return getHeight() * stride(); }

    inline int getWidth() { return backend()->getWidth(); }
    inline int getHeight() { return backend()->getHeight(); }

    Canvas(Backend* backend);
    void resurface(Local<Object> canvas);

  private:
    ~Canvas();
    Backend* _backend;
    static std::vector<FontFace> _font_face_list;
};

#endif
