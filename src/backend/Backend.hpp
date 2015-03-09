#ifndef __BACKEND_H__
#define __BACKEND_H__

#include <string>

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
    virtual ~Backend() {
      this->destroySurface();
    };

    virtual cairo_surface_t *createSurface();
    virtual cairo_surface_t *recreateSurface();
    virtual void destroySurface();

    string getName() { return name; };

    int getWidth() { return this->width; };
    void setWidth(int width) { this->width = width; this->recreateSurface(); };

    int getHeight() { return this->width; };
    void setHeight(int height) { this->height = height; this->recreateSurface(); };

    cairo_surface_t *getSurface() { return surface; };
};

#endif
