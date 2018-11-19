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


using namespace v8;


FBDevBackend::FBDevBackend(string deviceName)
	: Backend("fbdev")
{
	// Open the file for reading and writing
	this->fb_fd = open(deviceName.c_str(), O_RDWR);

	if(this->fb_fd == -1)
	{
		std::ostringstream o;
		o << "cannot open framebuffer device \"" << deviceName << "\"";
		throw FBDevBackendException(o.str());
	}

	this->FbDevIoctlHelper(FBIOGET_FSCREENINFO, &this->fb_finfo,
		"Error reading fixed framebuffer information");

	// Map the device to memory
	this->fb_data = (unsigned char*) mmap(0, this->fb_finfo.smem_len,
		PROT_READ | PROT_WRITE, MAP_SHARED, this->fb_fd, 0);

	if(this->fb_data == MAP_FAILED)
		throw FBDevBackendException("Failed to map framebuffer device to memory");
}

FBDevBackend::~FBDevBackend()
{
	this->destroySurface();

	munmap(this->fb_data, this->fb_finfo.smem_len);
	close(this->fb_fd);
}


void FBDevBackend::FbDevIoctlHelper(unsigned long request, void* data,
	string errmsg)
{
	if(ioctl(this->fb_fd, request, data) == -1)
		throw FBDevBackendException(errmsg.c_str());
}


cairo_surface_t* FBDevBackend::createSurface()
{
	struct fb_var_screeninfo fb_vinfo;

	this->FbDevIoctlHelper(FBIOGET_VSCREENINFO, &fb_vinfo,
		"Error reading variable framebuffer information");

	this->width  = fb_vinfo.xres;
	this->height = fb_vinfo.yres;

	// switch through bpp and decide on which format for the cairo surface to use
	cairo_format_t format;
	switch(fb_vinfo.bits_per_pixel)
	{
		case 16: format = CAIRO_FORMAT_RGB16_565; break;
		case 32: format = CAIRO_FORMAT_ARGB32;    break;

		default:
			throw FBDevBackendException("Only valid formats are RGB16_565 & ARGB32");
	}

	// create cairo surface from data
	this->surface = cairo_image_surface_create_for_data(this->fb_data, format,
		this->width, this->height, fb_finfo.line_length);

	return this->surface;
}


void FBDevBackend::setWidth(int width)
{
	struct fb_var_screeninfo fb_vinfo;

	this->FbDevIoctlHelper(FBIOGET_VSCREENINFO, &fb_vinfo,
		"Error reading variable framebuffer information");

	fb_vinfo.xres = width;

	this->FbDevIoctlHelper(FBIOPUT_VSCREENINFO, &fb_vinfo,
		"Error setting variable framebuffer information");

	Backend::setWidth(width);
}
void FBDevBackend::setHeight(int height)
{
	struct fb_var_screeninfo fb_vinfo;

	this->FbDevIoctlHelper(FBIOGET_VSCREENINFO, &fb_vinfo,
		"Error reading variable framebuffer information");

	fb_vinfo.yres = height;

	this->FbDevIoctlHelper(FBIOPUT_VSCREENINFO, &fb_vinfo,
		"Error setting variable framebuffer information");

	Backend::setHeight(width);
}


Nan::Persistent<FunctionTemplate> FBDevBackend::constructor;

void FBDevBackend::Initialize(Handle<Object> target)
{
	Nan::HandleScope scope;

	Local<FunctionTemplate> ctor = Nan::New<FunctionTemplate>(FBDevBackend::New);
	FBDevBackend::constructor.Reset(ctor);
	ctor->InstanceTemplate()->SetInternalFieldCount(1);
	ctor->SetClassName(Nan::New<String>("FBDevBackend").ToLocalChecked());
	target->Set(Nan::New<String>("FBDevBackend").ToLocalChecked(), ctor->GetFunction());
}

NAN_METHOD(FBDevBackend::New)
{
	string fbDevice = "/dev/fb0";
	if(info[0]->IsString()) fbDevice = *String::Utf8Value(info[0].As<String>());

	FBDevBackend* backend = new FBDevBackend(fbDevice);

	backend->Wrap(info.This());
	info.GetReturnValue().Set(info.This());
}
