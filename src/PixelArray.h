
//
// PixelArray.h
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#ifndef __NODE_PIXEL_ARRAY_H__
#define __NODE_PIXEL_ARRAY_H__

#include "Canvas.h"

class PixelArray: public node::ObjectWrap {
  public:
    static Persistent<FunctionTemplate> constructor;
    static void Initialize(Handle<Object> target);
    static NAN_METHOD(New);
    static NAN_GETTER(GetLength);
    inline int length(){ return _width * _height * 4; }
    inline int width(){ return _width; }
    inline int height(){ return _height; }
    inline int stride(){ return _width * 4; }
    inline uint8_t *data(){ return _data; }
    PixelArray(Canvas *canvas, int x, int y, int width, int height);
    PixelArray(int width, int height);
    ~PixelArray();
  private:
    uint8_t *alloc();
    uint8_t *_data;
    int _width, _height;
};

#endif
