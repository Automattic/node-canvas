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
        'HAVE_RSVG'
      ],
      'libraries': [
        '<!@(pkg-config pixman-1 --libs)',
        '<!@(pkg-config cairo --libs)',
        '<!@(pkg-config libpng --libs)',
        '<!@(pkg-config pangocairo --libs)',
        '<!@(pkg-config freetype2 --libs)',
        '<!@(pkg-config librsvg-2.0 --libs)',
        '-ljpeg',
        '-lgif'
      ],
      'include_dirs': [
        '<!(node -e "require(\'nan\')")',
        '<!@(pkg-config cairo --cflags-only-I | sed s/-I//g)',
        '<!@(pkg-config libpng --cflags-only-I | sed s/-I//g)',
        '<!@(pkg-config pangocairo --cflags-only-I | sed s/-I//g)',
        '<!@(pkg-config freetype2 --cflags-only-I | sed s/-I//g)',
        '<!@(pkg-config librsvg-2.0 --cflags-only-I | sed s/-I//g)'
      ],
      'ldflags': [
        '-Wl,-rpath \'-Wl,$$ORIGIN\''
      ],
      'cflags!': ['-fno-exceptions'],
      'cflags_cc!': ['-fno-exceptions']
    }
  ]
}
