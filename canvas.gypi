{
    'variables':
    {
        'has_FBDev%': 'true',
        'has_X11%': '<!(./util/has_lib.sh X11)'
    },
    'conditions':
    [
        ['has_FBDev=="true"',
        {
            'defines': ['HAS_FBDEV'],
            'sources': ['src/backend/FBDevBackend.cc']
        }],
        ['has_X11=="true"',
        {
            'defines': ['HAS_X11'],
            'sources': ['src/backend/X11Backend.cc']
        }]
    ],
    'target_name': 'canvas',
    'include_dirs': ["<!(node -e \"require('nan')\")"],
    'sources':
    [
        'src/backend/Backend.cc',
        'src/backend/ImageBackend.cc',
        'src/backend/FBDevBackend.cc',
        'src/Backends.cc',
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
    'cflags!':    ['-fno-exceptions'],
    'cflags_cc!': ['-fno-exceptions']
}
