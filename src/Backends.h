#ifndef __NODE_BACKENDS_H__
#define __NODE_BACKENDS_H__

#include <nan.h>

#include "backend/Backend.h"


class Backends : public Nan::ObjectWrap {
  public:
    static void Initialize(v8::Handle<v8::Object> target);
};

#endif
