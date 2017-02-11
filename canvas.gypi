{
    'target_name': 'canvas',
    'include_dirs': [
        "<!(node -e \"require('nan')\")"
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
