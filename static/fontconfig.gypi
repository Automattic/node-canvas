{
    'includes': ['common.gypi', 'locations.gypi'],
    'targets': [{
        'target_name': 'fontconfig',
        'type': 'static_library',
        'include_dirs': [
            '<(fontconfig_root)',
            '<(fontconfig_root)src',
            'custom-include/fontconfig',

            '<(expat_root)/lib',
            '<(freetype_root)/include',
        ],
        'defines': [
            'HAVE_CONFIG_H', 'FC_CACHEDIR=\"/var/cache/fontconfig\"',
            'FONTCONFIG_PATH=\"/etc/fonts\"'
        ],
        'sources':
        [
            "<(fontconfig_root)src/fcatomic.c",
            "<(fontconfig_root)src/fcblanks.c",
            "<(fontconfig_root)src/fccache.c",
            "<(fontconfig_root)src/fccfg.c",
            "<(fontconfig_root)src/fccharset.c",
            "<(fontconfig_root)src/fccompat.c",
            "<(fontconfig_root)src/fcdbg.c",
            "<(fontconfig_root)src/fcdefault.c",
            "<(fontconfig_root)src/fcdir.c",
            "<(fontconfig_root)src/fcformat.c",
            "<(fontconfig_root)src/fcfreetype.c",
            "<(fontconfig_root)src/fcfs.c",
            "<(fontconfig_root)src/fcinit.c",
            "<(fontconfig_root)src/fclang.c",
            "<(fontconfig_root)src/fclist.c",
            "<(fontconfig_root)src/fcmatch.c",
            "<(fontconfig_root)src/fcmatch.c",
            "<(fontconfig_root)src/fcmatrix.c",
            "<(fontconfig_root)src/fcname.c",
            "<(fontconfig_root)src/fcobjs.c",
            "<(fontconfig_root)src/fcpat.c",
            "<(fontconfig_root)src/fcrange.c",
            "<(fontconfig_root)src/fcserialize.c",
            "<(fontconfig_root)src/fcstat.c",
            "<(fontconfig_root)src/fcstr.c",
            "<(fontconfig_root)src/fcweight.c",
            "<(fontconfig_root)src/fcxml.c",
            "<(fontconfig_root)src/ftglue.c",
            "<(fontconfig_root)src/fcxml.c",
            "<(fontconfig_root)src/fcxml.c",
            "<(fontconfig_root)src/fcxml.c",
        ]
    }]
}
