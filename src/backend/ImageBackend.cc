#include "ImageBackend.h"

using namespace v8;

ImageBackend::ImageBackend(int width, int height)
	: Backend("image", width, height)
{}


cairo_surface_t* ImageBackend::createSurface()
{
	this->surface = cairo_image_surface_create(CAIRO_FORMAT_ARGB32, width, height);

	return this->surface;
}


Nan::Persistent<FunctionTemplate> ImageBackend::constructor;

void ImageBackend::Initialize(Handle<Object> target)
{
	Nan::HandleScope scope;

	Local<FunctionTemplate> ctor = Nan::New<FunctionTemplate>(ImageBackend::New);
	ImageBackend::constructor.Reset(ctor);
	ctor->InstanceTemplate()->SetInternalFieldCount(1);
	ctor->SetClassName(Nan::New<String>("ImageBackend").ToLocalChecked());
	target->Set(Nan::New<String>("ImageBackend").ToLocalChecked(), ctor->GetFunction());
}

NAN_METHOD(ImageBackend::New)
{
	int width  = 0;
	int height = 0;
	if (info[0]->IsNumber()) width  = info[0]->Uint32Value();
	if (info[1]->IsNumber()) height = info[1]->Uint32Value();

	ImageBackend* backend = new ImageBackend(width, height);

	backend->Wrap(info.This());
	info.GetReturnValue().Set(info.This());
}
