#ifndef __BACKEND_H__
#define __BACKEND_H__

#include <iostream>
#include <string>
#include <sstream>
#include <exception>

#include <v8.h>
#include <node.h>
#include <node_object_wrap.h>
#include <node_version.h>
#include <nan.h>

#if HAVE_PANGO
  #include <pango/pangocairo.h>
#else
  #include <cairo/cairo.h>
#endif

using namespace v8;
using namespace node;
using namespace std;

class Backend : public ObjectWrap
{
  private:
    const string name;

  protected:
    int width;
    int height;
    cairo_surface_t* surface;

    Backend(string name);

  public:
    virtual ~Backend();

    virtual cairo_surface_t* createSurface() = 0;
    virtual void             destroySurface();

    cairo_surface_t* recreateSurface();
    cairo_surface_t* getSurface();

    string getName();

    int getWidth();
    virtual void setWidth(int width);

    int getHeight();
    virtual void setHeight(int height);
};


class BackendOperationNotAvailable: public exception
{
  private:
    Backend* backend;
    string operation_name;

  public:
    BackendOperationNotAvailable(Backend* backend, string operation_name);
    ~BackendOperationNotAvailable() throw();

    const char* what() const throw();
};

#endif
