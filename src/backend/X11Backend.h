#ifndef __X11_BACKEND_H__
#define __X11_BACKEND_H__

#include "Backend.h"
#include <X11/Xlib.h>
#include <cairo-xlib.h>

using namespace std;

class X11Backend : public Backend
{
  private:
    Display* display;
    Window window;

    ~X11Backend();

    cairo_surface_t* createSurface();
    void             destroySurface();

    void setWidth(int width);
    void setHeight(int height);

  public:
    X11Backend(int width, int height);

    static Persistent<FunctionTemplate> constructor;
    static void Initialize(Handle<Object> target);
    static NAN_METHOD(New);
};


class X11BackendException : public std::exception {
  private:
    string err_msg;

  public:
    X11BackendException(const string msg) : err_msg(msg) {};
    ~X11BackendException() throw() {};
    const char *what() const throw() { return this->err_msg.c_str(); };
};


#endif
