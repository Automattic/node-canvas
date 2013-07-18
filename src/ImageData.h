
//
// ImageData.h
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#ifndef __NODE_IMAGE_DATA_H__
#define __NODE_IMAGE_DATA_H__

#include "Canvas.h"
#include "PixelArray.h"
#include <stdlib.h>

class ImageData: public node::ObjectWrap {
  public:
    static Persistent<FunctionTemplate> constructor;
    static void Initialize(Handle<Object> target);
    template<class T> static void New(const v8::FunctionCallbackInfo<T> &info);
    static void GetWidth(Local<String> prop, const PropertyCallbackInfo<Value> &info);
    static void GetHeight(Local<String> prop, const PropertyCallbackInfo<Value> &info);
    inline PixelArray *pixelArray(){ return _arr; }
    ImageData(PixelArray *arr): _arr(arr) {}
  private:
    PixelArray *_arr;
};

#endif
