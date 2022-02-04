#include "PdfBackend.h"

#include <cairo-pdf.h>
#include "../Canvas.h"
#include "../closure.h"

using namespace v8;

PdfBackend::PdfBackend(int width, int height)
  : Backend("pdf", width, height) {
  createSurface();
}

PdfBackend::~PdfBackend() {
  cairo_surface_finish(surface);
  if (_closure) delete _closure;
  destroySurface();
}

Backend *PdfBackend::construct(int width, int height){
  return new PdfBackend(width, height);
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


const char *PdfBackend::ctor_name = "PdfBackend";

void PdfBackend::Initialize(Local<Object> target, AddonData *addon_data) {
  Nan::HandleScope scope;

  Local<External> data_holder = Nan::New<External>(addon_data);
  Local<FunctionTemplate> ctor = Nan::New<FunctionTemplate>(PdfBackend::New, data_holder);

  addon_data->pdf_backend_ctor_tpl.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(2);
  ctor->SetClassName(Nan::New<String>(ctor_name).ToLocalChecked());
  Nan::Set(target,
           Nan::New<String>(ctor_name).ToLocalChecked(),
           Nan::GetFunction(ctor).ToLocalChecked()).Check();
}

NAN_METHOD(PdfBackend::New) {
  init(info);
}
