
//
// PixelArray.cc
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#include "PixelArray.h"
#include <stdlib.h>
#include <string.h>

Persistent<FunctionTemplate> PixelArray::constructor;

/*
 * Initialize PixelArray.
 */

void
PixelArray::Initialize(Handle<Object> target) {
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

  // Constructor
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  constructor = Persistent<FunctionTemplate>::New(FunctionTemplate::New(PixelArray::New));
  constructor->InstanceTemplate()->SetInternalFieldCount(1);
  constructor->SetClassName(String::NewSymbol("CanvasPixelArray"));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Local<FunctionTemplate> lconstructor = Local<FunctionTemplate>::New(isolate, FunctionTemplate::New(PixelArray::New));
  lconstructor->InstanceTemplate()->SetInternalFieldCount(1);
  lconstructor->SetClassName(String::NewSymbol("CanvasPixelArray"));
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

  // Prototype
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  Local<ObjectTemplate> proto = constructor->InstanceTemplate();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Local<ObjectTemplate> proto = lconstructor->InstanceTemplate();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  proto->SetAccessor(String::NewSymbol("length"), GetLength);
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  target->Set(String::NewSymbol("CanvasPixelArray"), constructor->GetFunction());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */

  constructor.Reset(isolate, lconstructor);

  target->Set(String::NewSymbol("CanvasPixelArray"), lconstructor->GetFunction());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Initialize a new PixelArray.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
PixelArray::New(const Arguments &args) {
  HandleScope scope;
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
template<class T> void
PixelArray::New(const v8::FunctionCallbackInfo<T> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  PixelArray *arr;
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  Local<Object> obj = args[0]->ToObject();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  Local<Object> obj = info[0]->ToObject();
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  switch (args.Length()) {
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  switch (info.Length()) {
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    // width, height
    case 2:
      arr = new PixelArray(
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
          args[0]->Int32Value()
        , args[1]->Int32Value());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
          info[0]->Int32Value()
        , info[1]->Int32Value());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
      break;
    // canvas, x, y, width, height
    case 5: {
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
      if (!Canvas::constructor->HasInstance(obj))
        return ThrowException(Exception::TypeError(String::New("Canvas expected")));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
      if (!Local<FunctionTemplate>::New(isolate, Canvas::constructor)->HasInstance(obj)) {
        info.GetReturnValue().Set(ThrowException(Exception::TypeError(String::New("Canvas expected"))));
        return;
      }
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */

      Canvas *canvas = ObjectWrap::Unwrap<Canvas>(obj);
      arr = new PixelArray(
          canvas
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
        , args[1]->Int32Value()
        , args[2]->Int32Value()
        , args[3]->Int32Value()
        , args[4]->Int32Value());
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
        , info[1]->Int32Value()
        , info[2]->Int32Value()
        , info[3]->Int32Value()
        , info[4]->Int32Value());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
      }
      break;
    default:
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
      return ThrowException(Exception::TypeError(String::New("invalid arguments")));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
      info.GetReturnValue().Set(ThrowException(Exception::TypeError(String::New("invalid arguments"))));
      return;
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  }

  // Let v8 handle accessors (and clamping)
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  args.This()->SetIndexedPropertiesToPixelData(
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  info.This()->SetIndexedPropertiesToPixelData(
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
      arr->data()
    , arr->length());

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
  arr->Wrap(args.This());
  return args.This();
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
  arr->Wrap(info.This());
  info.GetReturnValue().Set(info.This());
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
}

/*
 * Get length.
 */

#if !NODE_VERSION_AT_LEAST(0, 11, 4)
Handle<Value>
PixelArray::GetLength(Local<String> prop, const AccessorInfo &info) {
  HandleScope scope;
  return scope.Close(Number::New(info.This()->GetIndexedPropertiesPixelDataLength()));
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
void
PixelArray::GetLength(Local<String> prop, const PropertyCallbackInfo<Value> &info) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  info.GetReturnValue().Set(Number::New(info.This()->GetIndexedPropertiesPixelDataLength()));
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
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
      float alpha = (float) a / 255;
      dst[bx + 0] = (int)((float) r / alpha);
      dst[bx + 1] = (int)((float) g / alpha);
      dst[bx + 2] = (int)((float) b / alpha);
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
  V8::AdjustAmountOfExternalAllocatedMemory(len);
  return _data;
}

/*
 * Hint mem adjustment.
 */

PixelArray::~PixelArray() {
  V8::AdjustAmountOfExternalAllocatedMemory(-length());
  free(_data);
}
