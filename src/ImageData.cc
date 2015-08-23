
//
// ImageData.cc
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#include "ImageData.h"

Nan::Persistent<FunctionTemplate> ImageData::constructor;

/*
 * Initialize ImageData.
 */

void
ImageData::Initialize(Handle<Object> target) {
  Nan::HandleScope scope;

  // Constructor
  Local<FunctionTemplate> ctor = Nan::New<FunctionTemplate>(ImageData::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("ImageData").ToLocalChecked());

  // Prototype
  Local<ObjectTemplate> proto = ctor->PrototypeTemplate();
  Nan::SetAccessor(proto, Nan::New("width").ToLocalChecked(), GetWidth);
  Nan::SetAccessor(proto, Nan::New("height").ToLocalChecked(), GetHeight);
  target->Set(Nan::New("ImageData").ToLocalChecked(), ctor->GetFunction());
}

/*
 * Initialize a new ImageData object.
 */

NAN_METHOD(ImageData::New) {
  Nan::HandleScope scope;
  Local<Object> obj = info[0]->ToObject();

  if (!Nan::New(PixelArray::constructor)->HasInstance(obj))
    return Nan::ThrowTypeError("CanvasPixelArray expected");

  PixelArray *arr = Nan::ObjectWrap::Unwrap<PixelArray>(obj);
  ImageData *imageData = new ImageData(arr);
  info.This()->Set(Nan::New("data").ToLocalChecked(), info[0]);
  imageData->Wrap(info.This());
  info.GetReturnValue().Set(info.This());
}

/*
 * Get width.
 */

NAN_GETTER(ImageData::GetWidth) {
  Nan::HandleScope scope;
  ImageData *imageData = Nan::ObjectWrap::Unwrap<ImageData>(info.This());
  info.GetReturnValue().Set(Nan::New<Number>(imageData->pixelArray()->width()));
}

/*
 * Get height.
 */

NAN_GETTER(ImageData::GetHeight) {
  Nan::HandleScope scope;
  ImageData *imageData = Nan::ObjectWrap::Unwrap<ImageData>(info.This());
  info.GetReturnValue().Set(Nan::New<Number>(imageData->pixelArray()->height()));
}
