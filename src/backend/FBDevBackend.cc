#include <iostream>
#include <string>
#include <sstream>

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/mman.h>
#include <sys/ioctl.h>

#include "FBDevBackend.h"


FBDevBackend::FBDevBackend(string deviceName)
	: Backend("fbdev")
	, fb_dn(deviceName)
{}


void FBDevBackend::FbDevIoctlHelper(unsigned long request, void* data,
	string errmsg)
{
	if(ioctl(this->fb_fd, request, data) == -1)
	{
		std::ostringstream o;
		o << errmsg << ", Framebuffer Device: \"" << this->fb_dn << "\"";
		throw FBDevBackendException(o.str());
	}
}


cairo_surface_t* FBDevBackend::createSurface()
{
	// Open the file for reading and writing
	this->fb_fd = open(this->fb_dn.c_str(), O_RDWR);

	if(this->fb_fd == -1)
	{
		std::ostringstream o;
		o << "cannot open framebuffer device \"" << this->fb_dn << "\"";
		throw FBDevBackendException(o.str());
	}

	struct fb_var_screeninfo fb_vinfo;

	this->FbDevIoctlHelper(FBIOGET_FSCREENINFO, &this->fb_finfo, "error reading fixed framebuffer information");
	this->FbDevIoctlHelper(FBIOGET_VSCREENINFO, &fb_vinfo, "error reading variable framebuffer information");

	this->width  = fb_vinfo.xres;
	this->height = fb_vinfo.yres;

	// switch through bpp and decide on which format for the cairo surface to use
	cairo_format_t format;
	switch(fb_vinfo.bits_per_pixel)
	{
		case  8: format = CAIRO_FORMAT_A8;        break;
		case 16: format = CAIRO_FORMAT_RGB16_565; break;
		case 24: format = CAIRO_FORMAT_RGB24;     break;
		case 32: format = CAIRO_FORMAT_ARGB32;    break;

		default:
			std::ostringstream o;
			o << "could not determine color format of device \"" << this->fb_dn << "\"";
			throw FBDevBackendException(o.str());
	}

	// Map the device to memory
	this->fb_data = (unsigned char *) mmap(0, this->fb_finfo.smem_len,
		PROT_READ | PROT_WRITE, MAP_SHARED, this->fb_fd, 0);

	if(this->fb_data == MAP_FAILED)
	{
		std::ostringstream o;
		o << "failed to map framebuffer device \"" << this->fb_dn << "\" to memory";
		throw FBDevBackendException(o.str());
	}

	int stride = cairo_format_stride_for_width(format, fb_vinfo.xres_virtual);

	// create cairo surface from data
	this->surface = cairo_image_surface_create_for_data(this->fb_data, format,
		this->width, this->height, stride);

	return this->surface;
}

void FBDevBackend::destroySurface()
{
	if(this->surface)
	{
		Backend::destroySurface();

		munmap(this->fb_data, this->fb_finfo.smem_len);
		close(this->fb_fd);
	}
}


void FBDevBackend::setWidth(int width)
{
	throw BackendOperationNotAvailable(this, "setWidth()");
}
void FBDevBackend::setHeight(int height)
{
	throw BackendOperationNotAvailable(this, "setHeight()");
}


Persistent<FunctionTemplate> FBDevBackend::constructor;

void FBDevBackend::Initialize(Handle<Object> target)
{
	NanScope();
	Local<FunctionTemplate> ctor = NanNew<FunctionTemplate>(FBDevBackend::New);
	NanAssignPersistent(FBDevBackend::constructor, ctor);
	ctor->InstanceTemplate()->SetInternalFieldCount(1);
	ctor->SetClassName(NanNew("FBDevBackend"));
	target->Set(NanNew("FBDevBackend"), ctor->GetFunction());
}

NAN_METHOD(FBDevBackend::New)
{
	string fbDevice = "/dev/fb0";
	if(args[0]->IsString()) fbDevice = *String::Utf8Value(args[0].As<String>());

	FBDevBackend* backend = new FBDevBackend(fbDevice);

	backend->Wrap(args.This());
	NanReturnValue(args.This());
}
