{
    'variables':
    {
        'has_cairo%': '<!(./util/has_lib.sh cairo)'
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
    ],
}
