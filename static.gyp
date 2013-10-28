{
    'includes': [ 'deps/locations.gyp'],
    'variables':{
        'ensure_deps%': '<!(./deps/ensure_deps.sh)',
    },
    'targets': [
    {
      'target_name': 'canvas',
      'include_dirs': [
            "<!(node -p -e \"require('path').dirname(require.resolve('nan'))\")" ,
            './deps/<(freetype_root)/include',
            './deps/<(jpeg_root)',
           #'./deps/custom-include/jpeg/',
            './deps/<(cairo_root)' ,
            './deps/<(cairo_root)cairo/' ,
            './deps/<(pixman_root)pixman/'
            './deps/<(libpng_root)/',
            './deps/custom-include/cairo/',
            './deps/<(gif_root)/lib/',
      ],
      'dependencies': [
	        'deps/cairo.gyp:cairo',
	        'deps/libpng.gyp:png',
	        'deps/jpeg.gyp:libjpeg',
	        'deps/gif.gyp:gif',
	  ],
      'defines': [  'HAVE_FREETYPE' ,'HAVE_JPEG' ,'HAVE_GIF' ],
      'sources': [
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
    }
  ]
}
