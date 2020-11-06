#ifndef __WIN32_BACKEND_H__
#define __WIN32_BACKEND_H__

#include <nan.h>

#include <cairo-win32.h>

#include "ScreenBackend.h"


using namespace std;


class Win32Backend : public ScreenBackend
{
  private:
    HWND window;

    ~Win32Backend();

    void createSurface();

    void setWidth(int width);
    void setHeight(int height);

  public:
    Win32Backend(int width, int height);

    static Nan::Persistent<v8::FunctionTemplate> constructor;
    static void Initialize(v8::Handle<v8::Object> target);
    static NAN_METHOD(New);
};


class Win32BackendException : public std::exception
{
  private:
    string err_msg;

  public:
    Win32BackendException(const string msg) : err_msg(msg) {};
    ~Win32BackendException() throw() {};

    const char *what() const throw() { return this->err_msg.c_str(); };
};

#endif
