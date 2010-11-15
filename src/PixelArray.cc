
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
 * Initialize a new PixelArray copying data
 * from the canvas surface using the given rect.
 */

PixelArray::PixelArray(Canvas *canvas, int sx, int sy, int width, int height):
  _width(width), _height(height) {

  // Alloc space for our new data
  uint8_t *dst = alloc();
  uint8_t *src = canvas->data();
  int s = stride();

  // Normalize data (argb -> rgba)
  for (int y = 0; y < height; ++y) {
    uint32_t *row = (uint32_t *)(src + s * y);
    for (int x = 0; x < width; ++x) {
      int bx = x * 4;
      uint32_t *pixel = row + x;

      // premultiplied
      uint8_t a = *pixel >> 24;
      dst[bx + 3] = a;
      dst[bx + 0] = (*pixel >> 16) * 255 / a;
      dst[bx + 1] = (*pixel >> 8) * 255 / a;
      dst[bx + 2] = *pixel * 255 / a;
    }
    dst += s;
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
 * Allocate / zero data buffer.
 */

uint8_t *
PixelArray::alloc() {
  _data = (uint8_t *) malloc(length());
  memset(_data, 0, length());
  return _data;
}

PixelArray::~PixelArray() {
  free(_data);
}
