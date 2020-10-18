#include "XlibBackend.h"

using namespace v8;

XlibBackend::XlibBackend(int width, int height)
	: Backend("x11", width, height)
{
	display = XOpenDisplay(NULL);
	if(!display)
		throw XlibBackendException("Can't open display. Is DISPLAY set?\n");

	this->window = XCreateSimpleWindow(display, RootWindow(display, 0), 0, 0,
		this->width, this->height, 0, 0, BlackPixel(display, 0));

	XSelectInput(display, this->window, StructureNotifyMask | ExposureMask);
	XMapWindow(display, this->window);
}

XlibBackend::~XlibBackend()
{
	this->destroySurface();

	XCloseDisplay(this->display);
}


cairo_surface_t* XlibBackend::createSurface()
{
  this->surface = cairo_xlib_surface_create(display, this->window,
		DefaultVisual(display, 0), this->width, this->height);

	return this->surface;
}


void XlibBackend::setWidth(int width)
{
	XResizeWindow(this->display, this->window, width, this->height);

	Backend::setWidth(width);
}
void XlibBackend::setHeight(int height)
{
	XResizeWindow(this->display, this->window, this->width, height);

	Backend::setHeight(height);
}


Nan::Persistent<FunctionTemplate> XlibBackend::constructor;

void XlibBackend::Initialize(Handle<Object> target)
{
	Nan::HandleScope scope;

	Local<FunctionTemplate> ctor = Nan::New<FunctionTemplate>(XlibBackend::New);
	XlibBackend::constructor.Reset(ctor);
	ctor->InstanceTemplate()->SetInternalFieldCount(1);
	ctor->SetClassName(Nan::New<String>("XlibBackend").ToLocalChecked());
	target->Set(Nan::New<String>("XlibBackend").ToLocalChecked(), ctor->GetFunction());
}

NAN_METHOD(XlibBackend::New)
{
	int width  = 0;
	int height = 0;
	if(info[0]->IsNumber()) width  = info[0]->Uint32Value();
	if(info[1]->IsNumber()) height = info[1]->Uint32Value();

	XlibBackend *backend = new XlibBackend(width, height);

	backend->Wrap(info.This());
	info.GetReturnValue().Set(info.This());
}
