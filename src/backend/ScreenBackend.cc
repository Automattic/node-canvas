#include "ScreenBackend.h"


using namespace v8;


NAN_METHOD(ScreenBackend::swapBuffers)
{
  ScreenBackend* backend = Nan::ObjectWrap::Unwrap<ScreenBackend>(info.This());

  backend->swapBuffers();
}

void ScreenBackend::Initialize(Local<FunctionTemplate> ctor)
{
	Nan::SetPrototypeMethod(ctor, "swapBuffers", swapBuffers);
}
