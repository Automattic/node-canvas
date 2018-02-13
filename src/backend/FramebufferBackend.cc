#include "FramebufferBackend.h"

#include <unistd.h>
#include <sys/ioctl.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <fcntl.h>
#include <linux/fb.h>
#include <sys/mman.h>

using namespace v8;

FramebufferBackend::FramebufferBackend(std::string fbdev, bool doubleBufferEnabled)
    : Backend("framebuffer", 0, 0)
{
    this->fbdev = fbdev;
    this->doubleBufferEnabled = doubleBufferEnabled;
}

FramebufferBackend::~FramebufferBackend()
{
    this->destroySurface();
}

void FramebufferBackend::destroySurface()
{
    if (this->fbp != nullptr) {
        munmap(this->fbp, this->screenSize);
        if (ioctl(fbfd, FBIOPUT_VSCREENINFO, &this->origVinfo)) {
            Nan::ThrowError("Error restoring framebuffer state");
        }
        fbp = nullptr;
    }
    if (this->fbfd > 0) {
        close(this->fbfd);
        this->fbfd = 0;
    }

    if (cairo_surface_status(this->screenSurface) == CAIRO_STATUS_SUCCESS) {
        cairo_surface_destroy(this->screenSurface);
    }

    if (this->bbp != nullptr) {
        free(this->bbp);
    }
    if (cairo_surface_status(this->bufferSurface) == CAIRO_STATUS_SUCCESS) {
        cairo_surface_destroy(this->bufferSurface);
    }
    this->surface = nullptr;
}

cairo_surface_t* FramebufferBackend::recreateSurface()
{
    this->destroySurface();
    return this->createSurface();
}

cairo_surface_t* FramebufferBackend::createSurface()
{
    // Open the framebuffer device.
    this->fbfd = open(this->fbdev.c_str(), O_RDWR);
    if (fbfd < 0) {
        Nan::ThrowError("Error opening framebuffer device");
        return nullptr;
    }

    struct fb_var_screeninfo vinfo;
    struct fb_fix_screeninfo finfo;

    // Get the screen info.
    if (ioctl(this->fbfd, FBIOGET_VSCREENINFO, &vinfo)) {
        this->destroySurface();
        Nan::ThrowError("Error retrieving data from framebuffer");
        return nullptr;
    }

    // Store the original screen info for restoration later.
    memcpy(&this->origVinfo, &vinfo, sizeof(struct fb_var_screeninfo));

    // Setup the number of bits per pixel.
    vinfo.bits_per_pixel = 8;
    if (ioctl(this->fbfd, FBIOPUT_VSCREENINFO, &vinfo)) {
        this->destroySurface();
        Nan::ThrowError("Error sending data to framebuffer");
        return nullptr;
    }

    // Get the length of the screen buffer in bytes.
    if (ioctl(this->fbfd, FBIOGET_FSCREENINFO, &finfo)) {
        this->destroySurface();
        Nan::ThrowError("Error retrieving data from framebuffer");
        return nullptr;
    }
    this->screenSize = finfo.smem_len;

    // Memory map the framebuffer.
    this->fbp = (char*)mmap(0,
                            this->screenSize,
                            PROT_READ | PROT_WRITE,
                            MAP_SHARED,
                            this->fbfd,
                            0);

    if (this->fbp == MAP_FAILED) {
        this->destroySurface();
        Nan::ThrowError("Error during memory mapping");
        return nullptr;
    }

    // Create a cairo surface from the memory mapped buffer.
    screenSurface = cairo_image_surface_create_for_data(
            (unsigned char *)this->fbp,
            CAIRO_FORMAT_RGB16_565,
            vinfo.xres, vinfo.yres,
            cairo_format_stride_for_width(CAIRO_FORMAT_RGB16_565, vinfo.xres));

    // Store the width and height to be used further up the stack.
    this->width = vinfo.xres;
    this->height = vinfo.yres;

    // If double buffering is enabled then allocate an in memory buffer.
    if (this->doubleBufferEnabled) {
        this->bbp = (char *)malloc(this->screenSize);
        bufferSurface = cairo_image_surface_create_for_data(
                (unsigned char *)this->bbp,
                CAIRO_FORMAT_RGB16_565,
                vinfo.xres, vinfo.yres,
                cairo_format_stride_for_width(CAIRO_FORMAT_RGB16_565, vinfo.xres));

        if (cairo_surface_status(bufferSurface) != CAIRO_STATUS_SUCCESS) {
            Nan::ThrowError("Error creating buffer surface");
            this->destroySurface();
            return nullptr;
        }
        this->surface = bufferSurface;
        return bufferSurface;
    } else {
        this->surface = screenSurface;
        return screenSurface;
    }
}

void FramebufferBackend::setWidth(int width)
{
    Nan::ThrowError("Framebuffer setWidth is not supported");
}

void FramebufferBackend::setHeight(int height)
{
    Nan::ThrowError("Framebuffer setHeight is not supported");
}

cairo_format_t FramebufferBackend::getFormat()
{
    return CAIRO_FORMAT_RGB16_565;
}

Nan::Persistent<FunctionTemplate> FramebufferBackend::constructor;

void FramebufferBackend::Initialize(Handle<Object> target)
{
    Nan::HandleScope scope;

    Local<FunctionTemplate> ctor = Nan::New<FunctionTemplate>(FramebufferBackend::New);
    FramebufferBackend::constructor.Reset(ctor);
    ctor->InstanceTemplate()->SetInternalFieldCount(1);
    ctor->SetClassName(Nan::New<String>("FramebufferBackend").ToLocalChecked());

    Nan::SetPrototypeMethod(ctor, "blit", FramebufferBackend::Blit);

    target->Set(Nan::New<String>("FramebufferBackend").ToLocalChecked(), ctor->GetFunction());
}

NAN_METHOD(FramebufferBackend::New)
{
    Nan::HandleScope scope;
    std::string name = *v8::String::Utf8Value(info[0]->ToString());
    bool doubleBufferEnabled = false;
    if (info[1]->IsBoolean()) {
        doubleBufferEnabled = info[1]->IsTrue();
    }
    FramebufferBackend* backend = new FramebufferBackend(name, doubleBufferEnabled);

    backend->Wrap(info.This());
    info.GetReturnValue().Set(info.This());
}

NAN_METHOD(FramebufferBackend::Blit)
{
    Nan::HandleScope scope;
    FramebufferBackend *obj = Nan::ObjectWrap::Unwrap<FramebufferBackend>(info.Holder());
    // If double buffering is enabled then copy the memory buffer to the screen.
    if (obj->doubleBufferEnabled) {
        cairo_t *cr = cairo_create (obj->screenSurface);
        cairo_set_source_surface (cr, obj->bufferSurface, 0, 0);
        cairo_paint (cr);
        cairo_destroy(cr);
    }
}
