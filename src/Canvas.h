// Copyright (c) 2010 LearnBoost <tj@learnboost.com>

#pragma once

struct Closure;

#include "backend/Backend.h"
#include "closure.h"
#include <cairo.h>
#include "dll_visibility.h"
#include <napi.h>
#include <vector>
#include <cstddef>

/*
 * Canvas.
 */

class Canvas : public Napi::ObjectWrap<Canvas> {
  public:
    Canvas(const Napi::CallbackInfo& info);
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

    DLL_PUBLIC inline Backend* backend() { return _backend; }
    DLL_PUBLIC inline cairo_surface_t* surface(){ return backend()->ensureSurface(); }
    cairo_t* createCairoContext();

    DLL_PUBLIC inline uint8_t *data(){ return cairo_image_surface_get_data(surface()); }
    DLL_PUBLIC inline int stride(){ return cairo_image_surface_get_stride(surface()); }
    DLL_PUBLIC inline std::size_t nBytes(){
      return static_cast<std::size_t>(backend()->getHeight()) * stride();
    }

    DLL_PUBLIC inline int getWidth() { return backend()->getWidth(); }
    DLL_PUBLIC inline int getHeight() { return backend()->getHeight(); }

    void resurface(Napi::Object This);

    Napi::Env env;

  private:
    Backend* _backend;
    Napi::ObjectReference _jsBackend;
    Napi::FunctionReference ctor;
};
