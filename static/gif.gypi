{

  'includes': ['common.gypi', 'locations.gypi'],
  'targets': [
    {
      'target_name': 'gif',
      'type': 'static_library',
      'include_dirs': ['<(gif_root)lib/'],
      'libraries': [
       ],
      'sources': [
            "<(gif_root)lib/dgif_lib.c",
            "<(gif_root)lib/egif_lib.c",
            "<(gif_root)lib/gifalloc.c",
            "<(gif_root)lib/gif_err.c",
            "<(gif_root)lib/gif_font.c",
            "<(gif_root)lib/gif_hash.c",
      ],
    },
  ]
}
