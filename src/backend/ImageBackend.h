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
    cairo_format_t format = DEFAULT_FORMAT;

  public:
    ImageBackend(int width, int height);
    ~ImageBackend();
    static Backend *construct(int width, int height);

    cairo_format_t getFormat();
    void setFormat(cairo_format_t format);

    int32_t approxBytesPerPixel();

    static Nan::Persistent<v8::FunctionTemplate> constructor;
    static void Initialize(v8::Handle<v8::Object> target);
    static NAN_METHOD(New);
    const static cairo_format_t DEFAULT_FORMAT = CAIRO_FORMAT_ARGB32;
};

#endif
