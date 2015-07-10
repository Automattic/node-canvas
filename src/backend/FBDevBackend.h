#ifndef __FBDEV_BACKEND_H__
#define __FBDEV_BACKEND_H__

#include <exception>
#include <string>

#include <linux/fb.h>

#include "Backend.h"


using namespace std;

class FBDevBackend : public Backend
{
  private:
    int fb_fd;
    struct fb_fix_screeninfo fb_finfo;
    unsigned char* fb_data;

    ~FBDevBackend();

    void FbDevIoctlHelper(unsigned long request, void* data, string errmsg);

    cairo_surface_t* createSurface();

    void setWidth(int width);
    void setHeight(int height);

  public:
    FBDevBackend(string deviceName);

    static Persistent<FunctionTemplate> constructor;
    static void Initialize(Handle<Object> target);
    static NAN_METHOD(New);
};


class FBDevBackendException : public std::exception
{
  private:
    string err_msg;

  public:
    FBDevBackendException(const string msg) : err_msg(msg) {};
    ~FBDevBackendException() throw() {};

    const char *what() const throw() { return this->err_msg.c_str(); };
};

#endif
