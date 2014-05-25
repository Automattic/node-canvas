{
    'variables': {
        'has_cairo%': '<!(./util/has_lib.sh cairo)',
     },
    'conditions': [
        ['has_cairo=="true1"', {
          'includes': [ 'shared.gyp' ],
        }, {
          'includes': [ 'static.gyp' ],
        }]
    ],
}