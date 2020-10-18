#ifndef __XLIB_BACKEND_H__
#define __XLIB_BACKEND_H__

#include <nan.h>

#include <cairo-xlib.h>

#include "Backend.h"


using namespace std;


class XlibBackend : public Backend
{
  private:
    Display* display;
    Window window;

    ~XlibBackend();

    cairo_surface_t* createSurface();
    void             destroySurface();

    void setWidth(int width);
    void setHeight(int height);

  public:
    XlibBackend(int width, int height);

    static Nan::Persistent<v8::FunctionTemplate> constructor;
    static void Initialize(v8::Handle<v8::Object> target);
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
