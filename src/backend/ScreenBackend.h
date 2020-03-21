#pragma once

#include "Backend.h"


class Canvas;

class ScreenBackend : public Backend
{
  private:
    virtual void swapBuffers(){};

    static NAN_METHOD(swapBuffers);

  protected:
    static void Initialize(v8::Local<v8::FunctionTemplate> ctor);
};
