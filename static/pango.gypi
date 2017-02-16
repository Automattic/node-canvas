{
    'includes': ['common.gypi', 'locations.gypi'],
    'targets': [{
        'target_name': 'pango/mini-fribidi',
        'type': 'static_library',
        'include_dirs': [
            '<(glib_root)',
            '<(glib_root)/glib',
            'custom-include/glib',
            '<(pango_root)pango/mini-fribidi',
            'custom-include/pango',
        ],
        'defines': [
            'HAVE_CONFIG_H', 'G_DISABLE_CAST_CHECKS',
            'SYSCONFDIR=\"/usr/local/etc\"', 'LIBDIR=\"/usr/local/lib\"'
        ],
        'sources': [
            "<(pango_root)pango/mini-fribidi/fribidi.c",
            "<(pango_root)pango/mini-fribidi/fribidi_char_type.c",
            "<(pango_root)pango/mini-fribidi/fribidi_types.c"
        ]
    }, {
        'target_name': 'pango',
        'type': 'static_library',
        'include_dirs': [
            '<(pango_root)',
            '<(pango_root)pango',
            'custom-include/pango',
            '<(cairo_root)cairo',
            'custom-include/cairo',
            '<(fontconfig_root)',
            '<(freetype_root)/include',
            '<(glib_root)',
            '<(glib_root)/glib',
            'custom-include/glib',
            '<(harfbuzz_root)/src'
        ],
        'dependencies':
        [
            '../static/cairo.gypi:cairo',
            '../static/freetype.gypi:freetype',
            '../static/harfbuzz.gypi:harfbuzz',
            'pango/mini-fribidi'
        ],
        'defines': [
            'HAVE_CONFIG_H', 'G_LOG_DOMAIN=\"Pango\"', 'PANGO_ENABLE_BACKEND',
            'PANGO_ENABLE_ENGINE', 'G_DISABLE_CAST_CHECKS',
            'SYSCONFDIR=\"/usr/local/etc\"', 'LIBDIR=\"/usr/local/lib\"'
        ],
        'sources': [
            "<(pango_root)pango/break.c",
            "<(pango_root)pango/ellipsize.c",
            "<(pango_root)pango/fonts.c",
            "<(pango_root)pango/glyphstring.c",
            "<(pango_root)pango/modules.c",
            "<(pango_root)pango/pango-attributes.c",
            "<(pango_root)pango/pango-bidi-type.c",
            "<(pango_root)pango/pango-color.c",
            "<(pango_root)pango/pango-context.c",
            "<(pango_root)pango/pango-coverage.c",
            "<(pango_root)pango/pango-engine.c",
            "<(pango_root)pango/pango-fontmap.c",
            "<(pango_root)pango/pango-fontset.c",
            "<(pango_root)pango/pango-glyph-item.c",
            "<(pango_root)pango/pango-gravity.c",
            "<(pango_root)pango/pango-item.c",
            "<(pango_root)pango/pango-language.c",
            "<(pango_root)pango/pango-layout.c",
            "<(pango_root)pango/pango-markup.c",
            "<(pango_root)pango/pango-matrix.c",
            "<(pango_root)pango/pango-renderer.c",
            "<(pango_root)pango/pango-script.c",
            "<(pango_root)pango/pango-tabs.c",
            "<(pango_root)pango/pango-utils.c",
            "<(pango_root)pango/reorder-items.c",
            "<(pango_root)pango/shape.c",
            "<(pango_root)pango/pango-enum-types.c",
            "<(pango_root)pango/pangofc-font.c",
            "<(pango_root)pango/pangofc-fontmap.c",
            "<(pango_root)pango/pangofc-decoder.c",
            "<(pango_root)pango/pangofc-shape.c",
            "<(pango_root)pango/pangoft2.c",
            "<(pango_root)pango/pangoft2-fontmap.c",
            "<(pango_root)pango/pangoft2-render.c",
            "<(pango_root)pango/pango-ot-buffer.c",
            "<(pango_root)pango/pango-ot-info.c",
            "<(pango_root)pango/pango-ot-ruleset.c",
            "<(pango_root)pango/pango-ot-tag.c",
            "<(pango_root)pango/pangocairo-context.c",
            "<(pango_root)pango/pangocairo-font.c",
            "<(pango_root)pango/pangocairo-fontmap.c",
            "<(pango_root)pango/pangocairo-render.c",
            "<(pango_root)pango/pangocairo-fcfont.c",
            "<(pango_root)pango/pangocairo-fcfontmap.c",
        ]
    }]
}
