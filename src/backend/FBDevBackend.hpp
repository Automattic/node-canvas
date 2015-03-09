#ifndef __FBDEV_BACKEND_H__
#define __FBDEV_BACKEND_H__

#include <iostream>
#include <linux/fb.h>
#include "Backend.hpp"

using namespace std;

class FBDevBackend : public Backend {
  public:
    string fb_dn;
    int fb_fd;
    struct fb_var_screeninfo fb_vinfo;
    struct fb_fix_screeninfo fb_finfo;
    long fb_screensize;
    unsigned char *fb_data;

    cairo_format_t format;
    int bpp;

    virtual cairo_surface_t *createSurface();
    virtual cairo_surface_t *recreateSurface();
    virtual void destroySurface();

    void setWidth(int width);
    void setHeight(int height);

    FBDevBackend(string deviceName);
};

static void cairo_linuxfb_surface_destroy(void *device);

#endif
