
//
// PixelArray.cc
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#include "PixelArray.h"
#include <stdlib.h>
#include <string.h>

/*
 * Initialize PixelArray.
 */

void
PixelArray::Initialize(Handle<Object> target) {
  HandleScope scope;
  Local<FunctionTemplate> t = FunctionTemplate::New(PixelArray::New);
  t->InstanceTemplate()->SetInternalFieldCount(1);
  t->SetClassName(String::NewSymbol("CanvasPixelArray"));

  Local<ObjectTemplate> proto = t->InstanceTemplate();
  proto->SetAccessor(String::NewSymbol("length"), GetLength);
  target->Set(String::NewSymbol("CanvasPixelArray"), t->GetFunction());
}

/*
 * Initialize a new PixelArray.
 */

Handle<Value>
PixelArray::New(const Arguments &args) {
  HandleScope scope;
  PixelArray *arr;
  // TODO: arg handling

  switch (args.Length()) {
    // width, height
    case 2:
      arr = new PixelArray(
          args[0]->Int32Value()
        , args[1]->Int32Value());
      break;
    // canvas, x, y, width, height
    case 5: {
      Canvas *canvas = ObjectWrap::Unwrap<Canvas>(args[0]->ToObject());
      arr = new PixelArray(
          canvas
        , args[1]->Int32Value()
        , args[2]->Int32Value()
        , args[3]->Int32Value()
        , args[4]->Int32Value());
      }
      break;
    default:
      return ThrowException(Exception::TypeError(String::New("invalid arguments")));
  }
  // Let v8 handle accessors (and clamping)
  args.This()->SetIndexedPropertiesToPixelData(
      arr->data()
    , arr->length());

  arr->Wrap(args.This());
  return args.This();
}

/*
 * Get length.
 */

Handle<Value>
PixelArray::GetLength(Local<String> prop, const AccessorInfo &info) {
  return Number::New(info.This()->GetIndexedPropertiesPixelDataLength());
}

/*
 * Initialize a new PixelArray.
 */

PixelArray::PixelArray(Canvas *canvas, int sx, int sy, int width, int height):
  _width(width), _height(height) {

  // Alloc space for our new data
  _stride = width * 4;
  uint8_t *dst = _data = (uint8_t *) malloc(length());
  memset(_data, 0, length());
  uint8_t *src = canvas->data();

  // Normalize data (argb -> rgba)
  for (int y = 0; y < height; ++y) {
    uint32_t *srcRow = (uint32_t *)(src + _stride * y);
    uint32_t *dstRow = (uint32_t *)(dst + _stride * y); 
    for (int x = 0; x < width; ++x) {
      uint32_t *pixel = srcRow + x;
      uint32_t *dstPixel = dstRow + x;

      // premultiplied
      uint8_t a = *pixel >> 24;
      uint8_t r = (*pixel >> 16) * 255 / a;
      uint8_t g = (*pixel >> 8) * 255 / a;
      uint8_t b = *pixel * 255 / a;

      printf("rgba(%d,%d,%d,%d)\n", r,g,b,a);
    }
  }
}

PixelArray::PixelArray(int width, int height):
  _width(width), _height(height) {
  // TODO: error handling
  // TODO: implement
}

PixelArray::~PixelArray() {
  free(_data);
}
