{
    'conditions': [
        ['standalone_static_library==1', {
          'includes': [ 'static.gyp' ],
        }, {
          'includes': [ 'shared.gyp' ],
        }]
    ],

}