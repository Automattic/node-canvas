{
    'includes': ['static/locations.gyp'],
    'variables':
    {
        'ensure_deps%': '<!(static/ensure_deps.sh)',
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
            'deps/<(freetype_root)/include',
            'deps/<(gif_root)/lib',
            'deps/<(jpeg_root)',
            'static/custom-include/jpeg',
            'deps/<(libpng_root)',
            'deps/<(pixman_root)pixman',
            'deps/<(zlib_root)'
        ],
        'dependencies':
        [
            'static/cairo.gyp:cairo',
            'static/libpng.gyp:png',
            'static/jpeg.gyp:libjpeg',
            'static/gif.gyp:gif',
        ],
        'sources': ['src/FontFace.cc'],
        'defines': ['HAVE_FREETYPE', 'HAVE_JPEG' ,'HAVE_GIF'],
    }]
}
