{
    'target_name': 'canvas',
    'include_dirs': ["<!(node -e \"require('nan')\")"],
    'sources': [
        'src/backend/Backend.cc',
        'src/backend/ImageBackend.cc',
        'src/backend/PdfBackend.cc',
        'src/backend/SvgBackend.cc',
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
        'src/register_font.cc',
        'src/toBuffer.cc'
    ],
    'cflags!':    ['-fno-exceptions'],
    'cflags_cc!': ['-fno-exceptions']
}
