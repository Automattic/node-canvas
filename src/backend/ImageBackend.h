#ifndef __IMAGE_BACKEND_H__
#define __IMAGE_BACKEND_H__

#include "Backend.h"

using namespace std;

class ImageBackend : public Backend {
  public:
    virtual cairo_surface_t *createSurface();
    virtual cairo_surface_t *recreateSurface();
    virtual void destroySurface();

    void setWidth(int width);
    void setHeight(int height);

    ImageBackend(int width, int height);
    ~ImageBackend() { this->destroySurface(); }
};

#endif
