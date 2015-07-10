#include "ImageBackend.h"

ImageBackend::ImageBackend(int width, int height)
	: Backend("image", width, height)
{}


cairo_surface_t* ImageBackend::createSurface()
{
	this->surface = cairo_image_surface_create(CAIRO_FORMAT_ARGB32, width, height);

	return this->surface;
}


Persistent<FunctionTemplate> ImageBackend::constructor;

void ImageBackend::Initialize(Handle<Object> target)
{
	NanScope();
	Local<FunctionTemplate> ctor = NanNew<FunctionTemplate>(ImageBackend::New);
	NanAssignPersistent(ImageBackend::constructor, ctor);
	ctor->InstanceTemplate()->SetInternalFieldCount(1);
	ctor->SetClassName(NanNew("ImageBackend"));
	target->Set(NanNew("ImageBackend"), ctor->GetFunction());
}

NAN_METHOD(ImageBackend::New)
{
	int width  = 0;
	int height = 0;
	if (args[0]->IsNumber()) width  = args[0]->Uint32Value();
	if (args[1]->IsNumber()) height = args[1]->Uint32Value();

	ImageBackend* backend = new ImageBackend(width, height);

	backend->Wrap(args.This());
	NanReturnValue(args.This());
}
