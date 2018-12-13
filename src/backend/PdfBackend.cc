#include "PdfBackend.h"

#include <cairo-pdf.h>
#include <png.h>

#include "../Canvas.h"
#include "../closure.h"
#include "../toBuffer.h"


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

void PdfBackend::createSurface() {
  if (!_closure) _closure = new PdfSvgClosure(canvas);

  surface = cairo_pdf_surface_create_for_stream(toBuffer, _closure, width, height);
}

void PdfBackend::recreateSurface() {
  cairo_pdf_surface_set_size(surface, width, height);
}


Nan::Persistent<FunctionTemplate> PdfBackend::constructor;

void PdfBackend::Initialize(Handle<Object> target) {
  Nan::HandleScope scope;

  Local<FunctionTemplate> ctor = Nan::New<FunctionTemplate>(PdfBackend::New);
  PdfBackend::constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New<String>("PdfBackend").ToLocalChecked());
  target->Set(Nan::New<String>("PdfBackend").ToLocalChecked(), ctor->GetFunction());
}

NAN_METHOD(PdfBackend::New) {
  init(info);
}
