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

void FBDevBackend::FbDevIoctlHelper(unsigned long request, void* data, string errmsg) {
	if (ioctl(this->fb_fd, request, data) == -1) {
		std::ostringstream o;
		o << errmsg << ", Framebuffer Device: \"" << this->fb_dn << "\"";
		throw FBDevBackendException(o.str());
	}
}

cairo_surface_t * FBDevBackend::createSurface() {
	// Open the file for reading and writing
	this->fb_fd = open(this->fb_dn.c_str(), O_RDWR);
	if (this->fb_fd == -1) {
		std::ostringstream o;
		o << "cannot open framebuffer device \"" << this->fb_dn << "\"";
		throw FBDevBackendException(o.str());
	}

	// read fixed info, read variable info, set bpp and disable grayscale
	this->FbDevIoctlHelper(FBIOGET_FSCREENINFO, &this->fb_finfo, "error reading fixed framebuffer information");
	this->FbDevIoctlHelper(FBIOGET_VSCREENINFO, &this->fb_vinfo, "error reading variable framebuffer information");
	this->fb_vinfo.grayscale = 0;
	this->fb_vinfo.bits_per_pixel = 32;
	this->FbDevIoctlHelper(FBIOPUT_VSCREENINFO, &this->fb_vinfo, "error setting variable framebuffer information");
	this->FbDevIoctlHelper(FBIOGET_VSCREENINFO, &this->fb_vinfo, "error reading variable framebuffer information");

	// set width, height and bpp according to the size of the fb device
	this->width = this->fb_vinfo.xres;
	this->height = this->fb_vinfo.yres;
	this->bpp = this->fb_vinfo.bits_per_pixel;
	this->fb_screensize = this->fb_vinfo.yres_virtual * this->fb_finfo.line_length;

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

	int stride = cairo_format_stride_for_width(this->format, this->fb_vinfo.xres_virtual);

	// create cairo surface from data
	this->surface = cairo_image_surface_create_for_data(
	        this->fb_data,
	        this->format,
	        this->width,
	        this->height,
	        stride
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
	if (this->surface != NULL) {
		cairo_surface_destroy(this->surface);
		munmap(this->fb_data, this->fb_screensize);
		close(this->fb_fd);
	}
}

Persistent<FunctionTemplate> FBDevBackend::constructor;

void FBDevBackend::Initialize(Handle<Object> target) {
	NanScope();
	Local<FunctionTemplate> ctor = NanNew<FunctionTemplate>(FBDevBackend::New);
	NanAssignPersistent(FBDevBackend::constructor, ctor);
	ctor->InstanceTemplate()->SetInternalFieldCount(1);
	ctor->SetClassName(NanNew("FBDevBackend"));
	target->Set(NanNew("FBDevBackend"), ctor->GetFunction());
}

NAN_METHOD(FBDevBackend::New) {
	FBDevBackend *backend = NULL;

	if (args[0]->IsString()) {
		string fbDevice = *String::Utf8Value(args[0].As<String>());
		backend = new FBDevBackend(fbDevice);
	} else {
		backend = new FBDevBackend("/dev/fb0");
	}

	backend->Wrap(args.This());
	NanReturnValue(args.This());
}
