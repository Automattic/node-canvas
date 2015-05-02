{

  'includes': [ 'common.gyp' , 'locations.gyp'],
  'targets': [
    {
      'target_name': 'pixman',
      'type': 'static_library',
      'include_dirs': [
            '../static/custom-include/pixman/',
            '<(pixman_root)',
            '<(pixman_root)pixman',
            ],

      'libraries': [

      ]
      ,
      'defines': [ 'HAVE_CONFIG_H' ],
      'sources': [
        "<(pixman_root)pixman/pixman-access-accessors.c",
        "<(pixman_root)pixman/pixman-access.c",
        "<(pixman_root)pixman/pixman-arm.c",
        "<(pixman_root)pixman/pixman-arm-neon.c",
        "<(pixman_root)pixman/pixman-arm-simd.c",
        "<(pixman_root)pixman/pixman-bits-image.c",
        "<(pixman_root)pixman/pixman.c",
        "<(pixman_root)pixman/pixman-combine32.c",
        "<(pixman_root)pixman/pixman-combine-float.c",
        "<(pixman_root)pixman/pixman-conical-gradient.c",
        "<(pixman_root)pixman/pixman-edge-accessors.c",
        "<(pixman_root)pixman/pixman-edge.c",
        "<(pixman_root)pixman/pixman-fast-path.c",
        "<(pixman_root)pixman/pixman-filter.c",
        "<(pixman_root)pixman/pixman-general.c",
        "<(pixman_root)pixman/pixman-glyph.c",
        "<(pixman_root)pixman/pixman-gradient-walker.c",
        "<(pixman_root)pixman/pixman-image.c",
        "<(pixman_root)pixman/pixman-implementation.c",
        "<(pixman_root)pixman/pixman-linear-gradient.c",
        "<(pixman_root)pixman/pixman-matrix.c",
        "<(pixman_root)pixman/pixman-mips.c",
        "<(pixman_root)pixman/pixman-mips-dspr2.c",
        "<(pixman_root)pixman/pixman-mmx.c",
        "<(pixman_root)pixman/pixman-noop.c",
        "<(pixman_root)pixman/pixman-ppc.c",
        "<(pixman_root)pixman/pixman-radial-gradient.c",
        "<(pixman_root)pixman/pixman-region16.c",
        "<(pixman_root)pixman/pixman-region32.c",
        #"<(pixman_root)pixman/pixman-region.c",
        "<(pixman_root)pixman/pixman-solid-fill.c",
        "<(pixman_root)pixman/pixman-sse2.c",
        "<(pixman_root)pixman/pixman-timer.c",
        "<(pixman_root)pixman/pixman-trap.c",
        "<(pixman_root)pixman/pixman-utils.c",
        #"<(pixman_root)pixman/pixman-vmx.c",
        "<(pixman_root)pixman/pixman-x86.c",
      ],
    },
  ]
}
