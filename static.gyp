{
    'includes': [ 'static/locations.gyp'],
    'variables':{
        'ensure_deps%': '<!(./static/ensure_deps.sh)',
    },
    'targets': [
    {
      'target_name': 'canvas',
      'include_dirs': [
            "<!(node -e \"require('nan')\")",
            './deps/<(freetype_root)/include',
            './deps/<(jpeg_root)',
            './static/custom-include/jpeg/',
            './deps/<(cairo_root)',
            './deps/<(cairo_root)cairo',
            './static/custom-include/cairo/',
            './deps/<(gif_root)/lib/',
            './deps/<(libpng_root)/',
            './deps/<(pixman_root)pixman/',
            './deps/<(zlib_root)/'
      ],
      'dependencies': [
            'static/cairo.gyp:cairo',
            'static/libpng.gyp:png',
            'static/jpeg.gyp:libjpeg',
            'static/gif.gyp:gif',
      ],
      'defines': [ 'HAVE_FREETYPE' ,'HAVE_JPEG' ,'HAVE_GIF' ],
#      'libraries': ['-static', '-Wl,--no-undefined'],
      'libraries': ['-static'],
      'sources': [
        'src/backend/ImageBackend.cc',
        'src/backend/FBDevBackend.cc',
        'src/Canvas.cc',
        'src/CanvasGradient.cc',
        'src/CanvasPattern.cc',
        'src/CanvasRenderingContext2d.cc',
        'src/color.cc',
        'src/Image.cc',
        'src/ImageData.cc',
        'src/init.cc',
        'src/PixelArray.cc',
        'src/FontFace.cc',
      ],
      'cflags!': [ '-fno-exceptions' ],
      'cflags_cc!': [ '-fno-exceptions' ],
    }
  ]
}
