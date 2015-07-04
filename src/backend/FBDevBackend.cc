#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/mman.h>
#include <sys/ioctl.h>
#include <iostream>
#include <string>
#include <sstream>
#include "FBDevBackend.h"

FBDevBackend::FBDevBackend(string deviceName) {
	this->name = "fbdev";
	this->fb_dn = deviceName;
}

cairo_surface_t * FBDevBackend::createSurface() {
	// Open the file for reading and writing
	this->fb_fd = open(this->fb_dn.c_str(), O_RDWR);
	if (this->fb_fd == -1) {
		std::ostringstream o;
		o << "cannot open framebuffer device \"" << this->fb_dn << "\"";
		throw FBDevBackendException(o.str());
	}

	// Get variable screen information
	if (ioctl(this->fb_fd, FBIOGET_VSCREENINFO, &this->fb_vinfo) == -1) {
		std::ostringstream o;
		o << "error reading variable information from device \"" << this->fb_dn << "\"";
		throw FBDevBackendException(o.str());
	}

	// set width, height and bpp according to the size of the fb device
	this->width = this->fb_vinfo.xres;
	this->height = this->fb_vinfo.yres;
	this->bpp = this->fb_vinfo.bits_per_pixel;

	// switch through bpp and decide on which format for the cairo surface to use
	switch (this->bpp) {
	case 32:
		this->format = CAIRO_FORMAT_ARGB32;
		break;
	case 24:
		this->format = CAIRO_FORMAT_RGB24;
		break;
	case 16:
		this->format = CAIRO_FORMAT_RGB16_565;
		break;
	case 8:
		this->format = CAIRO_FORMAT_A8;
		break;
	default:
		std::ostringstream o;
		o << "could not determine color format of device \"" << this->fb_dn << "\"";
		throw FBDevBackendException(o.str());
	}

	// Figure out the size of the screen in bytes
	this->fb_screensize = this->width * this->height * this->bpp / 8;

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
		std::ostringstream o;
		o << "failed to map framebuffer device \"" << this->fb_dn << "\" to memory";
		throw FBDevBackendException(o.str());
	}

	// Get fixed screen information
	if (ioctl(this->fb_fd, FBIOGET_FSCREENINFO, &this->fb_finfo) == -1) {
		std::ostringstream o;
		o << "error reading fixed information from device \"" << this->fb_dn << "\"";
		throw FBDevBackendException(o.str());
	}

	// TODO decide image format by bpp of fb device
	this->surface = cairo_image_surface_create_for_data(
	        this->fb_data,
	        this->format,
	        this->width,
	        this->height,
	        cairo_format_stride_for_width(this->format, this->width)
	        );

	// set destroy callback
	cairo_surface_set_user_data(
	        this->surface,
	        NULL,
	        this,
	        &cairo_linuxfb_surface_destroy
	        );

	return this->surface;
}

void FBDevBackend::setWidth(int width) {
	throw BackendOperationNotAvailable(this, "setWidth()");
}

void FBDevBackend::setHeight(int height) {
	throw BackendOperationNotAvailable(this, "setHeight()");
}

cairo_surface_t *FBDevBackend::recreateSurface() {
	throw BackendOperationNotAvailable(this, "recreateSurface()");
}

void FBDevBackend::destroySurface() {
	cairo_surface_destroy(this->surface);
}

void cairo_linuxfb_surface_destroy(void *device) {
	FBDevBackend *backend = (FBDevBackend *) device;

	if (backend == NULL) {
		return;
	}

	munmap(backend->fb_data, backend->fb_screensize);
	close(backend->fb_fd);
}
