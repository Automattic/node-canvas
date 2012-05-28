{
  'variables': {
    # Set the location of GTK all-in-one bundle
	'GTK_Root': 'C:/GTK',
  },
  'targets': [
    {
      'target_name': 'canvas',
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
		],
	  'libraries': ['-l<(GTK_Root)/lib/cairo.lib' ],
		  'include_dirs': [
		   '<(GTK_Root)/include/cairo',
		  ],
	  'defines': [
			'snprintf=_snprintf',
			'_USE_MATH_DEFINES' # for M_PI
		],
    }
  ]
}
