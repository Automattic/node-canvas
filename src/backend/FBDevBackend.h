#ifndef __FBDEV_BACKEND_H__
#define __FBDEV_BACKEND_H__
 #include <exception>
#include <string>
 #include <linux/fb.h>
 #include <v8.h>
 #include "Backend.h"
 using namespace std;


const string DEFAULT_DEVICE = "/dev/fb0";


class FBDevBackend : public Backend
{
  private:
    int fb_fd;
    struct fb_fix_screeninfo fb_finfo;
    unsigned char* fb_data;
    unsigned char* front_buffer;
    unsigned char* back_buffer;
    bool useDoubleBuffer;
    bool useInMemoryBackBuffer;
    bool useCopyBackBuffer;

    ~FBDevBackend();

    void initFbDev(string deviceName, struct fb_var_screeninfo* fb_vinfo);
    void FbDevIoctlHelper(unsigned long request, void* data, string errmsg);

    cairo_surface_t* createSurface();
    void             destroySurface();

    void setWidth(int width);
    void setHeight(int height);
    void setFormat(cairo_format_t format);

    void copyBackBuffer(struct fb_var_screeninfo* fb_vinfo);
    void flipBuffers(struct fb_var_screeninfo* fb_vinfo);
    void swapBuffers();
    void waitVSync();

  public:
    FBDevBackend(int width, int height, string deviceName = DEFAULT_DEVICE,
      bool useDoubleBuffer = false);
    FBDevBackend(string deviceName, bool useDoubleBuffer = false);
     static Nan::Persistent<v8::FunctionTemplate> constructor;
    static void Initialize(v8::Handle<v8::Object> target);
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
