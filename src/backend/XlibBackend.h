#ifndef __XLIB_BACKEND_H__
#define __XLIB_BACKEND_H__

#include "ScreenBackend.h"

#include <nan.h>

#include "XlibBackendPriv.h"


using namespace std;


class XlibBackend : public ScreenBackend
{
  private:
    XlibBackendPriv xlibBackendPriv;

    ~XlibBackend();

    void createSurface();

    void setWidth(int width);
    void setHeight(int height);

  public:
    XlibBackend(int width, int height);

    static Nan::Persistent<v8::FunctionTemplate> constructor;
    static void Initialize(v8::Local<v8::Object> target);
    static NAN_METHOD(New);
};


class XlibBackendException : public std::exception {
  private:
    string err_msg;

  public:
    XlibBackendException(const string msg) : err_msg(msg) {};
    ~XlibBackendException() throw() {};

    const char *what() const throw() { return this->err_msg.c_str(); };
};


#endif
