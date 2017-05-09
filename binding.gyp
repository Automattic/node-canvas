{
    'variables':
    {
        'has_cairo%': '<!(node ./util/has_lib.js cairo)'
    },
    'conditions':
    [
        ['has_cairo=="true"',
        {
            'includes': ['shared.gyp']
        },
        {
            'includes': ['static.gyp']
        }]
    ]
}
