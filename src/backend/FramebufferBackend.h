#ifndef __FRAMEBUFFER_BACKEND_H__
#define __FRAMEBUFFER_BACKEND_H__

#include <v8.h>
#include <linux/fb.h>
#include <cairo/cairo.h>
#include <string>

#include "Backend.h"

using namespace std;

class FramebufferBackend : public Backend
{
  private:
    std::string fbdev;
    int fbfd;
    struct fb_var_screeninfo origVinfo;
    long int screenSize;

    char *fbp = nullptr;
    cairo_surface_t *screenSurface = nullptr;

    char *bbp = nullptr;
    cairo_surface_t *bufferSurface;

    bool doubleBufferEnabled = false;

  public:
    FramebufferBackend(std::string fbdev, bool doubleBufferEnabled = false);
    ~FramebufferBackend();

    static Nan::Persistent<v8::FunctionTemplate> constructor;
    static void Initialize(v8::Handle<v8::Object> target);
    static NAN_METHOD(New);
    static NAN_METHOD(Blit);

    virtual cairo_surface_t* createSurface();
    virtual cairo_surface_t* recreateSurface();
    virtual void destroySurface();

    virtual void setWidth(int width);
    virtual void setHeight(int height);
    virtual cairo_format_t getFormat();
};

#endif
