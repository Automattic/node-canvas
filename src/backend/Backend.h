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

class Backend : public ObjectWrap {
  protected:
    string name;

    int width;
    int height;
    cairo_surface_t *surface;

  public:
    virtual ~Backend() = 0;
    virtual cairo_surface_t *createSurface() = 0;
    virtual cairo_surface_t *recreateSurface() = 0;
    virtual void destroySurface() = 0;
    string getName();
    int getWidth();
    void setWidth(int width);
    int getHeight();
    void setHeight(int height);
    cairo_surface_t* getSurface();
};

class BackendOperationNotAvailable : public exception {
  private:
    Backend* backend;
    string operation_name;

  public:
    BackendOperationNotAvailable(Backend* backend, string operation_name);
    ~BackendOperationNotAvailable() throw();

    const char* what() const throw();
};

#endif
