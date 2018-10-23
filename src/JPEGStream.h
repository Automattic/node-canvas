
//
// JPEGStream.h
//

#ifndef __NODE_JPEG_STREAM_H__
#define __NODE_JPEG_STREAM_H__

#include "closure.h"
#include "Canvas.h"
#include <jpeglib.h>
#include <jerror.h>

#if JPEG_LIB_VERSION < 80 && !defined(MEM_SRCDST_SUPPORTED)
// jpeg_mem_dest:
#error("libjpeg-turbo v1.3 or later, or libjpeg v8 or later is required")
#endif

/*
 * Expanded data destination object for closure output,
 * inspired by IJG's jdatadst.c
 */

typedef struct {
  struct jpeg_destination_mgr pub;
  JpegClosure* closure;
  JOCTET *buffer;
  int bufsize;
} closure_destination_mgr;

void
init_closure_destination(j_compress_ptr cinfo){
  // we really don't have to do anything here
}

boolean
empty_closure_output_buffer(j_compress_ptr cinfo){
  Nan::HandleScope scope;
  Nan::AsyncResource async("canvas:empty_closure_output_buffer");
  closure_destination_mgr *dest = (closure_destination_mgr *) cinfo->dest;

  Local<Object> buf = Nan::NewBuffer((char *)dest->buffer, dest->bufsize).ToLocalChecked();

  // emit "data"
  Local<Value> argv[2] = {
      Nan::Null()
    , buf
  };
  async.runInAsyncScope(Nan::GetCurrentContext()->Global(), dest->closure->fn, sizeof argv / sizeof *argv, argv);

  dest->buffer = (JOCTET *)malloc(dest->bufsize);
  cinfo->dest->next_output_byte = dest->buffer;
  cinfo->dest->free_in_buffer = dest->bufsize;
  return true;
}

void
term_closure_destination(j_compress_ptr cinfo){
  Nan::HandleScope scope;
  Nan::AsyncResource async("canvas:term_closure_destination");
  closure_destination_mgr *dest = (closure_destination_mgr *) cinfo->dest;

  /* emit remaining data */
  Local<Object> buf = Nan::NewBuffer((char *)dest->buffer, dest->bufsize - dest->pub.free_in_buffer).ToLocalChecked();

  Local<Value> data_argv[2] = {
      Nan::Null()
    , buf
  };

  async.runInAsyncScope(Nan::GetCurrentContext()->Global(), dest->closure->fn, sizeof data_argv / sizeof *data_argv, data_argv);

  // emit "end"
  Local<Value> end_argv[2] = {
      Nan::Null()
    , Nan::Null()
  };

  async.runInAsyncScope(Nan::GetCurrentContext()->Global(), dest->closure->fn, sizeof end_argv / sizeof *end_argv, end_argv);
}

void
jpeg_closure_dest(j_compress_ptr cinfo, JpegClosure* closure, int bufsize){
  closure_destination_mgr * dest;

  /* The destination object is made permanent so that multiple JPEG images
   * can be written to the same buffer without re-executing jpeg_mem_dest.
   */
  if (cinfo->dest == NULL) {  /* first time for this JPEG object? */
    cinfo->dest = (struct jpeg_destination_mgr *)
      (*cinfo->mem->alloc_small) ((j_common_ptr) cinfo, JPOOL_PERMANENT,
         sizeof(closure_destination_mgr));
  }

  dest = (closure_destination_mgr *) cinfo->dest;

  cinfo->dest->init_destination = &init_closure_destination;
  cinfo->dest->empty_output_buffer = &empty_closure_output_buffer;
  cinfo->dest->term_destination = &term_closure_destination;

  dest->closure = closure;
  dest->bufsize = bufsize;
  dest->buffer = (JOCTET *)malloc(bufsize);

  cinfo->dest->next_output_byte = dest->buffer;
  cinfo->dest->free_in_buffer = dest->bufsize;
}

void encode_jpeg(jpeg_compress_struct cinfo, cairo_surface_t *surface, int quality, bool progressive, int chromaHSampFactor, int chromaVSampFactor) {
  int w = cairo_image_surface_get_width(surface);
  int h = cairo_image_surface_get_height(surface);

  cinfo.in_color_space = JCS_RGB;
  cinfo.input_components = 3;
  cinfo.image_width = w;
  cinfo.image_height = h;
  jpeg_set_defaults(&cinfo);
  if (progressive)
    jpeg_simple_progression(&cinfo);
  jpeg_set_quality(&cinfo, quality, (quality < 25) ? 0 : 1);
  cinfo.comp_info[0].h_samp_factor = chromaHSampFactor;
  cinfo.comp_info[0].v_samp_factor = chromaVSampFactor;

  JSAMPROW slr;
  jpeg_start_compress(&cinfo, TRUE);
  unsigned char *dst;
  unsigned int *src = (unsigned int *)cairo_image_surface_get_data(surface);
  int sl = 0;
  dst = (unsigned char *)malloc(w * 3);
  while (sl < h) {
    unsigned char *dp = dst;
    int x = 0;
    while (x < w) {
      dp[0] = (*src >> 16) & 255;
      dp[1] = (*src >> 8) & 255;
      dp[2] = *src & 255;
      src++;
      dp += 3;
      x++;
    }
    slr = dst;
    jpeg_write_scanlines(&cinfo, &slr, 1);
    sl++;
  }
  free(dst);
  jpeg_finish_compress(&cinfo);
  jpeg_destroy_compress(&cinfo);
}

void
write_to_jpeg_stream(cairo_surface_t *surface, int bufsize, JpegClosure* closure) {
  struct jpeg_compress_struct cinfo;
  struct jpeg_error_mgr jerr;
  cinfo.err = jpeg_std_error(&jerr);
  jpeg_create_compress(&cinfo);
  jpeg_closure_dest(&cinfo, closure, bufsize);
  encode_jpeg(
    cinfo,
    surface,
    closure->quality,
    closure->progressive,
    closure->chromaSubsampling,
    closure->chromaSubsampling);
}

void
write_to_jpeg_buffer(cairo_surface_t* surface, JpegClosure* closure, unsigned char** outbuff, uint32_t* outsize) {
  struct jpeg_compress_struct cinfo;
  struct jpeg_error_mgr jerr;
  cinfo.err = jpeg_std_error(&jerr);
  jpeg_create_compress(&cinfo);
  unsigned long ulOutsize;
  jpeg_mem_dest(&cinfo, outbuff, &ulOutsize);
  encode_jpeg(
    cinfo,
    surface,
    closure->quality,
    closure->progressive,
    closure->chromaSubsampling,
    closure->chromaSubsampling);
  *outsize = static_cast<uint32_t>(ulOutsize);
}

#endif
