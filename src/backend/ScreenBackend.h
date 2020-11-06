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
    ScreenBackend(std::string name, int width = 0, int height = 0);

    static void Initialize(Local<FunctionTemplate> ctor);
};
