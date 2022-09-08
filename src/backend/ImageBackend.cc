#include "ImageBackend.h"

using namespace v8;

ImageBackend::ImageBackend(int width, int height)
	: Backend("image", width, height)
	{}

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

cairo_surface_t* ImageBackend::createSurface() {
  assert(!surface);
  surface = cairo_image_surface_create(format, width, height);
  assert(surface);
  Nan::AdjustExternalMemory(approxBytesPerPixel() * width * height);
  return surface;
}

void ImageBackend::destroySurface() {
  if (surface) {
    cairo_surface_destroy(surface);
    surface = nullptr;
    Nan::AdjustExternalMemory(-approxBytesPerPixel() * width * height);
  }
}

cairo_format_t ImageBackend::getFormat() {
  return format;
}

void ImageBackend::setFormat(cairo_format_t _format) {
	this->format = _format;
}

const char *ImageBackend::ctor_name = "ImageBackend";

void ImageBackend::Initialize(Local<Object> target, AddonData *addon_data) {
	Nan::HandleScope scope;

	Local<FunctionTemplate> ctor = Nan::New<FunctionTemplate>(ImageBackend::New);

  addon_data->image_backend_ctor_tpl.Reset(ctor);
	ctor->InstanceTemplate()->SetInternalFieldCount(2);
	ctor->SetClassName(Nan::New<String>(ctor_name).ToLocalChecked());
  Nan::Set(target,
           Nan::New<String>(ctor_name).ToLocalChecked(),
           Nan::GetFunction(ctor).ToLocalChecked()).Check();
}

NAN_METHOD(ImageBackend::New) {
  init(info);
}
