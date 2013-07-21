
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
    static NAN_METHOD(New);
    static NAN_GETTER(GetWidth);
    static NAN_GETTER(GetHeight);
    inline PixelArray *pixelArray(){ return _arr; }
    ImageData(PixelArray *arr): _arr(arr) {}
  private:
    PixelArray *_arr;
};

#endif
