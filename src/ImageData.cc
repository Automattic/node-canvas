
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

  Handle<Object> clampedArray;
  void *buffer;
  int width, height;

  Local<Object> obj = args[0]->ToObject();

  switch (args.Length()) {
    // PixelArray - backward compatible
    case 1: {
      if (!NanHasInstance(PixelArray::constructor, obj))
        return NanThrowTypeError("CanvasPixelArray expected");

      PixelArray *arr = ObjectWrap::Unwrap<PixelArray>(obj);
      width = arr->width();
      height = arr->height();

      //convert pixelarray into unit8clamparray
      Handle<Value> ui8av = Context::GetCurrent()->Global()->Get(String::NewSymbol("Uint8ClampedArray"));
      Handle<Value> argv[] = { Integer::NewFromUnsigned(arr->length()) };
      clampedArray = Handle<Function>::Cast(ui8av)->NewInstance(1, argv);

      Local<Object> arrBuffer = clampedArray->Get(v8::String::New("buffer"))->ToObject();
      buffer = arrBuffer->GetPointerFromInternalField(0);
      memcpy(buffer, arr->data(), arr->length());
      
      //kept old pixelArray for now
      args.This()->Set(NanNew("pixelArray"), args[0]);

    }
      break;

    // uint8clampedarray, width, height
    case 3: {

      clampedArray = obj;
      width = args[1]->Int32Value();
      height = args[2]->Int32Value();

      Local<Object> internalBuffer = clampedArray->Get(v8::String::New("buffer"))->ToObject();
      buffer = internalBuffer->GetPointerFromInternalField(0);

    }
    break;

    // canvas, x, y, width, height
    case 5: {
      if (!NanHasInstance(Canvas::constructor, obj))
        return NanThrowTypeError("Canvas expected");

      Canvas *canvas = ObjectWrap::Unwrap<Canvas>(obj);
      int sx = args[1]->Int32Value();
      int sy = args[2]->Int32Value();
      int swidth = args[3]->Int32Value();
      int sheight = args[4]->Int32Value();

      Handle<Value> ui8av = Context::GetCurrent()->Global()->Get(String::NewSymbol("Uint8ClampedArray"));
      Handle<Value> argv[] = { Integer::NewFromUnsigned(swidth * sheight * 4) };
      clampedArray = Handle<Function>::Cast(ui8av)->NewInstance(1, argv);

      Local<Object> arrBuffer = clampedArray->Get(v8::String::New("buffer"))->ToObject();
      buffer = arrBuffer->GetPointerFromInternalField(0);

      width = swidth;
      height = sheight;

      //copy canvas pixels into buffer
      uint8_t *dst = reinterpret_cast<uint8_t*>(buffer);
      uint8_t *src = canvas->data();
      int srcStride = canvas->stride();
      int dstStride = width * 4;

      if (sx < 0) swidth += sx, sx = 0;
      if (sy < 0) sheight += sy, sy = 0;
      if (sx + swidth > canvas->width) swidth = canvas->width - sx;
      if (sy + sheight > canvas->height) sheight = canvas->height - sy;
      if (swidth > 0 && height > 0) {

        // Normalize data (argb -> rgba)
        for (int y = 0; y < sheight; ++y) {
          uint32_t *row = (uint32_t *)(src + srcStride * (y + sy));
          for (int x = 0; x < swidth; ++x) {
            int bx = x * 4;
            uint32_t *pixel = row + x + sx;
            uint8_t a = *pixel >> 24;
            uint8_t r = *pixel >> 16;
            uint8_t g = *pixel >> 8;
            uint8_t b = *pixel;
            dst[bx + 3] = a;
            float alpha = (float) a / 255;
            dst[bx + 0] = (int)((float) r / alpha);
            dst[bx + 1] = (int)((float) g / alpha);
            dst[bx + 2] = (int)((float) b / alpha);
          }
          dst += dstStride;
        }
      }
      
      }
      break;
    default:
      return NanThrowTypeError("invalid arguments");
  }


  ImageData *imageData = new ImageData(reinterpret_cast<uint8_t*>(buffer), width, height);
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
