#ifndef __XLIB_BACKEND_H__
#define __XLIB_BACKEND_H__

#include "ScreenBackend.h"

#include <nan.h>

#include "XlibBackendPriv.h"


class XlibBackend : public ScreenBackend
{
  private:
    XlibBackendPriv xlibBackendPriv;

    void createSurface();

    void setWidth(int width);
    void setHeight(int height);

  public:
    XlibBackend(int width, int height, char *display_name = NULL);

    static Nan::Persistent<v8::FunctionTemplate> constructor;
    static void Initialize(v8::Local<v8::Object> target);
    static NAN_METHOD(New);
};


#endif
