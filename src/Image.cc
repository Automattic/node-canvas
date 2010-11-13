
//
// Image.cc
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#include "Canvas.h"
#include "Image.h"
#include <stdlib.h>
#include <string.h>

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
  proto->SetAccessor(String::NewSymbol("complete"), GetComplete);
  proto->SetAccessor(String::NewSymbol("width"), GetWidth);
  proto->SetAccessor(String::NewSymbol("height"), GetHeight);
  proto->SetAccessor(String::NewSymbol("onload"), GetOnload, SetOnload);
  proto->SetAccessor(String::NewSymbol("onerror"), GetOnerror, SetOnerror);
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
 * Get complete boolean.
 */

Handle<Value>
Image::GetComplete(Local<String>, const AccessorInfo &info) {
  Image *img = ObjectWrap::Unwrap<Image>(info.This());
  return Boolean::New(Image::COMPLETE == img->state);
}

/*
 * Get width.
 */

Handle<Value>
Image::GetWidth(Local<String>, const AccessorInfo &info) {
  Image *img = ObjectWrap::Unwrap<Image>(info.This());
  return Number::New(img->width);
}

/*
 * Get height.
 */

Handle<Value>
Image::GetHeight(Local<String>, const AccessorInfo &info) {
  Image *img = ObjectWrap::Unwrap<Image>(info.This());
  return Number::New(img->height);
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
    img->filename = strdup(*src);
    img->load();
  }
}

/*
 * Get onload callback.
 */

Handle<Value>
Image::GetOnload(Local<String>, const AccessorInfo &info) {
  Image *img = ObjectWrap::Unwrap<Image>(info.This());
  return img->onload;
}

/*
 * Set onload callback.
 */

void
Image::SetOnload(Local<String>, Local<Value> val, const AccessorInfo &info) {
  if (val->IsFunction()) {
    Image *img = ObjectWrap::Unwrap<Image>(info.This());
    img->onload = Persistent<Function>::New(Handle<Function>::Cast(val));
  }
}

/*
 * Get onerror callback.
 */

Handle<Value>
Image::GetOnerror(Local<String>, const AccessorInfo &info) {
  Image *img = ObjectWrap::Unwrap<Image>(info.This());
  return img->onerror;
}

/*
 * Set onerror callback.
 */

void
Image::SetOnerror(Local<String>, Local<Value> val, const AccessorInfo &info) {
  if (val->IsFunction()) {
    Image *img = ObjectWrap::Unwrap<Image>(info.This());
    img->onerror = Persistent<Function>::New(Handle<Function>::Cast(val));
  }
}

/*
 * Initialize a new Image.
 */

Image::Image() {
  filename = (char *) "";
  _surface = NULL;
  width = height = 0;
  state = DEFAULT;
}

/*
 * Destroy image and associated surface.
 */

Image::~Image() {
  if (_surface) cairo_surface_destroy(_surface);
  if (filename) free(filename);
}

/*
 * Load callback.
 */

static int
EIO_Load(eio_req *req) {
  Image *img = (Image *) req->data;
  req->result = img->loadSurface();
  return 0;
}

/*
 * After load callback.
 */

static int
EIO_AfterLoad(eio_req *req) {
  HandleScope scope;
  Image *img = (Image *) req->data;

  if (req->result) {
    img->error(Canvas::Error((cairo_status_t) req->result));
  } else {
    img->loaded();
  }

  ev_unref(EV_DEFAULT_UC);
  return 0;
}

/*
 * Initiate image loading.
 */

void
Image::load() {
  if (LOADING != state) {
    Ref();
    state = LOADING;
    eio_custom(EIO_Load, EIO_PRI_DEFAULT, EIO_AfterLoad, this);
    ev_ref(EV_DEFAULT_UC);
  }
}

/*
 * Invoke onload (when assigned) and assign dimensions.
 */

void
Image::loaded() {
  HandleScope scope;
  state = COMPLETE;

  if (!onload.IsEmpty()) {
    TryCatch try_catch;
    onload->Call(Context::GetCurrent()->Global(), 0, NULL);
    onload.Dispose();
    if (try_catch.HasCaught()) {
      error(try_catch.Exception());
    }
  }

  Unref();
}

/*
 * Invoke onerror (when assigned) with the given err.
 */

void
Image::error(Local<Value> err) {
  HandleScope scope;
  // TODO: handle exception in onerror segfault
  if (!onerror.IsEmpty()) {
    Local<Value> argv[1] = { err };
    onerror->Call(Context::GetCurrent()->Global(), 1, argv);
  }
}

/*
 * Load cairo surface from the image src.
 * 
 * TODO: support more formats
 */

cairo_status_t
Image::loadSurface() {
  _surface = cairo_image_surface_create_from_png(filename);
  width = cairo_image_surface_get_width(_surface);
  height = cairo_image_surface_get_height(_surface);
  return cairo_surface_status(_surface);
}