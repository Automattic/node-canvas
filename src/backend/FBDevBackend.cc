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


// switch through bpp and decide on which format for the cairo surface to use
cairo_format_t bits2format(__u32 bits_per_pixel)
{
	switch(bits_per_pixel)
	{
		case 16: return CAIRO_FORMAT_RGB16_565;
		case 32: return CAIRO_FORMAT_ARGB32;

		default:
			throw FBDevBackendException("Only valid formats are RGB16_565 & ARGB32");
	}
}


FBDevBackend::FBDevBackend(int width, int height, string deviceName)
	: Backend("fbdev", width, height)
{
	struct fb_var_screeninfo fb_vinfo;

	this->initFbDev(deviceName, &fb_vinfo);

	fb_vinfo.xres = width;
	fb_vinfo.yres = height;

	this->FbDevIoctlHelper(FBIOPUT_VSCREENINFO, &fb_vinfo,
		"Error setting variable framebuffer information");

	this->enableDoubleBuffer(height, &fb_vinfo);
}

FBDevBackend::FBDevBackend(string deviceName)
	: Backend("fbdev")
{
	struct fb_var_screeninfo fb_vinfo;

	this->initFbDev(deviceName, &fb_vinfo);

	this->width  = fb_vinfo.xres;
	this->height = fb_vinfo.yres;

	this->enableDoubleBuffer(height, &fb_vinfo);
}

FBDevBackend::~FBDevBackend()
{
	this->destroySurface();

	if(useCopyBuffer) free(fb_data_surface);

	munmap(this->fb_data, this->fb_finfo.smem_len);
	close(this->fb_fd);
}


void FBDevBackend::initFbDev(string deviceName, struct fb_var_screeninfo* fb_vinfo)
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

	this->FbDevIoctlHelper(FBIOGET_VSCREENINFO, fb_vinfo,
		"Error reading variable framebuffer information");

	this->format = bits2format(fb_vinfo->bits_per_pixel);
}

void FBDevBackend::enableDoubleBuffer(int height, struct fb_var_screeninfo* fb_vinfo)
{
	fb_vinfo->yres_virtual = height * 2;

	// Try to use real double buffer inside graphic card memory. If framebuffer
	// driver don't support to have a virtual framebuffer bigger than the actual
	// one, then we'll use a buffer in memory. It's not so efficient and could
	// lead to some tearing, but with VSync this should be minimal and at least
	// we'll not see screen redraws.
	useCopyBuffer = ioctl(this->fb_fd, FBIOPUT_VSCREENINFO, fb_vinfo) == -1;

	fb_data_screen  = this->fb_data;
	fb_data_surface = useCopyBuffer
		? (unsigned char*)malloc(this->fb_finfo.smem_len)
		: this->fb_data + fb_vinfo->yres * fb_finfo.line_length;

	// Allow VSync requests by default
	listenOnDraw = true;
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

	// create cairo surface from data
	this->surface = cairo_image_surface_create_for_data(this->fb_data_surface,
		bits2format(fb_vinfo.bits_per_pixel), fb_vinfo.xres, fb_vinfo.yres,
		fb_finfo.line_length);

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

	if(useCopyBuffer) fb_vinfo.yres_virtual = height * 2;

	this->FbDevIoctlHelper(FBIOPUT_VSCREENINFO, &fb_vinfo,
		"Error setting variable framebuffer information");

	Backend::setHeight(height);
}
void FBDevBackend::setFormat(cairo_format_t format)
{
	struct fb_var_screeninfo fb_vinfo;

	this->FbDevIoctlHelper(FBIOGET_VSCREENINFO, &fb_vinfo,
		"Error reading variable framebuffer information");

	switch(format)
	{
		case CAIRO_FORMAT_RGB16_565: fb_vinfo.bits_per_pixel = 16; break;
		case CAIRO_FORMAT_ARGB32:    fb_vinfo.bits_per_pixel = 32; break;

		default:
			throw FBDevBackendException("Only valid formats are RGB16_565 & ARGB32");
	}

	this->FbDevIoctlHelper(FBIOPUT_VSCREENINFO, &fb_vinfo,
		"Error setting variable framebuffer information");

	Backend::setFormat(format);
}


void FBDevBackend::waitVSync()
{
  int arg = 0;

  this->FbDevIoctlHelper(FBIO_WAITFORVSYNC, &arg,
    "Error waiting for framebuffer VSync");
}

void FBDevBackend::swapBuffers()
{
	if(useCopyBuffer)
		memcpy(fb_data_screen, fb_data_surface, this->fb_finfo.smem_len);

	else
	{
		// Update display panning
		struct fb_var_screeninfo fb_vinfo;

		this->FbDevIoctlHelper(FBIOGET_VSCREENINFO, &fb_vinfo,
			"Error reading variable framebuffer information");

		fb_vinfo.yoffset = fb_vinfo.yoffset ? 0 : fb_vinfo.yres;

		this->FbDevIoctlHelper(FBIOPAN_DISPLAY, &fb_vinfo,
			"Error panning the framebuffer display");

		// Swap front and back buffers pointers
		unsigned char* fb_data_aux = fb_data_screen;
		fb_data_screen  = fb_data_surface;
		fb_data_surface = fb_data_aux;

		// Destroy Cairo surface to force create new one in the new back buffer
		destroySurface();
	}
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
	string fbDevice = DEFAULT_DEVICE;
	if(info[0]->IsString()) fbDevice = *String::Utf8Value(info[0].As<String>());

	FBDevBackend* backend = new FBDevBackend(fbDevice);

	backend->Wrap(info.This());
	info.GetReturnValue().Set(info.This());
}
