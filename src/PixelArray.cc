
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

PixelArray::PixelArray(Canvas *canvas, int src_x, int src_y, int width, int height):
  _width(width), _height(height) {
}

PixelArray::PixelArray(int width, int height):
  _width(width), _height(height) {
  // TODO: error handling
  // TODO: implement
}

PixelArray::~PixelArray() {

}