{
  'targets': [
    {
      'target_name': 'canvas',
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
      'defines': [
        'HAVE_GIF',
        'HAVE_JPEG',
        'HAVE_RSVG',
        'HAVE_BOOLEAN', # or jmorecfg.h tries to define it
        '_USE_MATH_DEFINES' # for M_PI
      ],
      'libraries': [
        'D:/a/_temp/msys/msys64/mingw64/lib/libcairo-2.lib',
        'D:/a/_temp/msys/msys64/mingw64/lib/libpng16-16.lib',
        'D:/a/_temp/msys/msys64/mingw64/lib/libjpeg-8.lib',
        'D:/a/_temp/msys/msys64/mingw64/lib/libpango-1.0-0.lib',
        'D:/a/_temp/msys/msys64/mingw64/lib/libpangocairo-1.0-0.lib',
        'D:/a/_temp/msys/msys64/mingw64/lib/libgobject-2.0-0.lib',
        'D:/a/_temp/msys/msys64/mingw64/lib/libglib-2.0-0.lib',
        'D:/a/_temp/msys/msys64/mingw64/lib/libturbojpeg.lib',
        'D:/a/_temp/msys/msys64/mingw64/lib/libgif-7.lib',
        'D:/a/_temp/msys/msys64/mingw64/lib/libfreetype-6.lib',
        'D:/a/_temp/msys/msys64/mingw64/lib/librsvg-2-2.lib'
      ],
      'include_dirs': [
        '<!(node -e "require(\'nan\')")',
        'D:/a/_temp/msys/msys64/mingw64/include',
        'D:/a/_temp/msys/msys64/mingw64/include/harfbuzz',
        'D:/a/_temp/msys/msys64/mingw64/include/pango-1.0',
        'D:/a/_temp/msys/msys64/mingw64/include/cairo',
        'D:/a/_temp/msys/msys64/mingw64/include/libpng16',
        'D:/a/_temp/msys/msys64/mingw64/include/glib-2.0',
        'D:/a/_temp/msys/msys64/mingw64/lib/glib-2.0/include',
        'D:/a/_temp/msys/msys64/mingw64/include/pixman-1',
        'D:/a/_temp/msys/msys64/mingw64/include/freetype2',
        'D:/a/_temp/msys/msys64/mingw64/include/fontconfig',
        'D:/a/_temp/msys/msys64/mingw64/include/librsvg-2.0',
        'D:/a/_temp/msys/msys64/mingw64/include/gdk-pixbuf-2.0',
        'D:/a/_temp/msys/msys64/mingw64/include/libgsf-1' # NEW
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
    }
  ]
}
