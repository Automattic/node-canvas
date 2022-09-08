// Copyright (c) 2010 LearnBoost <tj@learnboost.com>

#include "CanvasPattern.h"

#include "Util.h"
#include "Canvas.h"
#include "Image.h"

using namespace v8;

const cairo_user_data_key_t *pattern_repeat_key;
const char *Pattern::ctor_name = "CanvasPattern";
const char *Pattern::dom_matrix_name = "CanvasPattern_DOMMatrix";

/*
 * Initialize CanvasPattern.
 */

void
Pattern::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target, AddonData *addon_data) {
  Nan::HandleScope scope;

  Local<External> data_holder = Nan::New<External>(addon_data);
  // Constructor
  Local<FunctionTemplate> ctor = Nan::New<FunctionTemplate>(Pattern::New, data_holder);
  ctor->InstanceTemplate()->SetInternalFieldCount(2);
  ctor->SetClassName(Nan::New(ctor_name).ToLocalChecked());
  addon_data->pattern_ctor_tpl.Reset(ctor);
  Nan::SetPrototypeMethod(ctor, "setTransform", SetTransform);

  // Prototype
  Local<Context> ctx = Nan::GetCurrentContext();
  Nan::Set(target, Nan::New(ctor_name).ToLocalChecked(), ctor->GetFunction(ctx).ToLocalChecked());
  Nan::Set(target, Nan::New("CanvasPatternInit").ToLocalChecked(), Nan::New<Function>(SaveExternalModules, data_holder));
}

/*
 * Save some external modules as private references.
 */

NAN_METHOD(Pattern::SaveExternalModules) {
  AddonData *addon_data = reinterpret_cast<AddonData*>(info.Data().As<External>()->Value());

  addon_data->pattern_dom_matrix.Reset(Nan::To<Function>(info[0]).ToLocalChecked());
}

/*
 * Initialize a new CanvasPattern.
 */

NAN_METHOD(Pattern::New) {
  if (!info.IsConstructCall()) {
    return Nan::ThrowTypeError("Class constructors cannot be invoked without 'new'");
  }

  cairo_surface_t *surface;
  AddonData *addon_data = reinterpret_cast<AddonData*>(info.Data().As<External>()->Value());

  Local<Object> obj = Nan::To<Object>(info[0]).ToLocalChecked();
  Local<FunctionTemplate> canvas_ctor_tpl = Nan::New(addon_data->canvas_ctor_tpl);
  Local<FunctionTemplate> image_ctor_tpl = Nan::New(addon_data->image_ctor_tpl);

  // Image
  if (image_ctor_tpl->HasInstance(obj)) {
    Image *img = Nan::ObjectWrap::Unwrap<Image>(obj);
    if (!img->isComplete()) {
      return Nan::ThrowError("Image given has not completed loading");
    }
    surface = img->surface();

  // Canvas
  } else if (canvas_ctor_tpl->HasInstance(obj)) {
    Canvas *canvas = Nan::ObjectWrap::Unwrap<Canvas>(obj);
    surface = canvas->surface();
  // Invalid
  } else {
    return Nan::ThrowTypeError("Image or Canvas expected");
  }
  repeat_type_t repeat = REPEAT;
  if (0 == strcmp("no-repeat", *Nan::Utf8String(info[1]))) {
    repeat = NO_REPEAT;
  } else if (0 == strcmp("repeat-x", *Nan::Utf8String(info[1]))) {
    repeat = REPEAT_X;
  } else if (0 == strcmp("repeat-y", *Nan::Utf8String(info[1]))) {
    repeat = REPEAT_Y;
  }
  Pattern *pattern = new Pattern(surface, repeat);
  pattern->Wrap(info.This());
  info.This()->SetInternalField(1, info.Data());
  info.GetReturnValue().Set(info.This());
}

/*
 * Set the pattern-space to user-space transform.
 */
NAN_METHOD(Pattern::SetTransform) {
  AddonData *addon_data = get_data_from_if1(info.This());
  Pattern *pattern = Nan::ObjectWrap::Unwrap<Pattern>(info.This());
  Local<Context> ctx = Nan::GetCurrentContext();
  Local<Object> mat = Nan::To<Object>(info[0]).ToLocalChecked();

#if NODE_MAJOR_VERSION >= 8
  Local<Function> _DOMMatrix = Nan::New(addon_data->context2d_dom_matrix);
  if (!mat->InstanceOf(ctx, _DOMMatrix).ToChecked()) {
    return Nan::ThrowTypeError("Expected DOMMatrix");
  }
#endif

  cairo_matrix_t matrix;
  cairo_matrix_init(&matrix,
    Nan::To<double>(Nan::Get(mat, Nan::New("a").ToLocalChecked()).ToLocalChecked()).FromMaybe(1),
    Nan::To<double>(Nan::Get(mat, Nan::New("b").ToLocalChecked()).ToLocalChecked()).FromMaybe(0),
    Nan::To<double>(Nan::Get(mat, Nan::New("c").ToLocalChecked()).ToLocalChecked()).FromMaybe(0),
    Nan::To<double>(Nan::Get(mat, Nan::New("d").ToLocalChecked()).ToLocalChecked()).FromMaybe(1),
    Nan::To<double>(Nan::Get(mat, Nan::New("e").ToLocalChecked()).ToLocalChecked()).FromMaybe(0),
    Nan::To<double>(Nan::Get(mat, Nan::New("f").ToLocalChecked()).ToLocalChecked()).FromMaybe(0)
  );

  cairo_matrix_invert(&matrix);
  cairo_pattern_set_matrix(pattern->_pattern, &matrix);
}


/*
 * Initialize pattern.
 */

Pattern::Pattern(cairo_surface_t *surface, repeat_type_t repeat) {
  _pattern = cairo_pattern_create_for_surface(surface);
  _repeat = repeat;
  cairo_pattern_set_user_data(_pattern, pattern_repeat_key, &_repeat, NULL);
}

repeat_type_t Pattern::get_repeat_type_for_cairo_pattern(cairo_pattern_t *pattern) {
  void *ud = cairo_pattern_get_user_data(pattern, pattern_repeat_key);
  return *reinterpret_cast<repeat_type_t*>(ud);
}

/*
 * Destroy the pattern.
 */

Pattern::~Pattern() {
  cairo_pattern_destroy(_pattern);
}
