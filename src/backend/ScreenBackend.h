#pragma once

#include "Backend.h"


using namespace v8;


class ScreenBackend : public Backend
{
  friend class WaitVSync;

  private:
    virtual void swapBuffers(){};
    virtual void waitVSync(){};

    static NAN_METHOD(swapBuffers);
    static NAN_METHOD(waitVSync);

  protected:
    static void Initialize(Local<FunctionTemplate> ctor);
};
