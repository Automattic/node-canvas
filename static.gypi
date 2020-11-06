{
    'includes': ['static/locations.gypi'],
    'variables':
    {
        'ensure_deps%': '<!(static/ensure_deps.sh)'
    },
    'targets':
    [{
        'includes': ['canvas.gypi'],
        'include_dirs':
        [
            'deps',
            'deps/<(cairo_root)',
            'deps/<(cairo_root)cairo',
            'static/custom-include/cairo',
            'deps/<(fontconfig_root)/src',
            'static/custom-include/fontconfig',
            'deps/<(fontconfig_root)',
            'deps/<(freetype_root)/include',
            'deps/<(gif_root)/lib',
            'deps/<(glib_root)',
            'deps/<(glib_root)/glib',
            'static/custom-include/glib',
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
            'static/cairo.gypi:cairo',
            'static/expat.gypi:expat',
            'static/ffi.gypi:ffi',
            'static/fontconfig.gypi:fontconfig',
            'static/gif.gypi:gif',
            'static/glib.gypi:glib',
            'static/glib.gypi:gobject',
            'static/jpeg.gypi:libjpeg',
            'static/libpng.gypi:png',
            'static/pango.gypi:pango'
        ],
        'defines': ['HAVE_FREETYPE', 'HAVE_JPEG', 'HAVE_GIF'],
        'cflags!': ['-fno-exceptions'],
        'cflags_cc!': ['-fno-exceptions'],
        'conditions':
        [
            ['OS=="mac"', {
                'xcode_settings': {
                    'GCC_ENABLE_CPP_EXCEPTIONS': 'YES'
                }
            }]
        ]
    }]
}
