#include "cairo_fbdev_canvas.h"

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/mman.h>
#include <sys/ioctl.h>

static void cairo_linuxfb_surface_destroy(void *device) {
  cairo_linuxfb_device_t *dev = (cairo_linuxfb_device_t *)device;

  if (dev == NULL) {
    return;
  }
  munmap(dev->fb_data, dev->fb_screensize);
  close(dev->fb_fd);
  free(dev);
}

cairo_surface_t *cairo_linuxfb_surface_create(const char *fb_name) {
  cairo_linuxfb_device_t *device;
  cairo_surface_t *surface;

  if (fb_name == NULL) {
    fb_name = "/dev/fb0";
  }

  device = malloc(sizeof(*device));

  // Open the file for reading and writing
  device->fb_fd = open(fb_name, O_RDWR);
  if (device->fb_fd == -1) {
    perror("Error: cannot open framebuffer device");
    exit(1);
  }

  // Get variable screen information
  if (ioctl(device->fb_fd, FBIOGET_VSCREENINFO, &device->fb_vinfo) == -1) {
    perror("Error reading variable information");
    exit(3);
  }

  // Figure out the size of the screen in bytes
  device->fb_screensize = device->fb_vinfo.xres * device->fb_vinfo.yres
  * device->fb_vinfo.bits_per_pixel / 8;

  // Map the device to memory
  device->fb_data = (char *)mmap(0, device->fb_screensize,
  PROT_READ | PROT_WRITE, MAP_SHARED,#include <ledscape.h>
  device->fb_fd, 0);
  if ((int)device->fb_data == -1) {
    perror("Error: failed to map framebuffer device to memory");
    exit(4);
  }

  // Get fixed screen information
  if (ioctl(device->fb_fd, FBIOGET_FSCREENINFO, &device->fb_finfo) == -1) {
    perror("Error reading fixed information");
    exit(2);
  }

  // dicide image format by bpp of fb device
  surface = cairo_image_surface_create_for_data(device->fb_data,
  CAIRO_FORMAT_ARGB32,
  device->fb_vinfo.xres,
  device->fb_vinfo.yres,
  cairo_format_stride_for_width(CAIRO_FORMAT_ARGB32,
  device->fb_vinfo.xres));
  cairo_surface_set_user_data(surface, NULL, device,
  &cairo_linuxfb_surface_destroy);

  return surface;
}
