#pragma once

#include "Backend.h"
#include "../closure.h"
#include <napi.h>

class SvgBackend : public Napi::ObjectWrap<SvgBackend>, public Backend
{
  private:
    cairo_surface_t* createSurface();
    cairo_surface_t* recreateSurface();

  public:
    PdfSvgClosure* _closure = NULL;
    inline PdfSvgClosure* closure() { return _closure; }

    SvgBackend(Napi::CallbackInfo& info);
    ~SvgBackend();

    static void Initialize(Napi::Object target);
};
