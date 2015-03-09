#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/mman.h>
#include <sys/ioctl.h>
#include "FBDevBackend.hpp"

FBDevBackend::FBDevBackend(string deviceName) {
  this->name = "fbdev";
  this->fb_dn = deviceName;
}

cairo_surface_t * FBDevBackend::createSurface() {
  // Open the file for reading and writing
  this->fb_fd = open(this->fb_dn.c_str(), O_RDWR);
  if (this->fb_fd == -1) {
    perror("Error: cannot open framebuffer device");
    exit(1);
  }

  // Get variable screen information
  if (ioctl(this->fb_fd, FBIOGET_VSCREENINFO, &this->fb_vinfo) == -1) {
    perror("Error reading variable information");
    exit(3);
  }

  // Figure out the size of the screen in bytes
  this->fb_screensize = this->fb_vinfo.xres * this->fb_vinfo.yres  * this->fb_vinfo.bits_per_pixel / 8;

  // Map the device to memory
  this->fb_data = (unsigned char *) mmap(
    0,
    this->fb_screensize,
    PROT_READ | PROT_WRITE,
    MAP_SHARED,
    this->fb_fd,
    0
  );
  if (this->fb_data == MAP_FAILED) {
    perror("Error: failed to map framebuffer device to memory");
    exit(4);
  }

  // Get fixed screen information
  if (ioctl(this->fb_fd, FBIOGET_FSCREENINFO, &this->fb_finfo) == -1) {
    perror("Error reading fixed information");
    exit(2);
  }

  // TODO decide image format by bpp of fb device
  this->surface = cairo_image_surface_create_for_data(
    this->fb_data,
    CAIRO_FORMAT_ARGB32,
    this->fb_vinfo.xres,
    this->fb_vinfo.yres,
    cairo_format_stride_for_width(CAIRO_FORMAT_ARGB32, this->fb_vinfo.xres)
  );
  cairo_surface_set_user_data(
    this->surface,
    NULL,
    this,
    &cairo_linuxfb_surface_destroy
  );
  return this->surface;
}

void FBDevBackend::setWidth(int width) {
  perror("Operation setWidth is not supported by this backend!");
  exit(1);
}

void FBDevBackend::setHeight(int height) {
  perror("Operation setWidth is not supported by this backend!");
  exit(1);
}

cairo_surface_t *FBDevBackend::recreateSurface() {
  perror("Operation recreateSurface is not supported by this backend!");
  exit(1);
  return NULL;
}

void FBDevBackend::destroySurface() {
  cairo_surface_destroy(this->surface);
}

static void cairo_linuxfb_surface_destroy(void *device) {
  FBDevBackend *backend = (FBDevBackend *) device;

  if (backend == NULL) {
    return;
  }
  munmap(backend->fb_data, backend->fb_screensize);
  close(backend->fb_fd);
}
