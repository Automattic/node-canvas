{
    'includes': [ 'deps/locations.gyp'],
    'variables':{
        'ensure_deps%': '<!(./deps/ensure_deps.sh)',
    },
    'conditions': [
        ['OS=="win"', {
          'variables': {
            'GTK_Root%': 'C:/GTK', # Set the location of GTK all-in-one bundle
            'with_jpeg%': 'false',
            'with_gif%': 'false',
            'with_pango%': 'false',
            'with_freetype%': 'true'
          }
        }, { # 'OS!="win"'
          'variables': {
            'with_jpeg%': 'true', #'<!(./util/has_lib.sh jpeg)',
            'with_gif%': '<!(./util/has_lib.sh gif)',
            'with_pango%': 'false',
            'with_freetype%': 'true'  # '<!(./util/has_cairo_freetype.sh)'
          }
        }]
    ],
  'targets': [
    {
      'target_name': 'canvas',
      'include_dirs': ["<!(node -p -e \"require('path').dirname(require.resolve('nan'))\")"],
      'sources': [
        'src/Canvas.cc',
        'src/CanvasGradient.cc',
        'src/CanvasPattern.cc',
        'src/CanvasRenderingContext2d.cc',
        'src/color.cc',
        'src/Image.cc',
        'src/ImageData.cc',
        'src/init.cc',
        'src/PixelArray.cc'
      ],
      
      
      'conditions': [
        ['OS=="win"', {
          'libraries': [
            '-l<(GTK_Root)/lib/cairo.lib'
          ],
          'include_dirs': [
            '<(GTK_Root)/include',
          ],
          'defines': [
            'snprintf=_snprintf',
            '_USE_MATH_DEFINES' # for M_PI
          ]
        }, { # 'OS!="win"'
          'libraries': [
         
          ],
          'dependencies': [
	          'deps/cairo.gyp:cairo',
	          'deps/libpng.gyp:png',
	          'deps/jpeg.gyp:libjpeg',
	          'deps/gif.gyp:gif',
	          
	    ]  ,
          'include_dirs': [
               
                './deps/<(jpeg_root)',
                #'./deps/custom-include/jpeg/',
                './deps/<(cairo_root)' ,
                './deps/<(cairo_root)cairo/' ,
                './deps/<(pixman_root)pixman/'
                './deps/<(libpng_root)/',
                './deps/custom-include/cairo/',
                './deps/<(gif_root)/lib/',
          ]
        }],
        ['with_freetype=="true"', {
          'defines': [
           'HAVE_FREETYPE'
          ],
          'sources': [
            'src/FontFace.cc'
          ],
          'conditions': [
            ['OS=="win"', {
              # No support for windows right now.
            }, { # 'OS!="win"'
              'include_dirs': [ 
                 './deps/<(freetype_root)/include',
              ]
            }]
          ]
        }],
        ['with_pango=="true"', {
          'defines': [
            'HAVE_PANGO'
          ],
          'conditions': [
            ['OS=="win"', {
              'libraries': [
                '-l<(GTK_Root)/lib/pangocairo.lib'
              ]
            }, { # 'OS!="win"'
              'include_dirs': [ # tried to pass through cflags but failed
                '<!@(pkg-config pangocairo --cflags-only-I | sed s/-I//g)'
              ],
              'libraries': [
                '<!@(pkg-config pangocairo --libs)'
              ]
            }]
          ]
        }],
        ['with_jpeg=="true"', {
          'defines': [
            'HAVE_JPEG'
          ],
          'conditions': [
            ['OS=="win"', {
              'libraries': [
                '-l<(GTK_Root)/lib/jpeg.lib'
              ]
            }, {
              'libraries': [
                #'-ljpeg'
              ]
            }]
          ]
        }],
        ['with_gif=="true"', {
          'defines': [
            'HAVE_GIF'
          ],
          'conditions': [
            ['OS=="win"', {
              'libraries': [
                '-l<(GTK_Root)/lib/gif.lib'
              ]
            }, {
              'libraries': [
                #'-lgif'
              ]
            }]
          ]
        }]
      ]
    }
  ]
}
