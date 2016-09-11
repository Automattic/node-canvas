#include "X11Backend.h"

using namespace v8;

X11Backend::X11Backend(int width, int height)
	: Backend("x11", width, height)
{
	display = XOpenDisplay(NULL);
	if(!display)
		throw X11BackendException("Can't open display. Is DISPLAY set?\n");

	this->window = XCreateSimpleWindow(display, RootWindow(display, 0), 0, 0,
		this->width, this->height, 0, 0, BlackPixel(display, 0));

	XSelectInput(display, this->window, StructureNotifyMask | ExposureMask);
	XMapWindow(display, this->window);
}

X11Backend::~X11Backend()
{
	this->destroySurface();

	XCloseDisplay(this->display);
}


cairo_surface_t* X11Backend::createSurface()
{
  this->surface = cairo_xlib_surface_create(display, this->window,
		DefaultVisual(display, 0), this->width, this->height);

	return this->surface;
}


void X11Backend::setWidth(int width)
{
	XResizeWindow(this->display, this->window, width, this->height);

	Backend::setWidth(width);
}
void X11Backend::setHeight(int height)
{
	XResizeWindow(this->display, this->window, this->width, height);

	Backend::setHeight(height);
}


Nan::Persistent<FunctionTemplate> X11Backend::constructor;

void X11Backend::Initialize(Handle<Object> target)
{
	Nan::HandleScope scope;

	Local<FunctionTemplate> ctor = Nan::New<FunctionTemplate>(X11Backend::New);
	X11Backend::constructor.Reset(ctor);
	ctor->InstanceTemplate()->SetInternalFieldCount(1);
	ctor->SetClassName(Nan::New<String>("X11Backend").ToLocalChecked());
	target->Set(Nan::New<String>("X11Backend").ToLocalChecked(), ctor->GetFunction());
}

NAN_METHOD(X11Backend::New)
{
	int width  = 0;
	int height = 0;
	if(info[0]->IsNumber()) width  = info[0]->Uint32Value();
	if(info[1]->IsNumber()) height = info[1]->Uint32Value();

	X11Backend *backend = new X11Backend(width, height);

	backend->Wrap(info.This());
	info.GetReturnValue().Set(info.This());
}
