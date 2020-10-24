#include "XlibBackend.h"


XlibBackend::XlibBackend(int width, int height, char *display_name)
	: ScreenBackend("xlib", width, height)
	, xlibBackendPriv(width, height, display_name)
{}


void XlibBackend::createSurface()
{
	destroySurface();

  this->surface = xlibBackendPriv.cairo_surface_create(width, height);
}


void XlibBackend::setWidth(int width)
{
	xlibBackendPriv.ResizeWindow(width, this->height);

	ScreenBackend::setWidth(width);
}

void XlibBackend::setHeight(int height)
{
	xlibBackendPriv.ResizeWindow(this->width, height);

	ScreenBackend::setHeight(height);
}


Nan::Persistent<FunctionTemplate> XlibBackend::constructor;

void XlibBackend::Initialize(Local<Object> target)
{
	Nan::HandleScope scope;

	Local<FunctionTemplate> ctor = Nan::New<FunctionTemplate>(XlibBackend::New);
	XlibBackend::constructor.Reset(ctor);
	ctor->InstanceTemplate()->SetInternalFieldCount(1);
	ctor->SetClassName(Nan::New<String>("XlibBackend").ToLocalChecked());

	ScreenBackend::Initialize(ctor);

	Nan::Set(target,
	         Nan::New<String>("XlibBackend").ToLocalChecked(),
	         Nan::GetFunction(ctor).ToLocalChecked()).Check();
}

NAN_METHOD(XlibBackend::New)
{
  int width  = 0;
  int height = 0;
  if (info[0]->IsNumber()) width  = Nan::To<uint32_t>(info[0]).FromMaybe(0);
  if (info[1]->IsNumber()) height = Nan::To<uint32_t>(info[1]).FromMaybe(0);

  char *display_name = NULL;
  if (info[2]->IsString()) display_name = (*Nan::Utf8String(info[2])).c_str();

  XlibBackend *backend = new XlibBackend(width, height, display_name);

  backend->Wrap(info.This());
  info.GetReturnValue().Set(info.This());
}
