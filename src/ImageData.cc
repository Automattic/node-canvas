
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

#if NODE_MAJOR_VERSION == 0 && NODE_MINOR_VERSION <= 10
  Local<v8::Object> clampedArray;
  Local<Object> global = Context::GetCurrent()->Global();
#else
  Local<Uint8ClampedArray> clampedArray;
#endif

  int width;
  int height;


  if (args[0]->IsUint32() && args[1]->IsUint32()) {
    width = args[0]->Uint32Value();
    height = args[1]->Uint32Value();
    int size = width * height;

#if NODE_MAJOR_VERSION == 0 && NODE_MINOR_VERSION <= 10
    Handle<Value> caargv[] = { NanNew(size) };
    Local<Object> clampedArray = global->Get(NanNew("Uint8ClampedArray")).As<Function>()->NewInstance(1, caargv);
#else
    clampedArray = Uint8ClampedArray::New(ArrayBuffer::New(Isolate::GetCurrent(), size), 0, size);
#endif

#if NODE_MAJOR_VERSION == 0 && NODE_MINOR_VERSION <= 10
  } else if (args[0]->ToObject()->GetIndexedPropertiesExternalArrayDataType() == kExternalPixelArray && args[1]->IsUint32()) {
    clampedArray = args[0]->ToObject();
#else
  } else if (args[0]->IsUint8ClampedArray() && args[1]->IsUint32()) {
    clampedArray = args[0].As<Uint8ClampedArray>();
#endif
    width = args[1]->Uint32Value();
    if (args[2]->IsUint32()) {
      height = args[2]->Uint32Value();
    } else {
#if NODE_MAJOR_VERSION == 0 && NODE_MINOR_VERSION <= 10
      height = clampedArray->GetIndexedPropertiesExternalArrayDataLength() / width;
#else
      height = clampedArray->Length() / width;
#endif
    }
  } else {
    NanThrowTypeError("Expected (Uint8ClampedArray, width[, height]) or (width, height)");
    NanReturnUndefined();
  }

  // No behavior defined in spec. This is what WebKit does:
  if (width < 1) width = 1;
  if (height < 1) height = 1;

  void *dataPtr = clampedArray->GetIndexedPropertiesExternalArrayData();

  ImageData *imageData = new ImageData(reinterpret_cast<uint8_t*>(dataPtr), width, height);
  imageData->Wrap(args.This());
  args.This()->Set(NanNew("data"), clampedArray);
  NanReturnValue(args.This());
}

/*
 * Get width.
 */

NAN_GETTER(ImageData::GetWidth) {
  NanScope();
  ImageData *imageData = ObjectWrap::Unwrap<ImageData>(args.This());
  NanReturnValue(NanNew<Number>(imageData->width()));
}

/*
 * Get height.
 */

NAN_GETTER(ImageData::GetHeight) {
  NanScope();
  ImageData *imageData = ObjectWrap::Unwrap<ImageData>(args.This());
  NanReturnValue(NanNew<Number>(imageData->height()));
}
