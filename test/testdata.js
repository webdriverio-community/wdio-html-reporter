export const RUNNER = {
    cid : '0-0',
    _duration : 5032,
    config: { hostname: 'localhost' },
    capabilities : {
        browserName : 'loremipsum',
    },
    specs : ['/foo/bar/baz.js']
};

export const SUITE_UIDS = [
    'Foo test1',
    'Bar test2',
    'Baz test3',
]

export const SUITES = [
    {
        uid : SUITE_UIDS[0],
        title : SUITE_UIDS[0].slice(0, -1),
        type : "suite",
        hooks: [],
        tests : [
            {
                uid : 'foo1',
                title : 'foo',
                state : 'passed',
            },
            {
                uid : 'bar1',
                title : 'bar',
                state : 'failed',
            },
            {
                uid : 'three',
                title : 'bar',
                state : 'skipped',
            }
        ],
    },
    {
        uid : SUITE_UIDS[1],
        title : SUITE_UIDS[1].slice(0, -1),
        hooks: [],
        type : "suite",
        tests : [
            {
                uid : 'some test1',
                title : 'some test',
                state : 'passed',
            },
            {
                uid : 'a failed test2',
                title : 'a failed test',
                state : 'failed',
                error : {
                    message : 'expected foo to equal bar',
                    stack : 'Failed test stack trace'
                }
            }
        ],
    },
    {
        uid : SUITE_UIDS[2],
        title : SUITE_UIDS[2].slice(0, -1),
        type : "suite",
        hooks: [],
        tests : [
            {
                uid : 'foo bar baz1',
                title : 'foo bar baz',
                state : 'passed',
            },
            {
                uid : 'a skipped test2',
                title : 'a skipped test',
                state : 'skipped',
            }],
    }
]

export const SUITES_MULTIPLE_ERRORS = [
    {
        uid : SUITE_UIDS[0],
        title : SUITE_UIDS[0].slice(0, -1),
        hooks: [],
        tests : [
            {
                uid : 'foo1',
                title : 'foo',
                state : 'passed',
            },
            {
                uid : 'bar1',
                title : 'bar',
                state : 'passed',
            }
        ],
    },
    {
        uid : SUITE_UIDS[1],
        title : SUITE_UIDS[1].slice(0, -1),
        hooks: [],
        tests : [
            {
                uid : 'some test1',
                title : 'some test',
                state : 'passed',
            },
            {
                uid : 'a failed test',
                title : 'a test with two failures',
                state : 'failed',
                errors : [
                    {
                        message : 'expected the party on the first part to be the party on the first part',
                        stack : 'First failed stack trace'
                    },
                    {
                        message : 'expected the party on the second part to be the party on the second part',
                        stack : 'Second failed stack trace'
                    }
                ]
            }
        ],
    },
]

export const SUITES_NO_TESTS = [
    {
        uid: SUITE_UIDS[0],
        title: SUITE_UIDS[0].slice(0, -1),
        tests: [],
        suites: [],
        hooks: []
    },
]

export const SUITES_NO_TESTS_WITH_HOOK_ERROR = [
    {
        uid: SUITE_UIDS[0],
        title: SUITE_UIDS[0].slice(0, -1),
        tests: [],
        suites: [],
        hooks: [{
            uid : 'a failed hook2',
            title : 'a failed hook',
            state : 'failed',
            error : {
                message : 'expected foo to equal bar',
                stack : 'Failed test stack trace'
            }
        }]
    },
]

