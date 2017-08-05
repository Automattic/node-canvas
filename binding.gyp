{
    'variables':
    {
        'shared%': '<!(node ./util/has_lib.js)'
    },
    'conditions':
    [
        ['shared=="true" or OS=="win"', {
            'includes': ['shared.gypi']
        }, {
            'includes': ['static.gypi']
        }]
    ]
}
