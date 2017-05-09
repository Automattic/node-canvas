#include "ImageBackend.h"

using namespace v8;

ImageBackend::ImageBackend(int width, int height)
	: Backend("image", width, height)
{
	createSurface();
}

ImageBackend::~ImageBackend()
{
	destroySurface();

	Nan::AdjustExternalMemory(-4 * width * height);
}

cairo_surface_t* ImageBackend::createSurface()
{
	this->surface = cairo_image_surface_create(CAIRO_FORMAT_ARGB32, width, height);
	assert(this->surface);
  Nan::AdjustExternalMemory(4 * width * height);

	return this->surface;
}

cairo_surface_t* ImageBackend::recreateSurface()
{
	// Re-surface
	int old_width = cairo_image_surface_get_width(this->surface);
	int old_height = cairo_image_surface_get_height(this->surface);
	this->destroySurface();
	Nan::AdjustExternalMemory(-4 * old_width * old_height);

	return createSurface();
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
