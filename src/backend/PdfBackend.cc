#include "PdfBackend.h"

#include <cairo-pdf.h>
#include "../InstanceData.h"
#include "../Canvas.h"
#include "../closure.h"

PdfBackend::PdfBackend(Napi::CallbackInfo& info) : Napi::ObjectWrap<PdfBackend>(info), Backend("pdf", info) {
  PdfBackend::createSurface();
}

PdfBackend::~PdfBackend() {
  cairo_surface_finish(surface);
  if (_closure) delete _closure;
  destroySurface();
}

cairo_surface_t* PdfBackend::createSurface() {
  if (!_closure) _closure = new PdfSvgClosure(canvas);
  surface = cairo_pdf_surface_create_for_stream(PdfSvgClosure::writeVec, _closure, width, height);
  return surface;
}

cairo_surface_t* PdfBackend::recreateSurface() {
  cairo_pdf_surface_set_size(surface, width, height);

  return surface;
}

void
PdfBackend::Initialize(Napi::Object target) {
  Napi::Env env = target.Env();
  InstanceData* data = env.GetInstanceData<InstanceData>();
  Napi::Function ctor = DefineClass(env, "PdfBackend", {});
  data->PdfBackendCtor = Napi::Persistent(ctor);
}
