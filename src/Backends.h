#ifndef __NODE_BACKENDS_H__
#define __NODE_BACKENDS_H__

#include <v8.h>
#include <node.h>
#include <node_object_wrap.h>
#include <node_version.h>
#include <nan.h>

#include "backend/Backend.h"

using namespace v8;
using namespace node;

using v8::FunctionTemplate;
using v8::Handle;
using v8::Object;
using v8::String;

class Backends : public ObjectWrap {
  public:
    static void Initialize(Handle<Object> target);
};

#endif
