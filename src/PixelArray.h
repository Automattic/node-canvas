
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
#if !NODE_VERSION_AT_LEAST(0, 11, 4)
    static Handle<Value> New(const Arguments &args);
    static Handle<Value> GetLength(Local<String> prop, const AccessorInfo &info);
#else /* NODE_VERSION_AT_LEAST(0, 11, 4) */
    template<class T> static void New(const v8::FunctionCallbackInfo<T> &info);
    static void GetLength(Local<String> prop, const PropertyCallbackInfo<Value> &info);
#endif /* NODE_VERSION_AT_LEAST(0, 11, 4) */
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
