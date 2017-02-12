{
    'includes': ['common.gyp', 'locations.gyp'],
    'targets': [{
        'target_name': 'ffi',
        'type': 'static_library',
        'include_dirs': [
            '<(ffi_root)include/',
            'custom-include/ffi'
        ],
        'defines': ['HAVE_CONFIG_H'],
        'sources': [
            "<(ffi_root)src/prep_cif.c",
            "<(ffi_root)src/types.c",
            "<(ffi_root)src/raw_api.c",
            "<(ffi_root)src/java_raw_api.c",
            "<(ffi_root)src/closures.c",
            "<(ffi_root)src/x86/ffi64.c",
            "<(ffi_root)src/x86/unix64.S",
            "<(ffi_root)src/x86/ffi.c",
            "<(ffi_root)src/x86/sysv.S"
        ]
    }]
}
