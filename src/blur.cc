
#include <math.h>
#include <memory.h>
#include <stdint.h>
#include <stdlib.h>
#include <cairo.h>
#include "canvas.h"

void
Canvas::blur(cairo_surface_t *surface, int radius) {
  // Steve Hanov, 2009
  // Released into the public domain.
  
  // get width, height
  int width = cairo_image_surface_get_width( surface );
  int height = cairo_image_surface_get_height( surface );
  unsigned char* dst = (unsigned char*)malloc(width*height*4);
  unsigned* precalc = 
      (unsigned*)malloc(width*height*sizeof(unsigned));
  unsigned char* src = cairo_image_surface_get_data( surface );
  double mul=1.f/((radius*2)*(radius*2));
  int channel;
  
  // The number of times to perform the averaging. According to wikipedia,
  // three iterations is good enough to pass for a gaussian.
  const int MAX_ITERATIONS = 3; 
  int iteration;

  memcpy( dst, src, width*height*4 );

  for ( iteration = 0; iteration < MAX_ITERATIONS; iteration++ ) {
      for( channel = 0; channel < 4; channel++ ) {
          int x,y;

          // precomputation step.
          unsigned char* pix = src;
          unsigned* pre = precalc;

          pix += channel;
          for (y=0;y<height;y++) {
              for (x=0;x<width;x++) {
                  int tot=pix[0];
                  if (x>0) tot+=pre[-1];
                  if (y>0) tot+=pre[-width];
                  if (x>0 && y>0) tot-=pre[-width-1];
                  *pre++=tot;
                  pix += 4;
              }
          }

          // blur step.
          pix = dst + (int)radius * width * 4 + (int)radius * 4 + channel;
          for (y=radius;y<height-radius;y++) {
              for (x=radius;x<width-radius;x++) {
                  int l = x < radius ? 0 : x - radius;
                  int t = y < radius ? 0 : y - radius;
                  int r = x + radius >= width ? width - 1 : x + radius;
                  int b = y + radius >= height ? height - 1 : y + radius;
                  int tot = precalc[r+b*width] + precalc[l+t*width] - 
                      precalc[l+b*width] - precalc[r+t*width];
                  *pix=(unsigned char)(tot*mul);
                  pix += 4;
              }
              pix += (int)radius * 2 * 4;
          }
      }
      memcpy( src, dst, width*height*4 );
  }

  free( dst );
  free( precalc );
}