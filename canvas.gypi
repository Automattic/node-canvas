{
    'variables':
    {
        'has_FBDev%': 'true',
        'has_X11%': '<!(node ./util/has_lib.js X11)'
    },
    'conditions':
    [
        ['OS=="win"',
        {
            'sources': ['src/backend/Win32Backend.cc']
        }, {  # 'OS!="win"'
          'cflags!': ['-fno-exceptions'],
          'cflags_cc!': ['-fno-exceptions']
        }],
        ['has_FBDev=="true"',
        {
            'defines': ['HAS_FBDEV'],
            'sources': ['src/backend/FBDevBackend.cc']
        }],
        ['has_X11=="true"',
        {
            'defines': ['HAS_X11'],
            'sources': ['src/backend/X11Backend.cc'],
            'libraries': ['-lX11', '-lXrender', '-lXext']
        }]
    ],
    'target_name': 'canvas',
    'include_dirs': ["<!(node -e \"require('nan')\")"],
    'sources':
    [
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
    ]
}
