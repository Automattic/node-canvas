#pragma once

#include <cairo.h>
#include "../dll_visibility.h"
#include <exception>
#include <nan.h>
#include <string>
#include <v8.h>

class Canvas;

using namespace v8;


class Backend : public Nan::ObjectWrap
{
  friend class WaitVSync;

  private:
    const std::string name;
    const char* error = NULL;

    virtual void swapBuffers(){};
    virtual void waitVSync(){};

  protected:
    int width;
    int height;
    cairo_format_t format;
    cairo_surface_t* surface = nullptr;
    Canvas* canvas = nullptr;

    Backend(std::string name, int width = 0, int height = 0);

    virtual void createSurface() = 0;
    virtual void destroySurface();
    virtual void recreateSurface();

    static void init(const Nan::FunctionCallbackInfo<v8::Value> &info);
    static Backend *construct(int width, int height){ return nullptr; }
    static void Initialize(Local<FunctionTemplate> ctor);

  public:
    virtual ~Backend();

    void setCanvas(Canvas* canvas);

    DLL_PUBLIC cairo_surface_t* getSurface();
    DLL_PUBLIC std::string getName();

    DLL_PUBLIC int getWidth();
    virtual void setWidth(int width);

    DLL_PUBLIC int getHeight();
    virtual void setHeight(int height);

    // Overridden by ImageBackend. SVG and PDF thus always return INVALID.
    virtual cairo_format_t getFormat();
    virtual void setFormat(cairo_format_t format);

    bool isSurfaceValid();
    inline const char* getError(){ return error; }

    static NAN_METHOD(swapBuffers);
    static NAN_METHOD(waitVSync);
};


class BackendOperationNotAvailable: public std::exception
{
  private:
    Backend* backend;
    std::string operation_name;

  public:
    BackendOperationNotAvailable(Backend* backend, std::string operation_name);
    ~BackendOperationNotAvailable() throw();

    const char* what() const throw();
};
