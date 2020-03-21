#pragma once

#include <cairo.h>
#include "../dll_visibility.h"
#include <exception>
#include <nan.h>
#include <string>
#include <v8.h>

class Canvas;

class Backend : public Nan::ObjectWrap
{
  private:
    const std::string name;
    const char* error = NULL;

    uv_thread_t vSyncThread;
    long requestID;

    void dispatchWaitVSync();

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

  public:
    bool listenOnPaint;
    bool waitingVSync;
    map_callbacks* raf_callbacks;

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

    void onPaint();

    virtual void waitVSync(){};
    virtual void swapBuffers(){};
    void executeCallbacks();

    NAN_METHOD(requestAnimationFrame);
    NAN_METHOD(cancelAnimationFrame);
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
