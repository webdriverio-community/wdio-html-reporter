export const RUNNER = {
    type: "runner",
    start: "2019-04-13T00:10:05.191Z",
    end :  "2019-04-13T00:10:15.191Z",
    _duration: 34428,
    cid : '0-0',
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
        start: "2019-04-13T00:10:05.191Z",
        end :  "2019-04-13T00:10:15.191Z",
        tests : [
            {
                uid : 'foo1',
                title : 'foo',
                state : 'passed'
            },
            {
                uid : 'bar1',
                title : 'bar',
                state : 'failed',
                "events": [
                    {
                        "type": "log",
                        "value": "Show Login Screen"
                    },
                    {
                        "message": "Expected <xpath://p[@class='message red-gradient' and  contains(.,'Unable to login due to Bad credentials')]> to be displayed but it is not",
                        "stack": "Error: Expected <xpath://p[@class='message red-gradient' and  contains(.,'Unable to login due to Bad credentials')]> to be displayed but it is not\n    at timer.catch.e (C:\\Users\\rpii\\Development\\micro-magic-web-e2e-test\\node_modules\\webdriverio\\build\\commands\\browser\\waitUntil.js:69:15)\n    at Browser.runCommand (C:\\Users\\rpii\\Development\\micro-magic-web-e2e-test\\node_modules\\@wdio\\sync\\build\\wrapCommand.js:31:24)\n    at Browser.<anonymous> (C:\\Users\\rpii\\Development\\micro-magic-web-e2e-test\\node_modules\\@wdio\\sync\\build\\wrapCommand.js:53:31)\n    at Proxy.<anonymous> (C:\\Users\\rpii\\Development\\micro-magic-web-e2e-test\\node_modules\\chai-webdriverio\\dist\\assertions\\displayed.js:35:20)\n    at Proxy.methodWrapper (C:\\Users\\rpii\\Development\\micro-magic-web-e2e-test\\node_modules\\chai\\lib\\chai\\utils\\addMethod.js:57:25)\n    at LoginPage.displayed [as assertInvalidCredentials] (C:\\Users\\rpii\\Development\\micro-magic-web-e2e-test\\test\\pages/login.page.js:112:51)\n    at LoginPage.assertion [as login] (C:\\Users\\rpii\\Development\\micro-magic-web-e2e-test\\test\\pages/login.page.js:89:9)\n    at LoginPage.login [as loginFn] (C:\\Users\\rpii\\Development\\micro-magic-web-e2e-test\\test\\pages/login.page.js:98:14)\n    at module.exports.loginFn [as fn] (C:\\Users\\rpii\\Development\\micro-magic-web-e2e-test\\test\\specs/login2.spec.js:29:23)\n    at module.exports.runCase (C:\\Users\\rpii\\Development\\micro-magic-web-e2e-test\\node_modules\\@rpii\\wdio-data-driven\\lib\\wdio-data-driven.js:92:22)\n    at module.exports.forCasesInSpreadsheet (C:\\Users\\rpii\\Development\\micro-magic-web-e2e-test\\node_modules\\@rpii\\wdio-data-driven\\lib\\wdio-data-driven.js:71:18)",
                        "type": "Error"
                    },
                    {
                        "type": "screenshot",
                        "value": "build-test\\test.png"
                    },
                ]
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

