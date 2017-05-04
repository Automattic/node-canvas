#ifndef __IMAGE_BACKEND_H__
#define __IMAGE_BACKEND_H__

#include <v8.h>

#include "Backend.h"

using namespace std;

class ImageBackend : public Backend
{
  private:
    cairo_surface_t* createSurface();
    cairo_surface_t* recreateSurface();

  public:
    ImageBackend(int width, int height);
    ~ImageBackend();

    static Nan::Persistent<v8::FunctionTemplate> constructor;
    static void Initialize(v8::Handle<v8::Object> target);
    static NAN_METHOD(New);
};

#endif
