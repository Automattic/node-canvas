#pragma once

#include "Backend.h"
#include <napi.h>

class ImageBackend : public Napi::ObjectWrap<ImageBackend>, public Backend
{
  private:
    cairo_surface_t* createSurface();
    void destroySurface();
    cairo_format_t format = DEFAULT_FORMAT;

  public:
    ImageBackend(Napi::CallbackInfo& info);

    cairo_format_t getFormat();
    void setFormat(cairo_format_t format);

    int32_t approxBytesPerPixel();

    static Napi::FunctionReference constructor;
    static void Initialize(Napi::Object target);
    const static cairo_format_t DEFAULT_FORMAT = CAIRO_FORMAT_ARGB32;
};
