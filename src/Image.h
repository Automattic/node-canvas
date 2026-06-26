// Copyright (c) 2010 LearnBoost <tj@learnboost.com>

#pragma once

#include <cairo.h>
#include "CanvasError.h"
#include <functional>
#include <napi.h>
#include <stdint.h> // node < 7 uses libstdc++ on macOS which lacks complete c++11
#include <optional>

#include <jpeglib.h>
#include <jerror.h>

#include <gif_lib.h>
#define GIF_CLOSE_FILE(gif) DGifCloseFile(gif, NULL)

#include <lunasvg.h>

using JPEGDecodeL = std::function<uint32_t (uint8_t* const src)>;

class ImageSurface {
  public:
    // Only contains a value when the ImageSurface backs a js Image. Empty for
    // ImageSurfaces supporting lunasvg (to render images embedded in SVGs).
    std::optional<Napi::Env> env;
    char *filename;
    int width, height;
    int naturalWidth, naturalHeight;
    ImageSurface(std::optional<Napi::Env> env);
    inline uint8_t *data(){ return cairo_image_surface_get_data(_surface); }
    inline int stride(){ return cairo_image_surface_get_stride(_surface); }
    static int isPNG(uint8_t *data);
    static int isJPEG(uint8_t *data);
    static int isGIF(uint8_t *data);
    static int isSVG(uint8_t *data, unsigned len);
    static int isBMP(uint8_t *data, unsigned len);
    static cairo_status_t readPNG(void *closure, unsigned char *data, unsigned len);
    cairo_surface_t *surface();
    cairo_status_t loadSurface();
    cairo_status_t loadFromBuffer(uint8_t *buf, unsigned len);
    cairo_status_t loadPNGFromBuffer(uint8_t *buf);
    cairo_status_t loadPNG();
    void clearData();
    cairo_surface_t* transferSurface();
    cairo_status_t loadSVGFromBuffer(uint8_t *buf, unsigned len);
    cairo_status_t loadSVG(FILE *stream);
    cairo_status_t renderSVGToSurface();
    cairo_status_t loadGIFFromBuffer(uint8_t *buf, unsigned len);
    cairo_status_t loadGIF(FILE *stream);
    enum Orientation {
        NORMAL,
        MIRROR_HORIZ,
        MIRROR_VERT,
        ROTATE_180,
        ROTATE_90_CW,
        ROTATE_270_CW,
        MIRROR_HORIZ_AND_ROTATE_90_CW,
        MIRROR_HORIZ_AND_ROTATE_270_CW
    };
    cairo_status_t loadJPEGFromBuffer(uint8_t *buf, unsigned len);
    cairo_status_t loadJPEG(FILE *stream);
    void jpegToARGB(jpeg_decompress_struct* args, uint8_t* data, uint8_t* src, JPEGDecodeL decode);
    cairo_status_t decodeJPEGIntoSurface(jpeg_decompress_struct *info, Orientation orientation);
    cairo_status_t decodeJPEGBufferIntoMimeSurface(uint8_t *buf, unsigned len);
    cairo_status_t assignDataAsMime(uint8_t *data, int len, const char *mime_type);

    class Reader {
    public:
      virtual bool hasBytes(unsigned n) const = 0;
      virtual uint8_t getNext() = 0;
      virtual void skipBytes(unsigned n) = 0;
    };
    Orientation getExifOrientation(Reader& jpeg);
    void updateDimensionsForOrientation(Orientation orientation);
    void rotatePixels(uint8_t* pixels, int width, int height, int channels, Orientation orientation);
    cairo_status_t loadBMPFromBuffer(uint8_t *buf, unsigned len);
    cairo_status_t loadBMP(FILE *stream);
    CanvasError errorInfo;
    void loaded();
    cairo_status_t load(std::string& filename);
    ~ImageSurface();

    enum {
        DEFAULT
      , LOADING
      , COMPLETE
    } state;

    enum data_mode_t {
        DATA_IMAGE = 1
      , DATA_MIME = 2
    } data_mode;

    typedef enum {
        UNKNOWN
      , GIF
      , JPEG
      , PNG
      , SVG
    } type;

    static type extension(const char *filename);

  private:
    cairo_surface_t *_surface;
    uint8_t *_data = nullptr;
    int _data_len;
    std::unique_ptr<lunasvg::Document> svgdoc;
    int _svg_last_width;
    int _svg_last_height;
};

class Image : public Napi::ObjectWrap<Image> {
  public:
    Napi::Env env;
    static void Initialize(Napi::Env& env, Napi::Object& target);
    Image(const Napi::CallbackInfo& info);
    Napi::Value GetComplete(const Napi::CallbackInfo& info);
    Napi::Value GetWidth(const Napi::CallbackInfo& info);
    Napi::Value GetHeight(const Napi::CallbackInfo& info);
    Napi::Value GetNaturalWidth(const Napi::CallbackInfo& info);
    Napi::Value GetNaturalHeight(const Napi::CallbackInfo& info);
    Napi::Value GetDataMode(const Napi::CallbackInfo& info);
    void SetDataMode(const Napi::CallbackInfo& info, const Napi::Value& value);
    void SetWidth(const Napi::CallbackInfo& info, const Napi::Value& value);
    void SetHeight(const Napi::CallbackInfo& info, const Napi::Value& value);
    static Napi::Value GetSource(const Napi::CallbackInfo& info);
    static void SetSource(const Napi::CallbackInfo& info);
    inline int isComplete(){ return ImageSurface::COMPLETE == surface.state; }
    ImageSurface surface;
};
