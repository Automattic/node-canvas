/**
 * Cairo Xlib glue code for `XlibBackend` class
 *
 * This is needed to fix conflicting declaration between Xlib `GC` (Graphic
 * Context) and V8 `GC` (Garbage Collector). This way, all references to Xlib
 * are isolated in this class, accesible only by `XlibBackend`.
 */
#pragma once

#include <cairo.h>
#include <X11/X.h>


using namespace std;


// Extracted from `X11/Xlib.h`
struct _XDisplay;
typedef struct _XDisplay Display;


class XlibBackendPriv
{
  friend class XlibBackend;

  private:
    Display* display = NULL;
    Window window;

    XlibBackendPriv(int width, int height, char *display_name = NULL);
    ~XlibBackendPriv();

    cairo_surface_t* cairo_surface_create(int width, int height);

    void ResizeWindow(int width, int height);
};


class XlibBackendException : public std::exception {
  private:
    string err_msg;

  public:
    XlibBackendException(const string msg) : err_msg(msg) {};
    ~XlibBackendException() throw() {};

    const char *what() const throw() { return this->err_msg.c_str(); };
};
