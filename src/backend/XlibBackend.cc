#include "XlibBackend.h"


XlibBackend::XlibBackend(int width, int height)
	: ScreenBackend("xlib", width, height)
{
	printf("XlibBackend::XlibBackend %i %i\n", width, height);
	if(!xlibBackendPriv.OpenDisplay())
		throw XlibBackendException("Can't open display. Is DISPLAY set?\n");

	xlibBackendPriv.CreateSimpleWindow(this->width, this->height);

	xlibBackendPriv.SelectInput();
	xlibBackendPriv.MapWindow();
}

XlibBackend::~XlibBackend()
{
	this->destroySurface();

	xlibBackendPriv.DestroyWindow();
	xlibBackendPriv.CloseDisplay();
}


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
	// TODO use Backend::init() instead of having duplicated code. Problem is with
	//      `construct` static function, that use the defalt one instead of ours.
  // init(info);

  int width  = 0;
  int height = 0;
  if (info[0]->IsNumber()) width  = Nan::To<uint32_t>(info[0]).FromMaybe(0);
  if (info[1]->IsNumber()) height = Nan::To<uint32_t>(info[1]).FromMaybe(0);

  XlibBackend *backend = new XlibBackend(width, height);

	printf("XlibBackend::New 1 %i %i %i\n", width, height,backend);
  backend->Wrap(info.This());
	printf("XlibBackend::New 2 %i %i\n", width, height);

  info.GetReturnValue().Set(info.This());
	printf("XlibBackend::New 3 %i %i\n", width, height);
}
