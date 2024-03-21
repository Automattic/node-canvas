{
  'variables': {
    'with_jpeg%': 'false',
    'with_gif%': 'false',
    'with_rsvg%': 'false'
  },
  'conditions': [
    ['OS=="linux"', {
       'variables': {
          'with_jpeg%': '<!(node ./util/has-lib.js jpeg)',
          'with_gif%': '<!(node ./util/has-lib.js gif)',
          'with_rsvg%': '<!(node ./util/has-lib.js rsvg)'
       }
    }],
    ['OS=="mac"', {
      'variables': {
        'with_jpeg%': '<!(node ./util/has-lib.js jpeg)',
        'with_gif%': 'true',
        'with_rsvg%': '<!(node ./util/has-lib.js rsvg)'
      }
    }],
    ['OS=="win"', {
      'variables': {
        # Set the location of MSYS
        'msys_root%': '<!(cygpath -m $(MSYSTEM_PREFIX))',
        'with_jpeg%': 'true',
        'with_gif%': 'true',
        'with_rsvg%': 'true'
      }
    }],
  ],
  'targets': [
    {
      'target_name': 'canvas',
      'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS', 'NODE_ADDON_API_ENABLE_MAYBE' ],
      'sources': [
        'src/backend/Backend.cc',
        'src/backend/ImageBackend.cc',
        'src/backend/PdfBackend.cc',
        'src/backend/SvgBackend.cc',
        'src/bmp/BMPParser.cc',
        'src/Backends.cc',
        'src/Canvas.cc',
        'src/CanvasGradient.cc',
        'src/CanvasPattern.cc',
        'src/CanvasRenderingContext2d.cc',
        'src/closure.cc',
        'src/color.cc',
        'src/Image.cc',
        'src/ImageData.cc',
        'src/init.cc',
        'src/register_font.cc'
      ],
      'conditions': [
        ['with_jpeg=="true"', {
          'defines': ['HAVE_JPEG']
        }],
        ['with_gif=="true"', {
          'defines': ['HAVE_GIF']
        }],
        ['with_rsvg=="true"', {
          'defines': ['HAVE_RSVG']
        }],
        ['OS=="linux"', {
          'dependencies': ['<!(node -p "require(\'node-addon-api\').targets"):node_addon_api'],
          'libraries': [
            '<!@(pkg-config pixman-1 --libs)',
            '<!@(pkg-config cairo --libs)',
            '<!@(pkg-config libpng --libs)',
            '<!@(pkg-config pangocairo --libs)',
            '<!@(pkg-config freetype2 --libs)'
          ],
          'include_dirs': [
             '<!@(pkg-config cairo --cflags-only-I | sed s/-I//g)',
             '<!@(pkg-config libpng --cflags-only-I | sed s/-I//g)',
             '<!@(pkg-config pangocairo --cflags-only-I | sed s/-I//g)',
             '<!@(pkg-config freetype2 --cflags-only-I | sed s/-I//g)'
          ],
          'ldflags': [
            '-Wl,-rpath \'-Wl,$$ORIGIN\''
          ],
          'cflags!': [
            '-fno-exceptions'
          ],
          'cflags_cc!': [
            '-fno-exceptions'
          ],
          'conditions': [
            ['with_jpeg=="true"', {
              'include_dirs': ['<!@(pkg-config libjpeg --cflags-only-I | sed s/-I//g)'],
              'libraries': ['<!@(pkg-config libjpeg --libs)']
            }],
            ['with_gif=="true"', {
              'include_dirs': ['<!@((pkg-config libgif --cflags-only-I 2>/dev/null || echo "") | sed s/-I//g)'],
              # libgif fail to pkg-config on Alpine
              'libraries': ['<!@(pkg-config libgif --libs 2>/dev/null || echo "-lgif")']
            }],
            ['with_rsvg=="true"', {
              'include_dirs': ['<!@(pkg-config librsvg-2.0 --cflags-only-I | sed s/-I//g)'],
              # libgif fail to pkg-config on Alpine
              'libraries': ['<!@(pkg-config librsvg-2.0 --libs)']
            }]
          ]
        }],
        ['OS=="mac"', {
          'include_dirs': [
            '<!(node -p "require(\'node-addon-api\').include_dir")',
            '<!@(pkg-config cairo --cflags-only-I | sed s/-I//g)',
            '<!@(pkg-config libpng --cflags-only-I | sed s/-I//g)',
            '<!@(pkg-config pangocairo --cflags-only-I | sed s/-I//g)',
            '<!@(pkg-config freetype2 --cflags-only-I | sed s/-I//g)'
          ],
          'libraries': [
            '<!@(pkg-config pixman-1 --libs)',
            '<!@(pkg-config cairo --libs)',
            '<!@(pkg-config libpng --libs)',
            '<!@(pkg-config pangocairo --libs)',
            '<!@(pkg-config freetype2 --libs)'
          ],
          'cflags+': ['-fvisibility=hidden'],
          'xcode_settings': {
             # -fvisibility=hidden
            'GCC_SYMBOLS_PRIVATE_EXTERN': 'YES',
            'GCC_ENABLE_CPP_EXCEPTIONS': 'YES'
          },
          'conditions': [
            ['with_jpeg=="true"', {
              'include_dirs': ['<!@(pkg-config libjpeg --cflags-only-I | sed s/-I//g)'],
              'libraries': ['<!@(pkg-config libjpeg --libs)']
            }],
            ['with_gif=="true"', {
               'include_dirs': ['/opt/homebrew/include'],
               'libraries': ['-L/opt/homebrew/lib','-lgif']
            }],
            ['with_rsvg=="true"', {
              'include_dirs': ['<!@(pkg-config librsvg-2.0 --cflags-only-I | sed s/-I//g)'],
              'libraries': ['<!@(pkg-config librsvg-2.0 --libs)']
            }]
          ]
        }],
        ['OS=="win"', {
          'dependencies':["<!(node -p \"require('node-addon-api').targets\"):node_addon_api"],
          'libraries': [
            '<(msys_root)/lib/libcairo-2.lib',
            '<(msys_root)/lib/libpng16-16.lib',
            '<(msys_root)/lib/libpango-1.0-0.lib',
            '<(msys_root)/lib/libpangocairo-1.0-0.lib',
            '<(msys_root)/lib/libgobject-2.0-0.lib',
            '<(msys_root)/lib/libglib-2.0-0.lib',
            '<(msys_root)/lib/libfreetype-6.lib'
          ],
          'include_dirs': [
            '<(msys_root)/include',
            '<(msys_root)/include/cairo',
            '<(msys_root)/include/pango-1.0',
            '<(msys_root)/include/libpng16',
            '<(msys_root)/include/glib-2.0',
            '<(msys_root)/lib/glib-2.0/include',
            '<(msys_root)/include/pixman-1',
            '<(msys_root)/include/freetype2',
            '<(msys_root)/include/fontconfig',
            '<(msys_root)/include/gdk-pixbuf-2.0',
            '<(msys_root)/include/harfbuzz'
          ],
          'defines': [
            # for M_PI
            '_USE_MATH_DEFINES',
            # or jmorecfg.h tries to define it
            'HAVE_BOOLEAN'
          ],
          'conditions':[
            ['with_jpeg=="true"', {
              'libraries': [
                '<(msys_root)/lib/libjpeg-8.lib',
                '<(msys_root)/lib/libturbojpeg.lib'
              ]
            }],
            ['with_gif=="true"', {
              'libraries': ['<(msys_root)/lib/libgif-7.lib']
            }],
            ['with_rsvg=="true"', {
              'include_dirs':['<(msys_root)/include/librsvg-2.0'],
              'libraries': ['<(msys_root)/lib/librsvg-2-2.lib']
            }]
          ],
          'configurations': {
            'Debug': {
              'msvs_settings': {
                'VCCLCompilerTool': {
                  'AdditionalOptions': ['-std:c++20'],
                  'WarningLevel': 4,
                  'ExceptionHandling': 1,
                  'DisableSpecificWarnings': [4100, 4127, 4201, 4244, 4267, 4506, 4611, 4714, 4512]
                }
              }
            },
            'Release': {
              'msvs_settings': {
                'VCCLCompilerTool': {
                  'AdditionalOptions': ['-std:c++20'],
                  'WarningLevel': 4,
                  'ExceptionHandling': 1,
                  'DisableSpecificWarnings': [4100, 4127, 4201, 4244, 4267, 4506, 4611, 4714, 4512]
                }
              }
            }
          }
        }]
      ]
    }
  ]
}
