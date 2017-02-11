{
    'includes': ['static/locations.gyp'],
    'variables':
    {
        'ensure_deps%': '<!(static/ensure_deps.sh)',
    },
    'targets':
    [{
        'includes': ['canvas.gypi'],
        'libraries': [
            '<!@(pkg-config fontconfig --libs)',
            '<!@(pkg-config gobject-2.0 --libs)',
        ],
        'include_dirs':
        [
            'deps',
            'deps/<(cairo_root)',
            'deps/<(cairo_root)cairo',
            'static/custom-include/cairo',
            'deps/<(freetype_root)/include',
            'deps/<(gif_root)/lib',
            '<!@(pkg-config glib-2.0 --cflags-only-I | sed s/-I//g)',
            'deps/<(jpeg_root)',
            'static/custom-include/jpeg',
            'deps/<(libpng_root)',
            'deps/<(pango_root)',
            'static/custom-include/pango',
            'deps/<(pixman_root)pixman',
            'deps/<(zlib_root)'
        ],
        'dependencies':
        [
            'static/cairo.gyp:cairo',
            'static/gif.gyp:gif',
            'static/jpeg.gyp:libjpeg',
            'static/libpng.gyp:png',
            'static/pango.gyp:pango'
        ],
        'defines': ['HAVE_FREETYPE', 'HAVE_JPEG', 'HAVE_GIF'],
    }]
}
