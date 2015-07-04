#include "Backends.h"

void Backends::Initialize(Handle<Object> target) {
  NanScope();

  Local<Object> obj = NanNew<Object>();
  obj->Set(NanNew<String>("Image"), NanNew("imagebackend"));

  target->Set(NanNew("Backends"), obj);
}
