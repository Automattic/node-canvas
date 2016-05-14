
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
  if (!info.IsConstructCall()) {
    return Nan::ThrowTypeError("Class constructors cannot be invoked without 'new'");
  }

#if NODE_MAJOR_VERSION == 0 && NODE_MINOR_VERSION <= 10
  Local<v8::Object> clampedArray;
  Local<Object> global = Context::GetCurrent()->Global();
#else
  Local<Uint8ClampedArray> clampedArray;
#endif

  uint32_t width;
  uint32_t height;
  int length;

  if (info[0]->IsUint32() && info[1]->IsUint32()) {
    width = info[0]->Uint32Value();
    if (width == 0) {
      Nan::ThrowRangeError("The source width is zero.");
      return;
    }
    height = info[1]->Uint32Value();
    if (height == 0) {
      Nan::ThrowRangeError("The source height is zero.");
      return;
    }
    length = width * height * 4;

#if NODE_MAJOR_VERSION == 0 && NODE_MINOR_VERSION <= 10
    Local<Int32> sizeHandle = Nan::New(length);
    Local<Value> caargv[] = { sizeHandle };
    clampedArray = global->Get(Nan::New("Uint8ClampedArray").ToLocalChecked()).As<Function>()->NewInstance(1, caargv);
#else
    clampedArray = Uint8ClampedArray::New(ArrayBuffer::New(Isolate::GetCurrent(), length), 0, length);
#endif

#if NODE_MAJOR_VERSION == 0 && NODE_MINOR_VERSION <= 10
  } else if (info[0]->ToObject()->GetIndexedPropertiesExternalArrayDataType() == kExternalPixelArray && info[1]->IsUint32()) {
    clampedArray = info[0]->ToObject();
    length = clampedArray->GetIndexedPropertiesExternalArrayDataLength();
#else
  } else if (info[0]->IsUint8ClampedArray() && info[1]->IsUint32()) {
    clampedArray = info[0].As<Uint8ClampedArray>();
    length = clampedArray->Length();
#endif
    if (length == 0) {
      Nan::ThrowRangeError("The input data has a zero byte length.");
      return;
    }
    if (length % 4 != 0) {
      Nan::ThrowRangeError("The input data byte length is not a multiple of 4.");
      return;
    }
    width = info[1]->Uint32Value();
    int size = length / 4;
    if (width == 0) {
      Nan::ThrowRangeError("The source width is zero.");
      return;
    }
    if (size % width != 0) {
      Nan::ThrowRangeError("The input data byte length is not a multiple of (4 * width).");
      return;
    }
    height = size / width;
    if (info[2]->IsUint32() && info[2]->Uint32Value() != height) {
      Nan::ThrowRangeError("The input data byte length is not equal to (4 * width * height).");
      return;
    }
  } else {
    Nan::ThrowTypeError("Expected (Uint8ClampedArray, width[, height]) or (width, height)");
    return;
  }

  Nan::TypedArrayContents<uint8_t> dataPtr(clampedArray);

  ImageData *imageData = new ImageData(reinterpret_cast<uint8_t*>(*dataPtr), width, height);
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
