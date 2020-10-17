{
    'conditions':
    [
        ['OS=="win"', {
            'includes': ['shared.gypi']
        }, {
            'variables':
            {
                'shared%': '<!(node ./util/has_lib.js)'
            },
            'conditions':
            [
                ['shared=="true"', {
                    'includes': ['shared.gypi']
                }, {
                    'includes': ['static.gypi']
                }]
            ]
        }]
    ]
}
