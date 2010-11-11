
//
// Image.h
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#ifndef __NODE_IMAGE_H__
#define __NODE_IMAGE_H__

#include "canvas.h"

using namespace v8;

class Image: public node::ObjectWrap {
  public:
    bool complete;
    char *filename;
    Persistent<Function> onload;
    Persistent<Function> onerror;
    static void Initialize(Handle<Object> target);
    static Handle<Value> New(const Arguments &args);
    static Handle<Value> Inspect(const Arguments &args);
    static Handle<Value> GetSrc(Local<String> prop, const AccessorInfo &info);
    static Handle<Value> GetOnload(Local<String> prop, const AccessorInfo &info);
    static Handle<Value> GetOnerror(Local<String> prop, const AccessorInfo &info);
    static void SetSrc(Local<String> prop, Local<Value> val, const AccessorInfo &info);
    static void SetOnload(Local<String> prop, Local<Value> val, const AccessorInfo &info);
    static void SetOnerror(Local<String> prop, Local<Value> val, const AccessorInfo &info);
    inline cairo_surface_t *surface(){ return _surface; } 
    cairo_status_t loadSurface();
    void error(Local<Value>);
    void loaded();
    void load();
    Image();
  
  private:
    cairo_surface_t *_surface;
    ~Image();
};

#endif