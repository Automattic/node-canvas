#include "Backends.h"

#include "backend/ImageBackend.h"
#include "backend/PdfBackend.h"
#include "backend/SvgBackend.h"

#ifdef HAS_FBDEV
#include "backend/FBDevBackend.h"
#endif
#ifdef HAS_X11
#include "backend/X11Backend.h"
#endif

using namespace v8;

void Backends::Initialize(Local<Object> target) {
  Nan::HandleScope scope;

  Local<Object> obj = Nan::New<Object>();
  ImageBackend::Initialize(obj);
  PdfBackend::Initialize(obj);
  SvgBackend::Initialize(obj);

  #ifdef HAS_FBDEV
    FBDevBackend::Initialize(obj);
  #endif
  #ifdef HAS_X11
    X11Backend::Initialize(obj);
  #endif

  Nan::Set(target, Nan::New<String>("Backends").ToLocalChecked(), obj).Check();
}
