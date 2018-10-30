#include "ImageBackend.h"

using namespace v8;

ImageBackend::ImageBackend(int width, int height)
	: Backend("image", width, height)
	{}

ImageBackend::~ImageBackend()
{
    if (surface) {
        destroySurface();
        Nan::AdjustExternalMemory(-approxBytesPerPixel() * width * height);
    }
}

Backend *ImageBackend::construct(int width, int height){
  return new ImageBackend(width, height);
}

// This returns an approximate value only, suitable for Nan::AdjustExternalMemory.
// The formats that don't map to intrinsic types (RGB30, A1) round up.
int32_t ImageBackend::approxBytesPerPixel() {
  switch (format) {
  case CAIRO_FORMAT_ARGB32:
  case CAIRO_FORMAT_RGB24:
    return 4;
#ifdef CAIRO_FORMAT_RGB30
  case CAIRO_FORMAT_RGB30:
    return 3;
#endif
  case CAIRO_FORMAT_RGB16_565:
    return 2;
  case CAIRO_FORMAT_A8:
  case CAIRO_FORMAT_A1:
    return 1;
  default:
    return 0;
  }
}

cairo_surface_t* ImageBackend::createSurface()
{
  assert(!this->surface);
  this->surface = cairo_image_surface_create(this->format, width, height);
  assert(this->surface);
  Nan::AdjustExternalMemory(approxBytesPerPixel() * width * height);

  return this->surface;
}

cairo_surface_t* ImageBackend::recreateSurface()
{
	// Re-surface
	if (this->surface) {
		int old_width = cairo_image_surface_get_width(this->surface);
		int old_height = cairo_image_surface_get_height(this->surface);
		this->destroySurface();
		Nan::AdjustExternalMemory(-approxBytesPerPixel() * old_width * old_height);
	}

	return createSurface();
}

cairo_format_t ImageBackend::getFormat() {
  return format;
}

void ImageBackend::setFormat(cairo_format_t _format) {
	this->format = _format;
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

NAN_METHOD(ImageBackend::New) {
  init(info);
}
