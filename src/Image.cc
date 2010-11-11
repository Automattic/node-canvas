
//
// Image.cc
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#include "canvas.h"
#include "image.h"

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
 * Initialize a new Image.
 */

Image::Image() {
  _surface = NULL;
}

/*
 * Destroy image and associated surface.
 */

Image::~Image() {
  cairo_surface_destroy(_surface);
}