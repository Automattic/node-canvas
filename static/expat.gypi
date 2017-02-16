{
    'includes': ['common.gypi', 'locations.gypi'],
    'targets': [{
        'target_name': 'expat',
        'type': 'static_library',
        'include_dirs': [
            '<(expat_root)lib/',
            '<(expat_root)xmlwf/',
            'custom-include/expat'
        ],
        'defines': ['HAVE_EXPAT_CONFIG_H'],
        'sources': [
            "<(expat_root)lib/xmlparse.c",
            "<(expat_root)lib/xmltok.c",
            "<(expat_root)lib/xmlrole.c",
            "<(expat_root)xmlwf/xmlwf.c",
            "<(expat_root)xmlwf/xmlfile.c",
            "<(expat_root)xmlwf/codepage.c",
            "<(expat_root)xmlwf/unixfilemap.c"
        ]
    }]
}
