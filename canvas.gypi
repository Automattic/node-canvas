{
    'target_name': 'canvas',
    'libraries': [
        '<!@(pkg-config pangocairo --libs)'
    ],
    'include_dirs': [
        "<!(node -e \"require('nan')\")",
        '<!@(pkg-config glib-2.0   --cflags-only-I | sed s/-I//g)',
        '<!@(pkg-config pangocairo --cflags-only-I | sed s/-I//g)'
    ],
    'sources':
    [
        'src/Canvas.cc',
        'src/CanvasGradient.cc',
        'src/CanvasPattern.cc',
        'src/CanvasRenderingContext2d.cc',
        'src/color.cc',
        'src/Image.cc',
        'src/ImageData.cc',
        'src/register_font.cc',
        'src/init.cc',
    ],
    'cflags!':    ['-fno-exceptions'],
    'cflags_cc!': ['-fno-exceptions']
}
