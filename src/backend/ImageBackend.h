#ifndef __IMAGE_BACKEND_H__
#define __IMAGE_BACKEND_H__

#include "Backend.h"

using namespace std;

class ImageBackend : public Backend
{
  private:
    cairo_surface_t* createSurface();

  public:
    ImageBackend(int width, int height);

    static Persistent<FunctionTemplate> constructor;
    static void Initialize(Handle<Object> target);
    static NAN_METHOD(New);
};

#endif
