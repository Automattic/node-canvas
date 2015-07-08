#include "Backends.h"

#include "backend/ImageBackend.h"

#ifdef HAS_FBDEV
#include "backend/FBDevBackend.h"
#endif
#ifdef HAS_X11
#include "backend/X11Backend.h"
#endif

void Backends::Initialize(Handle<Object> target) {
  NanScope();

  Local<Object> obj = NanNew<Object>();
  ImageBackend::Initialize(obj);

  #ifdef HAS_FBDEV
    FBDevBackend::Initialize(obj);
  #endif
  #ifdef HAS_X11
    X11Backend::Initialize(obj);
  #endif

  target->Set(NanNew("Backends"), obj);
}
