#include "SvgBackend.h"

#include <cairo-svg.h>
#include <napi.h>
#include "../Canvas.h"
#include "../closure.h"
#include "../InstanceData.h"
#include <cassert>

using namespace Napi;

SvgBackend::SvgBackend(Napi::CallbackInfo& info) : Napi::ObjectWrap<SvgBackend>(info), Backend("svg", info) {
  SvgBackend::createSurface();
}

SvgBackend::~SvgBackend() {
  cairo_surface_finish(surface);
  if (_closure) {
    delete _closure;
    _closure = nullptr;
  }
  destroySurface();
}

cairo_surface_t* SvgBackend::createSurface() {
  assert(!_closure);
  _closure = new PdfSvgClosure(canvas);
  surface = cairo_svg_surface_create_for_stream(PdfSvgClosure::writeVec, _closure, width, height);
  return surface;
}

cairo_surface_t* SvgBackend::recreateSurface() {
  cairo_surface_finish(surface);
  delete _closure;
  _closure = nullptr;
  cairo_surface_destroy(surface);

  return createSurface();
 }


void
SvgBackend::Initialize(Napi::Object target) {
  Napi::Env env = target.Env();
  Napi::Function ctor = DefineClass(env, "SvgBackend", {});
  InstanceData* data = env.GetInstanceData<InstanceData>();
  data->SvgBackendCtor = Napi::Persistent(ctor);
}
