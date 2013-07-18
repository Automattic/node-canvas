
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
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);

  // Constructor
  Local<FunctionTemplate> lconstructor = Local<FunctionTemplate>::New(isolate, FunctionTemplate::New(ImageData::New));
  lconstructor->InstanceTemplate()->SetInternalFieldCount(1);
  lconstructor->SetClassName(String::NewSymbol("ImageData"));

  // Prototype
  Local<ObjectTemplate> proto = lconstructor->PrototypeTemplate();
  proto->SetAccessor(String::NewSymbol("width"), GetWidth);
  proto->SetAccessor(String::NewSymbol("height"), GetHeight);

  constructor.Reset(isolate, lconstructor);

  target->Set(String::NewSymbol("ImageData"), lconstructor->GetFunction());
}

/*
 * Initialize a new ImageData object.
 */

template<class T> void
ImageData::New(const v8::FunctionCallbackInfo<T>  &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  Local<Object> obj = info[0]->ToObject();

  if (!Local<FunctionTemplate>::New(isolate, PixelArray::constructor)->HasInstance(obj)) {
    info.GetReturnValue().Set(ThrowException(Exception::TypeError(String::New("CanvasPixelArray expected"))));
    return;
  }

  PixelArray *arr = ObjectWrap::Unwrap<PixelArray>(obj);
  ImageData *imageData = new ImageData(arr);
  info.This()->Set(String::NewSymbol("data"), info[0]);
  imageData->Wrap(info.This());
  info.GetReturnValue().Set(info.This());
}

/*
 * Get width.
 */

void
ImageData::GetWidth(Local<String> prop, const PropertyCallbackInfo<Value> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);

  ImageData *imageData = ObjectWrap::Unwrap<ImageData>(info.This());
  info.GetReturnValue().Set(Number::New(imageData->pixelArray()->width()));
}

/*
 * Get height.
 */

void
ImageData::GetHeight(Local<String> prop, const PropertyCallbackInfo<Value> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);

  ImageData *imageData = ObjectWrap::Unwrap<ImageData>(info.This());
  info.GetReturnValue().Set(Number::New(imageData->pixelArray()->height()));
}
