
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
ImageData::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
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
  Nan::Set(target, Nan::New("ImageData").ToLocalChecked(), ctor->GetFunction());
}

/*
 * Initialize a new ImageData object.
 */

NAN_METHOD(ImageData::New) {
#if NODE_MAJOR_VERSION == 0 && NODE_MINOR_VERSION <= 10
  Local<v8::Object> clampedArray;
  Local<Object> global = Context::GetCurrent()->Global();
#else
  Local<Uint8ClampedArray> clampedArray;
#endif

  int width;
  int height;

  if (info[0]->IsUint32() && info[1]->IsUint32()) {
    width = info[0]->Uint32Value();
    height = info[1]->Uint32Value();
    int size = width * height;

#if NODE_MAJOR_VERSION == 0 && NODE_MINOR_VERSION <= 10
    Local<Int32> sizeHandle = Nan::New(size);
    Local<Value> caargv[] = { sizeHandle };
    clampedArray = global->Get(Nan::New("Uint8ClampedArray").ToLocalChecked()).As<Function>()->NewInstance(1, caargv);
#else
    clampedArray = Uint8ClampedArray::New(ArrayBuffer::New(Isolate::GetCurrent(), size), 0, size);
#endif

#if NODE_MAJOR_VERSION == 0 && NODE_MINOR_VERSION <= 10
  } else if (info[0]->ToObject()->GetIndexedPropertiesExternalArrayDataType() == kExternalPixelArray && info[1]->IsUint32()) {
    clampedArray = info[0]->ToObject();
#else
  } else if (info[0]->IsUint8ClampedArray() && info[1]->IsUint32()) {
    clampedArray = info[0].As<Uint8ClampedArray>();
#endif
    width = info[1]->Uint32Value();
    if (info[2]->IsUint32()) {
      height = info[2]->Uint32Value();
    } else {
#if NODE_MAJOR_VERSION == 0 && NODE_MINOR_VERSION <= 10
      height = clampedArray->GetIndexedPropertiesExternalArrayDataLength() / width;
#else
      height = clampedArray->Length() / width;
#endif
    }
  } else {
    Nan::ThrowTypeError("Expected (Uint8ClampedArray, width[, height]) or (width, height)");
    return;
  }

  // No behavior defined in spec. This is what WebKit does:
  if (width < 1) width = 1;
  if (height < 1) height = 1;

#if NODE_MAJOR_VERSION < 3
  void *dataPtr = clampedArray->GetIndexedPropertiesExternalArrayData();
#else
  void *dataPtr = clampedArray->Buffer()->GetContents().Data();
#endif

  ImageData *imageData = new ImageData(reinterpret_cast<uint8_t*>(dataPtr), width, height);
  imageData->Wrap(info.This());
  info.This()->Set(Nan::New("data").ToLocalChecked(), clampedArray);
  info.GetReturnValue().Set(info.This());
}

/*
 * Get width.
 */

NAN_GETTER(ImageData::GetWidth) {
  ImageData *imageData = Nan::ObjectWrap::Unwrap<ImageData>(info.This());
  info.GetReturnValue().Set(Nan::New<Number>(imageData->width()));
}

/*
 * Get height.
 */

NAN_GETTER(ImageData::GetHeight) {
  ImageData *imageData = Nan::ObjectWrap::Unwrap<ImageData>(info.This());
  info.GetReturnValue().Set(Nan::New<Number>(imageData->height()));
}
