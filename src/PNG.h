#ifndef _CANVAS_PNG_H
#define _CANVAS_PNG_H
#include <png.h>
#include <pngconf.h>
#include <cairo.h>
#include <stdlib.h>
#include "closure.h"

#if defined(__GNUC__) && (__GNUC__ > 2) && defined(__OPTIMIZE__)
#define likely(expr) (__builtin_expect (!!(expr), 1))
#define unlikely(expr) (__builtin_expect (!!(expr), 0))
#else
#define likely(expr) (expr)
#define unlikely(expr) (expr)
#endif



typedef png_size_t png_alloc_size_t;

/* Allocate memory.  For reasonable files, size should never exceed
 * 64K.  However, zlib may allocate more then 64K if you don't tell
 * it not to.  See zconf.h and png.h for more information.  zlib does
 * need to allocate exactly 64K, so whatever you call here must
 * have the ability to do that.
 *
 * This piece of code can be compiled to validate max 64K allocations
 * by setting MAXSEG_64K in zlib zconf.h *or* PNG_MAX_MALLOC_64K.
 */
typedef struct memory_information
{
   png_alloc_size_t                size;
   png_voidp                 pointer;
   struct memory_information *next;
} memory_information;
typedef memory_information *memory_infop;

static memory_infop pinformation = NULL;
static int current_allocation = 0;
static int maximum_allocation = 0;
static int total_allocation = 0;
static int num_allocations = 0;

png_voidp png_debug_malloc PNGARG((png_structp png_ptr,png_alloc_size_t size));
static void png_debug_free PNGARG((png_structp png_ptr, png_voidp ptr));

png_voidp png_debug_malloc(png_structp png_ptr, png_alloc_size_t size) {
   /* png_malloc has already tested for NULL; png_create_struct calls
    * png_debug_malloc directly, with png_ptr == NULL which is OK
    */

   if (size == 0)
      return (NULL);

   /* This calls the library allocator twice, once to get the requested
      buffer and once to get a new free list entry. */
   {
      /* Disable malloc_fn and free_fn */
      memory_infop pinfo;
      png_set_mem_fn(png_ptr, NULL, NULL, NULL);
      pinfo = (memory_infop)png_malloc(png_ptr,
         (sizeof *pinfo));
      pinfo->size = size;
      current_allocation += size;
      total_allocation += size;
      num_allocations ++;

      if (current_allocation > maximum_allocation) {
         maximum_allocation = current_allocation;
      }

      pinfo->pointer = png_malloc(png_ptr, size);
      /* Restore malloc_fn and free_fn */

      png_set_mem_fn(png_ptr,
          NULL, png_debug_malloc, png_debug_free);

      if (size != 0 && pinfo->pointer == NULL) {
         current_allocation -= size;
         total_allocation -= size;
         png_error(png_ptr,
           "out of memory in pngtest->png_debug_malloc");
      }

      pinfo->next = pinformation;
      pinformation = pinfo;
      /* Make sure the caller isn't assuming zeroed memory. */
      memset(pinfo->pointer, 0xdd, pinfo->size);

      printf("png_malloc %lu bytes at %p\n", (unsigned long)size,
         pinfo->pointer);

      return (png_voidp)(pinfo->pointer);
   }
}

/* Free a pointer.  It is removed from the list at the same time. */
static void png_debug_free(png_structp png_ptr, png_voidp ptr) {
   if (png_ptr == NULL)
      fprintf(stderr, "NULL pointer to png_debug_free.\n");

   if (ptr == 0)
   {
#if 0 /* This happens all the time. */
      fprintf(stderr, "WARNING: freeing NULL pointer\n");
#endif
      return;
   }

   /* Unlink the element from the list. */
   {
      memory_infop *ppinfo = &pinformation;

      for (;;)
      {
         memory_infop pinfo = *ppinfo;

         if (pinfo->pointer == ptr)
         {
            *ppinfo = pinfo->next;
            current_allocation -= pinfo->size;
            if (current_allocation < 0)
               fprintf(stderr, "Duplicate free of memory\n");
            /* We must free the list element too, but first kill
               the memory that is to be freed. */
            memset(ptr, 0x55, pinfo->size);
            png_free_default(png_ptr, pinfo);
            pinfo = NULL;
            break;
         }

         if (pinfo->next == NULL)
         {
            fprintf(stderr, "Pointer %p not found\n", ptr);
            break;
         }

         ppinfo = &pinfo->next;
      }
   }

   /* Finally free the data. */
   printf("Freeing %p\n", ptr);

   png_free_default(png_ptr, ptr);
   ptr = NULL;
}

static void pngtest_flush(png_structp png_ptr) {
//    fprintf(stderr, "Pngtest_flush called");
    /* Do nothing; fflush() is said to be just a waste of energy. */
    (void) png_ptr;   /* Stifle compiler warning */
}

/* Converts native endian xRGB => RGBx bytes */
static void convert_data_to_bytes (png_structp png, png_row_infop row_info, png_bytep data) {
    unsigned int i;

    for (i = 0; i < row_info->rowbytes; i += 4) {
        uint8_t *b = &data[i];
        uint32_t pixel;

        memcpy(&pixel, b, sizeof (uint32_t));

        b[0] = (pixel & 0xff0000) >> 16;
        b[1] = (pixel & 0x00ff00) >>  8;
        b[2] = (pixel & 0x0000ff) >>  0;
        b[3] = 0;
    }
}

/* Unpremultiplies data and converts native endian ARGB => RGBA bytes */
static void unpremultiply_data(png_structp png, png_row_infop row_info, png_bytep data) {
    unsigned int i;

    for (i = 0; i < row_info->rowbytes; i += 4) {
        uint8_t *b = &data[i];
        uint32_t pixel;
        uint8_t  alpha;

        memcpy(&pixel, b, sizeof (uint32_t));
        alpha = (pixel & 0xff000000) >> 24;
        if (alpha == 0) {
            b[0] = b[1] = b[2] = b[3] = 0;
        } else {
            b[0] = (((pixel & 0xff0000) >> 16) * 255 + alpha / 2) / alpha;
            b[1] = (((pixel & 0x00ff00) >>  8) * 255 + alpha / 2) / alpha;
            b[2] = (((pixel & 0x0000ff) >>  0) * 255 + alpha / 2) / alpha;
            b[3] = alpha;
        }
    }
}

struct png_write_closure_t {
    cairo_write_func_t write_func;
    void *closure;
};

static cairo_status_t canvas_write_png(cairo_surface_t *surface, png_rw_ptr write_func, void *closure) {
    unsigned int i;
    cairo_status_t status = CAIRO_STATUS_SUCCESS;
    uint8_t *data;
    png_structp png;
    png_infop info;
//    png_infop end_info;
    png_bytep *volatile rows = NULL;
    png_color_16 white;
    int png_color_type;
    int bpc;
    unsigned int width = cairo_image_surface_get_width(surface);
    unsigned int height = cairo_image_surface_get_height(surface);

    data = cairo_image_surface_get_data(surface);
    if (data == NULL) {
        status = CAIRO_STATUS_SURFACE_TYPE_MISMATCH;
        return status;
    }
    cairo_surface_flush(surface);

    if (width == 0 || height == 0) {
        status = CAIRO_STATUS_WRITE_ERROR;
        return status;
    }

    rows = (png_bytep *) malloc(height * sizeof (png_byte*));
    if (unlikely(rows == NULL)) {
        status = CAIRO_STATUS_NO_MEMORY;
        return status;
    }

    for (i = 0; i < height; i++) {
	rows[i] = (png_byte *) data + i * cairo_image_surface_get_stride(surface);
    }

#ifdef PNG_USER_MEM_SUPPORTED
//    png = png_create_write_struct_2(PNG_LIBPNG_VER_STRING, NULL, NULL, NULL, NULL, png_debug_malloc, png_debug_free);
     png = png_create_write_struct_2(PNG_LIBPNG_VER_STRING, NULL, NULL, NULL, NULL, NULL, NULL);
#else
    png = png_create_write_struct(PNG_LIBPNG_VER_STRING, NULL, NULL, NULL);
#endif

    if (unlikely(png == NULL)) {
        status = CAIRO_STATUS_NO_MEMORY;
        free(rows);
        return status;
    }

    info = png_create_info_struct (png);
    if (unlikely(info == NULL)) {
        status = CAIRO_STATUS_NO_MEMORY;
        png_destroy_write_struct(&png, &info);
	free(rows);
        return status;

    }

#ifdef PNG_SETJMP_SUPPORTED
    if (setjmp (png_jmpbuf (png))) {
        png_destroy_write_struct(&png, &info);
        free(rows);
        return status;
    }
#endif

    png_set_write_fn(png, closure, write_func, pngtest_flush);
//    png_set_flush(png, 100);
//    png_set_compression_buffer_size(png, 1024*1024);
    png_set_compression_level(png, ((closure_t *) ((png_write_closure_t *) closure)->closure)->compression_level);

    switch (cairo_image_surface_get_format(surface)) {
    case CAIRO_FORMAT_ARGB32:
        bpc = 8;
        png_color_type = PNG_COLOR_TYPE_RGB_ALPHA;
        break;
    case CAIRO_FORMAT_RGB30:
        bpc = 10;
        png_color_type = PNG_COLOR_TYPE_RGB;
        break;
    case CAIRO_FORMAT_RGB24:
        bpc = 8;
        png_color_type = PNG_COLOR_TYPE_RGB;
        break;
    case CAIRO_FORMAT_A8:
        bpc = 8;
        png_color_type = PNG_COLOR_TYPE_GRAY;
        break;
    case CAIRO_FORMAT_A1:
        bpc = 1;
        png_color_type = PNG_COLOR_TYPE_GRAY;
#ifndef WORDS_BIGENDIAN
        png_set_packswap(png);
#endif
        break;
    case CAIRO_FORMAT_INVALID:
    case CAIRO_FORMAT_RGB16_565:
    default:
        status = CAIRO_STATUS_INVALID_FORMAT;
        png_destroy_write_struct(&png, &info);
        free(rows);
        return status;
    }

    png_set_IHDR(png, info, width, height, bpc, png_color_type, PNG_INTERLACE_NONE, PNG_COMPRESSION_TYPE_DEFAULT, PNG_FILTER_TYPE_DEFAULT);

    white.gray = (1 << bpc) - 1;
    white.red = white.blue = white.green = white.gray;
    png_set_bKGD(png, info, &white);

    /* We have to call png_write_info() before setting up the write
     * transformation, since it stores data internally in 'png'
     * that is needed for the write transformation functions to work.
     */
    png_write_info(png, info);
    if (png_color_type == PNG_COLOR_TYPE_RGB_ALPHA) {
        png_set_write_user_transform_fn(png, unpremultiply_data);
    } else if (png_color_type == PNG_COLOR_TYPE_RGB) {
        png_set_write_user_transform_fn(png, convert_data_to_bytes);
        png_set_filler(png, 0, PNG_FILLER_AFTER);
    }

    png_write_image(png, rows);
    png_write_end(png, info);

    png_destroy_write_struct(&png, &info);
    free(rows);
    return status;
}

static void stream_write_func(png_structp png, png_bytep data, png_size_t size) {
    cairo_status_t status;
    struct png_write_closure_t *png_closure;

    png_closure = (struct png_write_closure_t *) png_get_io_ptr(png);
    status = png_closure->write_func(png_closure->closure, data, size);
    if (unlikely(status)) {
        cairo_status_t *error = (cairo_status_t *) png_get_error_ptr(png);
        if (*error == CAIRO_STATUS_SUCCESS) {
            *error = status;
        }
        png_error(png, NULL);
    }
}

static cairo_status_t canvas_write_to_png_stream(cairo_surface_t *surface, cairo_write_func_t write_func, void *closure) {
    struct png_write_closure_t png_closure;

    if (cairo_surface_status(surface)) {
        return cairo_surface_status(surface);
    }

    png_closure.write_func = write_func;
    png_closure.closure = closure;

    return canvas_write_png(surface, stream_write_func, &png_closure);
}
#endif
