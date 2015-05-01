#ifndef __BACKEND_H__
#define __BACKEND_H__

#include <iostream>
#include <string>
#include <sstream>
#include <exception>

#if HAVE_PANGO
  #include <pango/pangocairo.h>
#else
  #include <cairo/cairo.h>
#endif

using namespace std;

class Backend
{
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

    string getName() { return name; };

    int getWidth() { return this->width; };
    void setWidth(int width) { this->width = width; this->recreateSurface(); };

    int getHeight() { return this->width; };
    void setHeight(int height) { this->height = height; this->recreateSurface(); };

    cairo_surface_t *getSurface() { return surface; };
};

class BackendOperationNotAvailable : public exception {
  private:
    Backend *backend;
    string operation_name;

  public:
    BackendOperationNotAvailable(Backend *backend, string operation_name) {
      this->backend = backend;
      this->operation_name = operation_name;
    };
    ~BackendOperationNotAvailable() throw() {};
    const char *what() const throw() {
      std::ostringstream o;
      o << "operation " << this->operation_name << " not supported by backend " + backend->getName();
      return o.str().c_str();
    };
};

#endif
