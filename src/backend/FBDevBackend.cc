#include <iostream>
#include <string>
#include <sstream>

#include <math.h>
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
		case 24: return CAIRO_FORMAT_RGB24;
		case 32: return CAIRO_FORMAT_ARGB32;

		default:
			throw FBDevBackendException("Only valid formats are RGB16_565, RGB24 and ARGB32");
	}
}


FBDevBackend::FBDevBackend(int width, int height, string deviceName,
	bool useDoubleBuffer)
	: Backend("fbdev", width, height)
	, back_buffer(NULL)
	, useDoubleBuffer(useDoubleBuffer)
	, useInMemoryBackBuffer(false)
	, useFlipPages(false)
{
	struct fb_var_screeninfo fb_vinfo;

	this->initFbDev(deviceName, &fb_vinfo);

	fb_vinfo.xres = width;
	fb_vinfo.yres = height;

	this->FbDevIoctlHelper(FBIOPUT_VSCREENINFO, &fb_vinfo,
		"Error setting variable framebuffer information");
}

FBDevBackend::FBDevBackend(string deviceName, bool useDoubleBuffer)
	: Backend("fbdev")
	, back_buffer(NULL)
	, useDoubleBuffer(useDoubleBuffer)
	, useInMemoryBackBuffer(false)
	, useFlipPages(false)
{
	struct fb_var_screeninfo fb_vinfo;

	this->initFbDev(deviceName, &fb_vinfo);

	this->width  = fb_vinfo.xres;
	this->height = fb_vinfo.yres;
}

FBDevBackend::~FBDevBackend()
{
	this->destroySurface();

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


void FBDevBackend::FbDevIoctlHelper(unsigned long request, void* data,
	string errmsg)
{
	if(ioctl(this->fb_fd, request, data) == -1)
		throw FBDevBackendException(errmsg.c_str());
}


void FBDevBackend::createSurface()
{
	destroySurface();

	struct fb_var_screeninfo fb_vinfo;

	this->FbDevIoctlHelper(FBIOGET_VSCREENINFO, &fb_vinfo,
		"Error reading variable framebuffer information");

	front_buffer = this->fb_data;

	if(!useDoubleBuffer && fb_vinfo.bits_per_pixel != 24)
		back_buffer = front_buffer;

	else
	{
		// Try to use page flipping inside graphic card memory. If FbDev driver
		// don't support to have a virtual framebuffer bigger than the actual one,
		// then we'll use a buffer in memory. It's not so efficient and could lead
		// to some tearing, but with VSync this should be minimal and at least we'll
		// not see screen redraws.
		fb_vinfo.yres_virtual = height * 2;

		// Adjust virtual framebuffer width to hold RGB24 Cairo surface in 24 bits
		fb_vinfo.xres_virtual = fb_vinfo.bits_per_pixel != 24
													? width
													: ceil(width*4/3);

		useInMemoryBackBuffer = ioctl(this->fb_fd, FBIOPUT_VSCREENINFO, &fb_vinfo) == -1;

		if(useInMemoryBackBuffer)
		{
			useFlipPages = false;

			int stride = cairo_format_stride_for_width(format, fb_vinfo.xres);
			back_buffer = (unsigned char*)calloc(fb_vinfo.yres, stride);
		}

		else
		{
			// back buffer in memory card
			back_buffer = this->fb_data + fb_vinfo.yres * fb_finfo.line_length;

			// Try to use page flipping inside graphic card memory. If FbDev driver
			// don't support vertical panning, then we'll need to copy data from back
			// buffer. It's not so efficient and could lead to some tearing, but with
			// VSync this should be minimal and at least we'll not see screen redraws.
			fb_vinfo.yoffset = fb_vinfo.yres;

			useFlipPages = fb_vinfo.bits_per_pixel != 24
									&& ioctl(this->fb_fd, FBIOPAN_DISPLAY, &fb_vinfo) == 0;

			if(useFlipPages)
			{
				// Swap front and back buffers since vertical panning was succesful
				front_buffer = back_buffer;
				back_buffer  = this->fb_data;
			}
		}
	}

	// create cairo surface from data
	int stride = cairo_format_stride_for_width(format, fb_vinfo.xres);
	this->surface = cairo_image_surface_create_for_data(this->back_buffer,
		format, fb_vinfo.xres, fb_vinfo.yres, stride);
}

void FBDevBackend::destroySurface()
{
	Backend::destroySurface();

	if(useInMemoryBackBuffer && back_buffer)
	{
		free(back_buffer);

		back_buffer = NULL;
	}
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
		case CAIRO_FORMAT_RGB24:     fb_vinfo.bits_per_pixel = 24; break;
		case CAIRO_FORMAT_ARGB32:    fb_vinfo.bits_per_pixel = 32; break;

		default:
			throw FBDevBackendException("Only valid formats are RGB16_565, RGB24 and ARGB32");
	}

	this->FbDevIoctlHelper(FBIOPUT_VSCREENINFO, &fb_vinfo,
		"Error setting variable framebuffer information");

	Backend::setFormat(format);
}


void FBDevBackend::copyBackBuffer(struct fb_var_screeninfo* fb_vinfo)
{
	if(fb_vinfo->bits_per_pixel != 24)
		memcpy(front_buffer, back_buffer, fb_vinfo->yres * fb_finfo.line_length);

	else
	{
		int stride = cairo_format_stride_for_width(format, fb_vinfo->xres);

		for(unsigned int y=0; y<fb_vinfo->yres; y++)
			for(unsigned int x=0; x<fb_vinfo->xres; x++)
				memcpy(front_buffer + y*fb_finfo.line_length + x*3,
							 back_buffer  + y*stride               + x*4 + 1,
							 3);
	}
}
void FBDevBackend::flipPages(struct fb_var_screeninfo* fb_vinfo)
{
	if(!this->surface) return;

	// Update display panning
	fb_vinfo->yoffset = fb_vinfo->yoffset ? 0 : fb_vinfo->yres;

	this->FbDevIoctlHelper(FBIOPAN_DISPLAY, fb_vinfo,
		"Error panning the framebuffer display");

	// Swap front and back buffers pointers
	unsigned char* aux = front_buffer;
	front_buffer = back_buffer;
	back_buffer  = aux;

	// Destroy Cairo surface and create it in the new back buffer vertical offset
	cairo_surface_destroy(this->surface);

	this->surface = cairo_image_surface_create_for_data(this->back_buffer,
		format, fb_vinfo->xres, fb_vinfo->yres, fb_finfo.line_length);
}

void FBDevBackend::swapBuffers()
{
	if(!this->surface) return;
	if(!useDoubleBuffer) return;

	struct fb_var_screeninfo fb_vinfo;

	this->FbDevIoctlHelper(FBIOGET_VSCREENINFO, &fb_vinfo,
		"Error reading variable framebuffer information");

	if(useFlipPages)
		flipPages(&fb_vinfo);

	else
		copyBackBuffer(&fb_vinfo);
}

void FBDevBackend::waitVSync()
{
	int arg = 0;

	this->FbDevIoctlHelper(FBIO_WAITFORVSYNC, &arg,
		"Error waiting for framebuffer VSync");
}


Nan::Persistent<FunctionTemplate> FBDevBackend::constructor;

void FBDevBackend::Initialize(Handle<Object> target)
{
	Nan::HandleScope scope;

	Local<FunctionTemplate> ctor = Nan::New<FunctionTemplate>(FBDevBackend::New);
	FBDevBackend::constructor.Reset(ctor);
	ctor->InstanceTemplate()->SetInternalFieldCount(1);
	ctor->SetClassName(Nan::New<String>("FBDevBackend").ToLocalChecked());

	Backend::Initialize(ctor);

	target->Set(Nan::New<String>("FBDevBackend").ToLocalChecked(), ctor->GetFunction());
}

NAN_METHOD(FBDevBackend::New)
{
	string fbDevice = DEFAULT_DEVICE;
	if(info[0]->IsString()) fbDevice = *String::Utf8Value(info[0].As<String>());

	bool useDoubleBuffer = false;
	if(info[1]->IsBoolean()) useDoubleBuffer = info[1]->BooleanValue();

	FBDevBackend* backend = new FBDevBackend(fbDevice, useDoubleBuffer);

	backend->Wrap(info.This());
	info.GetReturnValue().Set(info.This());
}
