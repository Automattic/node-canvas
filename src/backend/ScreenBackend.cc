#include "ScreenBackend.h"


using Nan::AsyncQueueWorker;
using Nan::AsyncWorker;
using Nan::Callback;


class WaitVSync: public AsyncWorker
{
  public:
    WaitVSync(Callback* callback, ScreenBackend* backend)
      : AsyncWorker(callback, "ScreenBackend:WaitVSync")
      , backend(backend)
    {}

    void Execute()
    {
      backend->waitVSync();
    }

  private:
    ScreenBackend* backend;
};


NAN_METHOD(ScreenBackend::swapBuffers)
{
  ScreenBackend* backend = Nan::ObjectWrap::Unwrap<ScreenBackend>(info.This());

  backend->swapBuffers();
}

NAN_METHOD(ScreenBackend::waitVSync)
{
  ScreenBackend* backend = Nan::ObjectWrap::Unwrap<ScreenBackend>(info.This());

  Callback* callback = new Callback(info[0].As<v8::Function>());

  AsyncQueueWorker(new WaitVSync(callback, backend));
}


void ScreenBackend::Initialize(Local<FunctionTemplate> ctor)
{
	Nan::SetPrototypeMethod(ctor, "swapBuffers", swapBuffers);
	Nan::SetPrototypeMethod(ctor, "waitVSync", waitVSync);
}
