
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
  HandleScope scope;

  // Constructor
  constructor = Persistent<FunctionTemplate>::New(FunctionTemplate::New(ImageData::New));
  constructor->InstanceTemplate()->SetInternalFieldCount(1);
  constructor->SetClassName(String::NewSymbol("ImageData"));

  // Prototype
  Local<ObjectTemplate> proto = constructor->PrototypeTemplate();
  proto->SetAccessor(String::NewSymbol("width"), GetWidth);
  proto->SetAccessor(String::NewSymbol("height"), GetHeight);
  target->Set(String::NewSymbol("ImageData"), constructor->GetFunction());
}

/*
 * Initialize a new ImageData object.
 */

Handle<Value>
ImageData::New(const Arguments &args) {
  HandleScope scope;
  Local<Object> obj = args[0]->ToObject();

  if (!PixelArray::constructor->HasInstance(obj))
    return ThrowException(Exception::TypeError(String::New("CanvasPixelArray expected")));

  PixelArray *arr = ObjectWrap::Unwrap<PixelArray>(obj);
  ImageData *imageData = new ImageData(arr);
  args.This()->Set(String::NewSymbol("data"), args[0]);
  imageData->Wrap(args.This());
  return args.This();
}

/*
 * Get width.
 */

Handle<Value>
ImageData::GetWidth(Local<String> prop, const AccessorInfo &info) {
  ImageData *imageData = ObjectWrap::Unwrap<ImageData>(info.This());
  return Number::New(imageData->pixelArray()->width());
}

/*
 * Get height.
 */

Handle<Value>
ImageData::GetHeight(Local<String> prop, const AccessorInfo &info) {
  ImageData *imageData = ObjectWrap::Unwrap<ImageData>(info.This());
  return Number::New(imageData->pixelArray()->height());
}
