
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
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

  // Constructor
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  constructor = Persistent<FunctionTemplate>::New(FunctionTemplate::New(ImageData::New));
  constructor->InstanceTemplate()->SetInternalFieldCount(1);
  constructor->SetClassName(String::NewSymbol("ImageData"));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Local<FunctionTemplate> lconstructor = Local<FunctionTemplate>::New(isolate, FunctionTemplate::New(ImageData::New));
  lconstructor->InstanceTemplate()->SetInternalFieldCount(1);
  lconstructor->SetClassName(String::NewSymbol("ImageData"));
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

  // Prototype
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  Local<ObjectTemplate> proto = constructor->PrototypeTemplate();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Local<ObjectTemplate> proto = lconstructor->PrototypeTemplate();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  proto->SetAccessor(String::NewSymbol("width"), GetWidth);
  proto->SetAccessor(String::NewSymbol("height"), GetHeight);
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  target->Set(String::NewSymbol("ImageData"), constructor->GetFunction());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */

  constructor.Reset(isolate, lconstructor);

  target->Set(String::NewSymbol("ImageData"), lconstructor->GetFunction());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Initialize a new ImageData object.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
ImageData::New(const Arguments &args) {
  HandleScope scope;
  Local<Object> obj = args[0]->ToObject();

  if (!PixelArray::constructor->HasInstance(obj))
    return ThrowException(Exception::TypeError(String::New("CanvasPixelArray expected")));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
ImageData::New(const v8::FunctionCallbackInfo<T>  &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  Local<Object> obj = info[0]->ToObject();

  if (!Local<FunctionTemplate>::New(isolate, PixelArray::constructor)->HasInstance(obj)) {
    info.GetReturnValue().Set(ThrowException(Exception::TypeError(String::New("CanvasPixelArray expected"))));
    return;
  }
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

  PixelArray *arr = ObjectWrap::Unwrap<PixelArray>(obj);
  ImageData *imageData = new ImageData(arr);
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  args.This()->Set(String::NewSymbol("data"), args[0]);
  imageData->Wrap(args.This());
  return args.This();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.This()->Set(String::NewSymbol("data"), info[0]);
  imageData->Wrap(info.This());
  info.GetReturnValue().Set(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Get width.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
ImageData::GetWidth(Local<String> prop, const AccessorInfo &info) {
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
void
ImageData::GetWidth(Local<String> prop, const PropertyCallbackInfo<Value> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);

#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  ImageData *imageData = ObjectWrap::Unwrap<ImageData>(info.This());
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Number::New(imageData->pixelArray()->width());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().Set(Number::New(imageData->pixelArray()->width()));
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Get height.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
ImageData::GetHeight(Local<String> prop, const AccessorInfo &info) {
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
void
ImageData::GetHeight(Local<String> prop, const PropertyCallbackInfo<Value> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);

#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  ImageData *imageData = ObjectWrap::Unwrap<ImageData>(info.This());
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  return Number::New(imageData->pixelArray()->height());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.GetReturnValue().Set(Number::New(imageData->pixelArray()->height()));
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}
