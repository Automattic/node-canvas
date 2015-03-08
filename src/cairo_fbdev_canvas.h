#ifndef __CAIRO_FBDEV_CANVAS_H__
#define __CAIRO_FBDEV_CANVAS_H__

#include <linux/fb.h>
#include <cairo.h>

typedef struct _cairo_linuxfb_device {
  int fb_fd;
  char *fb_data;
  long fb_screensize;
  struct fb_var_screeninfo fb_vinfo;
  struct fb_fix_screeninfo fb_finfo;
} cairo_linuxfb_device_t;

static void cairo_linuxfb_surface_destroy(void *device);
cairo_surface_t *cairo_linuxfb_surface_create(const char *fb_name);

#endif
