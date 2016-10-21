{
  'conditions': [
    ['OS=="win"', {
      'variables': {
        'GTK_Root%': 'C:/GTK', # Set the location of GTK all-in-one bundle
        'JPEG_ROOT%': 'C:/libjpeg-turbo', # Set the location of LibJpeg Turbo
		'GIF_Root': 'C:/giflib', # Set the location of GifLib source root
		# NOTE: Freetype2 when built and installed by CMake, creates the include directory like: linclude/freetype2. You need to rename freetype2 to freetype.
		'FT_Root': 'C:/freetype', # Points to Freetype root of CMake install directory
        'with_jpeg%': 'false',
        'with_gif%': 'false',
        'with_pango%': 'false',
        'with_freetype%': 'false'
      }
    }, { # 'OS!="win"'
      'variables': {
        'with_jpeg%': '<!(./util/has_lib.sh jpeg)',
        'with_gif%': '<!(./util/has_lib.sh gif)',
        'with_pango%': '<!(./util/has_lib.sh pango)',
        'with_freetype%': '<!(./util/has_lib.sh freetype)'
      }
    }]
  ],
  'targets': [
    {
      'target_name': 'canvas-postbuild',
      'dependencies': ['canvas'],
      'conditions': [
        ['OS=="win"', {
          'copies': [{
            'destination': '<(PRODUCT_DIR)',
            'files': [
              '<(GTK_Root)/bin/libcairo-2.dll',
              '<(GTK_Root)/bin/libexpat-1.dll',
              '<(GTK_Root)/bin/libfontconfig-1.dll',
              '<(GTK_Root)/bin/libfreetype-6.dll',
              '<(GTK_Root)/bin/libpng14-14.dll',
              '<(GTK_Root)/bin/zlib1.dll',
            ]
          }]
        }]
      ]
    },
    {
      'target_name': 'canvas',
      'include_dirs': ["<!(node -e \"require('nan')\")"],
      'sources': [
        'src/Canvas.cc',
        'src/CanvasGradient.cc',
        'src/CanvasPattern.cc',
        'src/CanvasRenderingContext2d.cc',
        'src/color.cc',
        'src/Image.cc',
        'src/ImageData.cc',
        'src/init.cc'
      ],
      'conditions': [
        ['OS=="win"', {
          'libraries': [
            '-l<(GTK_Root)/lib/cairo.lib',
            '-l<(GTK_Root)/lib/libpng.lib'
          ],
          'include_dirs': [
            '<(GTK_Root)/include',
            '<(GTK_Root)/include/cairo',
			'src/unistd' # needed for Freetype, GifLib, and Pango
          ],
          'defines': [
            '_USE_MATH_DEFINES' # for M_PI
          ],
          'configurations': {
            'Debug': {
              'msvs_settings': {
                'VCCLCompilerTool': {
                  'WarningLevel': 4,
                  'ExceptionHandling': 1,
                  'DisableSpecificWarnings': [4100, 4127, 4201, 4244, 4267, 4506, 4611, 4714, 4512]
                }
              }
            },
            'Release': {
              'msvs_settings': {
                'VCCLCompilerTool': {
                  'WarningLevel': 4,
                  'ExceptionHandling': 1,
                  'DisableSpecificWarnings': [4100, 4127, 4201, 4244, 4267, 4506, 4611, 4714, 4512]
                }
              }
            }
          }
        }, { # 'OS!="win"'
          'libraries': [
            '<!@(pkg-config pixman-1 --libs)',
            '<!@(pkg-config cairo --libs)',
            '<!@(pkg-config libpng --libs)'
          ],
          'include_dirs': [
            '<!@(pkg-config cairo --cflags-only-I | sed s/-I//g)',
            '<!@(pkg-config libpng --cflags-only-I | sed s/-I//g)'
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
              'libraries': [
                '-l<(FT_Root)/lib/freetype.lib'
              ],
			  'include_dirs': [
                '<(FT_Root)/include',
                '<(FT_Root)/include/freetype'
              ],
              'configurations': {
                'Debug': {
                  'msvs_settings': {
                    'VCLinkerTool': {
                      'IgnoreDefaultLibraryNames': ['libcmtd']
                    }
                  }
                },
                'Release': {
                  'msvs_settings': {
                    'VCLinkerTool': {
                      'IgnoreDefaultLibraryNames': ['libcmt']
                    }
                  }
                }
              }
            }, { # 'OS!="win"'
              'include_dirs': [ # tried to pass through cflags but failed.
                # Need to include the header files of cairo AND freetype.
                # Looking up the includes of cairo does both.
                '<!@(pkg-config cairo --cflags-only-I | sed s/-I//g)'
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
                '-l<(GTK_Root)/lib/fontconfig.lib',
                '-l<(GTK_Root)/lib/gobject-2.0.lib',
                '-l<(GTK_Root)/lib/pango-1.0.lib',
                '-l<(GTK_Root)/lib/pangocairo-1.0.lib'
              ],
			  'include_dirs': [
                '<(GTK_Root)/include/glib-2.0',
                '<(GTK_Root)/lib/glib-2.0/include',
                '<(GTK_Root)/include/pango-1.0',
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
                '-l<(JPEG_ROOT)/lib/jpeg.lib'
              ],
              'include_dirs': [
               '<(JPEG_ROOT)/include'
              ]
            }, {
              'libraries': [
                '-ljpeg'
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
              'sources': [
                '<(GIF_Root)/lib/dgif_lib.c',
                '<(GIF_Root)/lib/egif_lib.c',
                '<(GIF_Root)/lib/gif_err.c',
                '<(GIF_Root)/lib/gif_font.c',
                '<(GIF_Root)/lib/gif_hash.c',
                '<(GIF_Root)/lib/quantize.c',
                '<(GIF_Root)/lib/gifalloc.c'
              ],
		      'include_dirs': ["<(GIF_Root)/lib"]
            }, {
              'libraries': [
                '-lgif'
              ]
            }]
          ]
        }]
      ]
    }
  ]
}
