#include "SvgBackend.h"

#include <cairo-svg.h>
#include <png.h>

#include "../Canvas.h"
#include "../closure.h"
#include "../toBuffer.h"


using namespace v8;

SvgBackend::SvgBackend(int width, int height)
  : Backend("svg", width, height) {
  createSurface();
}

SvgBackend::~SvgBackend() {
  cairo_surface_finish(surface);
  if (_closure) delete _closure;
  destroySurface();
}


cairo_surface_t* SvgBackend::createSurface() {
  if (!_closure) _closure = new PdfSvgClosure(canvas);
  surface = cairo_svg_surface_create_for_stream(toBuffer, _closure, width, height);
  return surface;
}

cairo_surface_t* SvgBackend::recreateSurface() {
  cairo_surface_finish(surface);
  delete _closure;
  cairo_surface_destroy(surface);

  return createSurface();
 }


Nan::Persistent<FunctionTemplate> SvgBackend::constructor;

void SvgBackend::Initialize(Handle<Object> target) {
  Nan::HandleScope scope;

  Local<FunctionTemplate> ctor = Nan::New<FunctionTemplate>(SvgBackend::New);
  SvgBackend::constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New<String>("SvgBackend").ToLocalChecked());
  target->Set(Nan::New<String>("SvgBackend").ToLocalChecked(), ctor->GetFunction());
}

NAN_METHOD(SvgBackend::New) {
  int width  = 0;
  int height = 0;
  if (info[0]->IsNumber()) width  = info[0]->Uint32Value();
  if (info[1]->IsNumber()) height = info[1]->Uint32Value();

  SvgBackend* backend = new SvgBackend(width, height);

  backend->Wrap(info.This());
  info.GetReturnValue().Set(info.This());
}
