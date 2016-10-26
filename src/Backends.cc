#include "Backends.h"

#include "backend/ImageBackend.h"
#include "backend/PdfBackend.h"
#include "backend/SvgBackend.h"

using namespace v8;

void Backends::Initialize(Handle<Object> target) {
  Nan::HandleScope scope;

  Local<Object> obj = Nan::New<Object>();
  ImageBackend::Initialize(obj);
  PdfBackend::Initialize(obj);
  SvgBackend::Initialize(obj);

  target->Set(Nan::New<String>("Backends").ToLocalChecked(), obj);
}
