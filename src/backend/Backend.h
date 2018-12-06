#ifndef __BACKEND_H__
#define __BACKEND_H__

#include <iostream>
#include <string>
#include <sstream>
#include <exception>

#include <v8.h>
#include <nan.h>
#include <cairo.h>

#include "../dll_visibility.h"

class Canvas;

using namespace std;
using namespace v8;


class Backend : public Nan::ObjectWrap
{
  friend class WaitVSync;

  private:
    const string name;
    const char* error = NULL;

    virtual void waitVSync(){};

  protected:
    int width;
    int height;
    cairo_format_t format;
    cairo_surface_t* surface;
    Canvas* canvas;

    Backend(string name, int width = 0, int height = 0);
    static void init(const Nan::FunctionCallbackInfo<v8::Value> &info);
    static Backend *construct(int width, int height){ return nullptr; }
    static void Initialize(Local<FunctionTemplate> ctor);

  public:
    virtual ~Backend();

    void setCanvas(Canvas* canvas);

    virtual cairo_surface_t* createSurface() = 0;
    virtual cairo_surface_t* recreateSurface();

    DLL_PUBLIC cairo_surface_t* getSurface();
    void             destroySurface();

    DLL_PUBLIC string getName();

    DLL_PUBLIC int getWidth();
    virtual void setWidth(int width);

    DLL_PUBLIC int getHeight();
    virtual void setHeight(int height);

    // Overridden by ImageBackend. SVG and PDF thus always return INVALID.
    virtual cairo_format_t getFormat();
    virtual void setFormat(cairo_format_t format);

    bool isSurfaceValid();
    inline const char* getError(){ return error; }

    static NAN_METHOD(waitVSync);
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
