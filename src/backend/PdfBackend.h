#ifndef __PDF_BACKEND_H__
#define __PDF_BACKEND_H__

#include <v8.h>

#include "../closure.h"
#include "Backend.h"

using namespace std;

class PdfBackend : public Backend
{
  private:
    cairo_surface_t* createSurface();
    cairo_surface_t* recreateSurface();

  public:
    PdfSvgClosure* _closure = NULL;
    inline PdfSvgClosure* closure() { return _closure; }

    PdfBackend(int width, int height);
    ~PdfBackend();
    static Backend *construct(int width, int height);

    static Nan::Persistent<v8::FunctionTemplate> constructor;
    static void Initialize(v8::Handle<v8::Object> target);
    static NAN_METHOD(New);
};

#endif
