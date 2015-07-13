
//
// PixelArray.cc
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#include "PixelArray.h"
#include <stdlib.h>
#include <string.h>

Nan::Persistent<FunctionTemplate> PixelArray::constructor;

/*
 * Initialize PixelArray.
 */

void
PixelArray::Initialize(Handle<Object> target) {
  Nan::HandleScope scope;

  // Constructor
  Local<FunctionTemplate> ctor = Nan::New<FunctionTemplate>(PixelArray::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("CanvasPixelArray").ToLocalChecked());

  // Prototype
  Local<ObjectTemplate> proto = ctor->InstanceTemplate();
  Nan::SetAccessor(proto, Nan::New("length").ToLocalChecked(), GetLength);
  target->Set(Nan::New("CanvasPixelArray").ToLocalChecked(), ctor->GetFunction());
}

/*
 * Initialize a new PixelArray.
 */

NAN_METHOD(PixelArray::New) {
  Nan::HandleScope scope;
  PixelArray *arr;
  Local<Object> obj = info[0]->ToObject();

  switch (info.Length()) {
    // width, height
    case 2:
      arr = new PixelArray(
          info[0]->Int32Value()
        , info[1]->Int32Value());
      break;
    // canvas, x, y, width, height
    case 5: {
      if (!Nan::New(Canvas::constructor)->HasInstance(obj))
        return Nan::ThrowTypeError("Canvas expected");

      Canvas *canvas = Nan::ObjectWrap::Unwrap<Canvas>(obj);
      arr = new PixelArray(
          canvas
        , info[1]->Int32Value()
        , info[2]->Int32Value()
        , info[3]->Int32Value()
        , info[4]->Int32Value());
      }
      break;
    default:
      return Nan::ThrowTypeError("invalid arguments");
  }

  // Let v8 handle accessors (and clamping)
  info.This()->SetIndexedPropertiesToPixelData(
      arr->data()
    , arr->length());

  arr->Wrap(info.This());
  info.GetReturnValue().Set(info.This());
}

/*
 * Get length.
 */

NAN_GETTER(PixelArray::GetLength) {
  Nan::HandleScope scope;
  info.GetReturnValue().Set(Nan::New<Number>(info.This()->GetIndexedPropertiesPixelDataLength()));
}

/*
 * Initialize a new PixelArray copying data
 * from the canvas surface using the given rect.
 */

PixelArray::PixelArray(Canvas *canvas, int sx, int sy, int width, int height):
  _width(width), _height(height) {

  // Alloc space for our new data
  uint8_t *dst = alloc();
  uint8_t *src = canvas->data();
  int srcStride = canvas->stride()
    , dstStride = stride();

  if (sx < 0) width += sx, sx = 0;
  if (sy < 0) height += sy, sy = 0;
  if (sx + width > canvas->width) width = canvas->width - sx;
  if (sy + height > canvas->height) height = canvas->height - sy;
  if (width <= 0 || height <= 0) return;

  // Normalize data (argb -> rgba)
  for (int y = 0; y < height; ++y) {
    uint32_t *row = (uint32_t *)(src + srcStride * (y + sy));
    for (int x = 0; x < width; ++x) {
      int bx = x * 4;
      uint32_t *pixel = row + x + sx;
      uint8_t a = *pixel >> 24;
      uint8_t r = *pixel >> 16;
      uint8_t g = *pixel >> 8;
      uint8_t b = *pixel;
      dst[bx + 3] = a;

      // Performance optimization: fully transparent/opaque pixels
      // can be processed more efficiently
      if (a != 0 && a != 255) {
        float alpha = (float) a / 255;
        dst[bx + 0] = (int)((float) r / alpha);
        dst[bx + 1] = (int)((float) g / alpha);
        dst[bx + 2] = (int)((float) b / alpha);
      } else {
        dst[bx + 0] = r;
        dst[bx + 1] = g;
        dst[bx + 2] = b;
      }
    }
    dst += dstStride;
  }
}

/*
 * Initialize an empty PixelArray with the given dimensions.
 */

PixelArray::PixelArray(int width, int height):
  _width(width), _height(height) {
  alloc();
}

/*
 * Allocate / zero data buffer. Hint mem adjustment.
 */

uint8_t *
PixelArray::alloc() {
  int len = length();
  _data = (uint8_t *) calloc(1, len);
  Nan::AdjustExternalMemory(len);
  return _data;
}

/*
 * Hint mem adjustment.
 */

PixelArray::~PixelArray() {
  Nan::AdjustExternalMemory(-length());
  free(_data);
}
