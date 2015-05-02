
//
// ImageData.cc
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#include "ImageData.h"

Persistent<FunctionTemplate> ImageData::constructor;

/*
 * Initialize ImageData.
 */

void
ImageData::Initialize(Handle<Object> target) {
  NanScope();

  // Constructor
  Local<FunctionTemplate> ctor = NanNew<FunctionTemplate>(ImageData::New);
  NanAssignPersistent(constructor, ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(NanNew("ImageData"));

  // Prototype
  Local<ObjectTemplate> proto = ctor->PrototypeTemplate();
  proto->SetAccessor(NanNew("width"), GetWidth);
  proto->SetAccessor(NanNew("height"), GetHeight);
  target->Set(NanNew("ImageData"), ctor->GetFunction());
}

/*
 * Initialize a new ImageData object.
 */

NAN_METHOD(ImageData::New) {
  NanScope();
  Local<Object> obj = args[0]->ToObject();

  if (!NanHasInstance(PixelArray::constructor, obj))
    return NanThrowTypeError("CanvasPixelArray expected");

  PixelArray *arr = ObjectWrap::Unwrap<PixelArray>(obj);
  ImageData *imageData = new ImageData(arr);
  args.This()->Set(NanNew("data"), args[0]);
  imageData->Wrap(args.This());
  NanReturnValue(args.This());
}

/*
 * Get width.
 */

NAN_GETTER(ImageData::GetWidth) {
  NanScope();
  ImageData *imageData = ObjectWrap::Unwrap<ImageData>(args.This());
  NanReturnValue(NanNew<Number>(imageData->pixelArray()->width()));
}

/*
 * Get height.
 */

NAN_GETTER(ImageData::GetHeight) {
  NanScope();
  ImageData *imageData = ObjectWrap::Unwrap<ImageData>(args.This());
  NanReturnValue(NanNew<Number>(imageData->pixelArray()->height()));
}
