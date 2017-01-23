{
    'conditions':
    [
        ['OS=="win"', {
            'variables':
            {
                'GTK_Root%': 'C:/GTK',  # Set the location of GTK all-in-one bundle
                'with_jpeg%': 'false',
                'with_gif%': 'false',
                'with_pango%': 'false',
                'with_freetype%': 'false'
            }
        }, {  # OS!="win"'
            'variables':
            {
                'with_jpeg%': '<!(./util/has_lib.sh jpeg)',
                'with_gif%': '<!(./util/has_lib.sh gif)',
                'with_pango%': '<!(./util/has_lib.sh pango)',
                'with_freetype%': '<!(./util/has_lib.sh freetype)'
            }
        }]
    ],
    'targets':
    [
        {
            'target_name': 'canvas-postbuild',
            'dependencies': ['canvas'],
            'conditions':
            [
                ['OS=="win"', {
                    'copies':
                    [{
                        'destination': '<(PRODUCT_DIR)',
                        'files':
                        [
                            '<(GTK_Root)/bin/libcairo-2.dll',
                            '<(GTK_Root)/bin/libexpat-1.dll',
                            '<(GTK_Root)/bin/libfontconfig-1.dll',
                            '<(GTK_Root)/bin/libfreetype-6.dll',
                            '<(GTK_Root)/bin/libglib-2.0-0.dll',
                            '<(GTK_Root)/bin/libgobject-2.0-0.dll',
                            '<(GTK_Root)/bin/libgmodule-2.0-0.dll',
                            '<(GTK_Root)/bin/libgthread-2.0-0.dll',
                            '<(GTK_Root)/bin/libintl-8.dll',
                            '<(GTK_Root)/bin/libpangocairo-1.0-0.dll',
                            '<(GTK_Root)/bin/libpango-1.0-0.dll',
                            '<(GTK_Root)/bin/libpangoft2-1.0-0.dll',
                            '<(GTK_Root)/bin/libpangowin32-1.0-0.dll',
                            '<(GTK_Root)/bin/libpng14-14.dll',
                            '<(GTK_Root)/bin/zlib1.dll',
                        ]
                    }]
                }]
            ]
        },
        {
            'includes': ['canvas.gypi'],
            'conditions':
            [
                ['OS=="win"', {
                    'libraries':
                    [
                        '-l<(GTK_Root)/lib/cairo.lib',
                        '-l<(GTK_Root)/lib/freetype.lib',
                        '-l<(GTK_Root)/lib/glib-2.0.lib',
                        '-l<(GTK_Root)/lib/gobject-2.0.lib',
                        '-l<(GTK_Root)/lib/libpng.lib',
                        '-l<(GTK_Root)/lib/pangocairo-1.0.lib',
                        '-l<(GTK_Root)/lib/pango-1.0.lib'
                    ],
                    'include_dirs':
                    [
                        '<(GTK_Root)/include',
                        '<(GTK_Root)/include/cairo',
                        '<(GTK_Root)/include/pango-1.0',
                        '<(GTK_Root)/include/glib-2.0',
                        '<(GTK_Root)/include/freetype2',
                        '<(GTK_Root)/lib/glib-2.0/include'
                    ],
                    'defines':
                    [
                        'snprintf=_snprintf',
                        '_USE_MATH_DEFINES'  # for M_PI
                    ],
                    'configurations':
                    {
                        'Debug':
                        {
                            'msvs_settings':
                            {
                                'VCCLCompilerTool':
                                {
                                    'WarningLevel': 4,
                                    'ExceptionHandling': 1,
                                    'DisableSpecificWarnings':
                                    [
                                        4100, 4127, 4201, 4244, 4267, 4506,
                                        4611, 4714, 4512
                                    ]
                                }
                            }
                        },
                        'Release':
                        {
                            'msvs_settings':
                            {
                                'VCCLCompilerTool':
                                {
                                    'WarningLevel': 4,
                                    'ExceptionHandling': 1,
                                    'DisableSpecificWarnings':
                                    [
                                        4100, 4127, 4201, 4244, 4267, 4506,
                                        4611, 4714, 4512
                                    ]
                                }
                            }
                        }
                    }
                }, {  # OS!="win"'
                    'libraries':
                    [
                        '<!@(pkg-config pixman-1 --libs)',
                        '<!@(pkg-config cairo --libs)',
                        '<!@(pkg-config freetype2 --libs)',
                        '<!@(pkg-config libpng --libs)',
                        '<!@(pkg-config pangocairo --libs)'
                    ],
                    'include_dirs':
                    [
                        '<!@(pkg-config cairo  --cflags-only-I | sed s/-I//g)',
                        '<!@(pkg-config freetype2 --cflags-only-I | sed s/-I//g)',
                        '<!@(pkg-config libpng --cflags-only-I | sed s/-I//g)',
                        '<!@(pkg-config pangocairo --cflags-only-I | sed s/-I//g)'
                    ]
                }],

                ['with_freetype=="true"', {
                    'defines': ['HAVE_FREETYPE'],
                    'conditions':
                    [
                        ['OS!="win"', {
                            'include_dirs': [
                                # tried to pass through cflags but failed. Need
                                # to include the header files of cairo AND
                                # freetype. Looking up the includes of cairo
                                # does both.
                                '<!@(pkg-config cairo --cflags-only-I | sed s/-I//g)'
                            ]
                        }]
                    ]
                }],
                ['with_pango=="true"', {
                    'defines': ['HAVE_PANGO'],
                    'conditions':
                    [
                        ['OS=="win"', {
                            'libraries': ['-l<(GTK_Root)/lib/pangocairo.lib']
                        }, {  # 'OS!="win"'
                            'include_dirs': [  # tried to pass through cflags but failed
                                '<!@(pkg-config pangocairo --cflags-only-I | sed s/-I//g)'
                            ],
                            'libraries': ['<!@(pkg-config pangocairo --libs)']
                        }]
                    ]
                }],
                ['with_jpeg=="true"', {
                    'defines': ['HAVE_JPEG'],
                    'conditions':
                    [
                        ['OS=="win"', {
                            'libraries': ['-l<(GTK_Root)/lib/jpeg.lib']
                        }, {
                            'libraries': ['-ljpeg']
                        }]
                    ]
                }],
                ['with_gif=="true"', {
                    'defines': ['HAVE_GIF'],
                    'conditions':
                    [
                        ['OS=="win"', {
                            'libraries': ['-l<(GTK_Root)/lib/gif.lib']
                        }, {
                            'libraries': ['-lgif']
                        }]
                    ]
                }]
            ]
        }
    ]
}
