
//
// Image.cc
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#include "Canvas.h"
#include "Image.h"

/*
 * Initialize Image.
 */

void
Image::Initialize(Handle<Object> target) {
  HandleScope scope;
  Local<FunctionTemplate> t = FunctionTemplate::New(Image::New);
  t->InstanceTemplate()->SetInternalFieldCount(1);
  t->SetClassName(String::NewSymbol("Image"));

  Local<ObjectTemplate> proto = t->PrototypeTemplate();
  NODE_SET_PROTOTYPE_METHOD(t, "inspect", Inspect);
  proto->SetAccessor(String::NewSymbol("src"), GetSrc, SetSrc);
  target->Set(String::NewSymbol("Image"), t->GetFunction());
}

/*
 * Initialize a new Image.
 */

Handle<Value>
Image::New(const Arguments &args) {
  HandleScope scope;
  Image *img = new Image;
  img->Wrap(args.This());
  return args.This();
}

/*
 * Custom inspect.
 */

Handle<Value>
Image::Inspect(const Arguments &args) {
  HandleScope scope;
  Image *img = ObjectWrap::Unwrap<Image>(args.This());
  Local<String> str = String::New("[Image");
  if (img->loaded()) {
    str = String::Concat(str, String::New(" "));
    str = String::Concat(str, String::New(img->filename));
  }
  str = String::Concat(str, String::New("]"));
  return scope.Close(str);
}

/*
 * Get src path.
 */

Handle<Value>
Image::GetSrc(Local<String>, const AccessorInfo &info) {
  Image *img = ObjectWrap::Unwrap<Image>(info.This());
  return String::New(img->filename);
}

/*
 * Set src path.
 */

void
Image::SetSrc(Local<String>, Local<Value> val, const AccessorInfo &info) {
  if (val->IsString()) {
    String::AsciiValue src(val);
    Image *img = ObjectWrap::Unwrap<Image>(info.This());
    if (info.This()->Get(String::New("onload"))->IsFunction())
      printf("function\n");
    img->filename = *src;
  }
}

/*
 * Initialize a new Image.
 */

Image::Image() {
  filename = NULL;
  _surface = NULL;
}

/*
 * Destroy image and associated surface.
 */

Image::~Image() {
  cairo_surface_destroy(_surface);
}