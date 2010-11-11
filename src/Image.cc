
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
  proto->SetAccessor(String::NewSymbol("onload"), GetOnload, SetOnload);
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
  if (img->filename) {
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
    img->filename = *src;
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

static int
EIO_Load(eio_req *req) {
  Image *img = (Image *) req->data;
  req->result = img->loadSurface();
  return 0;
}

static int
EIO_AfterLoad(eio_req *req) {
  Image *img = (Image *) req->data;
  // TODO: handle CAIRO_STATUS_{NO_MEMORY,FILE_NOT_FOUND,READ_ERROR}
  img->loaded();
  ev_unref(EV_DEFAULT_UC);
  return 0;
}

void
Image::load() {
  Ref();
  eio_custom(EIO_Load, EIO_PRI_DEFAULT, EIO_AfterLoad, this);
  ev_ref(EV_DEFAULT_UC);
}

void
Image::loaded() {
  if (!onload.IsEmpty()) {
    // TODO: TryCatch
    onload->Call(Context::GetCurrent()->Global(), 0, NULL);
    onload.Dispose();
  }
  Unref();
}

cairo_status_t
Image::loadSurface() {
  _surface = cairo_image_surface_create_from_png(filename);
  return cairo_surface_status(_surface);
}