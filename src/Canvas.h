// Copyright (c) 2010 LearnBoost <tj@learnboost.com>

#pragma once

struct Closure;

#include "closure.h"
#include <cairo.h>
#include <napi.h>
#include <vector>
#include <cstddef>

#define DLL_PUBLIC __attribute__ ((visibility ("default")))
#define DLL_LOCAL  __attribute__ ((visibility ("hidden")))

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

class Canvas : public Napi::ObjectWrap<Canvas> {
  public:
    Canvas(const Napi::CallbackInfo& info);
    ~Canvas();
    static void Initialize(Napi::Env& env, Napi::Object& target);

    Napi::Value ToBuffer(const Napi::CallbackInfo& info);
    Napi::Value GetType(const Napi::CallbackInfo& info);
    Napi::Value GetStride(const Napi::CallbackInfo& info);
    Napi::Value GetWidth(const Napi::CallbackInfo& info);
    Napi::Value GetHeight(const Napi::CallbackInfo& info);
    void SetWidth(const Napi::CallbackInfo& info, const Napi::Value& value);
    void SetHeight(const Napi::CallbackInfo& info, const Napi::Value& value);
    void StreamPNGSync(const Napi::CallbackInfo& info);
    void StreamPDFSync(const Napi::CallbackInfo& info);
    void StreamJPEGSync(const Napi::CallbackInfo& info);
    static Napi::Value ParseFont(const Napi::CallbackInfo& info);
    Napi::Error CairoError(cairo_status_t status);
    static void ToPngBufferAsync(Closure* closure);
    static void ToJpegBufferAsync(Closure* closure);
    
    inline bool isPDF() { return type == CANVAS_TYPE_PDF; }
    inline bool isSVG() { return type == CANVAS_TYPE_SVG; }
    inline bool isImage() { return type == CANVAS_TYPE_IMAGE; }
    inline void *closure() { return _closure; }

    cairo_t* createCairoContext();

    DLL_PUBLIC inline uint8_t *data() { return cairo_image_surface_get_data(ensureSurface()); }
    DLL_PUBLIC inline int stride() { return cairo_image_surface_get_stride(ensureSurface()); }
    DLL_PUBLIC inline std::size_t nBytes() {
      return static_cast<std::size_t>(height * stride());
    }

    DLL_PUBLIC inline int getWidth() { return width; }
    DLL_PUBLIC inline int getHeight() { return height; }

    uint32_t approxBytesPerPixel();
    void setFormat(cairo_format_t format);
    cairo_format_t getFormat();
    void resurface(Napi::Object This);
    cairo_surface_t *ensureSurface();
    void destroySurface();

    Napi::Env env;

  private:

    cairo_surface_t *_surface;
    Closure *_closure;
  
    Napi::FunctionReference ctor;
    
    int width;
    int height;
    canvas_type_t type;
    cairo_format_t format;
};
