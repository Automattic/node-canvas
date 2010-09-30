
//
// gradient.cc
//
// Copyright (c) 2010 LearnBoost <tj@learnboost.com>
//

#include "canvas.h"
#include "gradient.h"

void
Gradient::Initialize(Handle<Object> target) {
  HandleScope scope;
  Local<FunctionTemplate> t = FunctionTemplate::New(Gradient::New);
  t->InstanceTemplate()->SetInternalFieldCount(1);
  t->SetClassName(String::NewSymbol("CanvasGradient"));

  target->Set(String::NewSymbol("CanvasGradient"), t->GetFunction());
}

Handle<Value>
Gradient::New(const Arguments &args) {
  HandleScope scope;

  // Linear
  if (4 == args.Length()) {
    Gradient *grad = new Gradient(
        args[0]->NumberValue()
      , args[1]->NumberValue()
      , args[2]->NumberValue()
      , args[3]->NumberValue());
  }

  // Radial
  if (6 == args.Length()) {
    Gradient *grad = new Gradient(
        args[0]->NumberValue()
      , args[1]->NumberValue()
      , args[2]->NumberValue()
      , args[3]->NumberValue()
      , args[4]->NumberValue()
      , args[5]->NumberValue());
    grad->Wrap(args.This());
    return args.This();
  }
  
  return ThrowException(Exception::TypeError(String::New("invalid arguments")));
}