#ifndef __BACKEND_H__
#define __BACKEND_H__

#include <iostream>
#include <string>
#include <sstream>
#include <exception>

#include <nan.h>
#include <cairo.h>

class Canvas;

using namespace std;

class Backend : public Nan::ObjectWrap
{
  private:
    const string name;

  protected:
    int width;
    int height;
    cairo_surface_t* surface;
    Canvas* canvas;

    Backend(string name, int width, int height);

  public:
    virtual ~Backend();

    // TODO Used only by SVG and PDF, move there
    void* _closure;
    inline void* closure(){ return _closure; }

    void setCanvas(Canvas* canvas);

    virtual cairo_surface_t* createSurface() = 0;
    virtual cairo_surface_t* recreateSurface();

    cairo_surface_t* getSurface();
    void             destroySurface();

    string getName();

    int getWidth();
    virtual void setWidth(int width);

    int getHeight();
    virtual void setHeight(int height);

    // Overridden by ImageBackend. SVG and PDF thus always return INVALID.
    virtual cairo_format_t getFormat() { return CAIRO_FORMAT_INVALID; }
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
