// import sinon from 'sinon'
// import expect from 'chai'
const should = require('chai').should()

const fs = require('fs-extra')
const path = require('path');
const Nightmare = require('nightmare');
const nightmare = Nightmare({
    show: false,
})


const HtmlReporter = require('../build/reporter');

let htmlReporter = new HtmlReporter.default({
    debug: true,
    outputDir: './reports/html-reports/',
    filename: 'report.html',
    reportTitle: 'Test Report Title',
    showInBrowser: true
});

//fill data filled by events
htmlReporter._events = {};

htmlReporter.stats = {
    runners: {}
};
htmlReporter.reporters = [];

let testData = {
    cid: '0-0',
    passing: 0,
    failing: 0,
    skipped: 0,
    specs: {
        a: false,
        b: 1
    }
};

describe('html reporter', () => {
    describe('the runner:start event', () => {
        it('should setup an initial state', () => {
            htmlReporter.onRunnerStart({
                cid: '0-0',
                specs: {
                    a: false,
                    b: 1
                }
            });

            htmlReporter.runner.should.eql(testData)

        })
    });

    htmlReporter.suites = {
        "suite-0-0": {
            "type": "suite",
            "start": "2019-03-30T03:45:56.937Z",
            "_duration": 50783,
            "end": "2019-03-30T03:46:47.720Z",
            "uid": "suite-0-0",
            "cid": "0-0",
            "title": "login test suite",
            "fullTitle": "long form login test suite",
            "tests":
                [

                    {
                        "type": "test",
                        "start": "2019-03-30T03:46:03.598Z",
                        "_duration": 13525,
                        "uid": "test-00-0",
                        "cid": "0-0",
                        "title": "user joe can login ",
                        "fullTitle": "login test suite user joe can login ",
                        "output": [],
                        "state": "passed",
                        "passing": 0,
                        "skipped": 0,
                        "failing": 0,
                        "events": [
                            {
                                "type": "log",
                                "value": "Show Login Screen"
                            },
                            {
                                "type": "screenshot",
                                "value": "reports\\html-reports\\screenshots\\20190329-204611.940.png"
                            },
                            {
                                "type": "log",
                                "value": "Login Completed"
                            },
                            {
                                "type": "screenshot",
                                "value": "reports\\html-reports\\screenshots\\20190329-204616.427.png"
                            }
                        ],
                        "errorIndex": 0,
                        "end": "2019-03-30T03:46:17.123Z"
                    },
                    {
                        "type": "test",
                        "start": "2019-03-30T03:46:17.123Z",
                        "_duration": 4558,
                        "uid": "test-00-1",
                        "cid": "0-0",
                        "title": "user lucia can login",
                        "fullTitle": "login test suite user hank can login",
                        "output": [],
                        "state": "passed",
                        "passing": 0,
                        "skipped": 0,
                        "failing": 0,
                        "events": [
                            {
                                "type": "log",
                                "value": "Show Login Screen"
                            },
                            {
                                "type": "screenshot",
                                "value": "reports\\html-reports\\screenshots\\20190329-204618.289.png"
                            },
                            {
                                "type": "log",
                                "value": "Login Completed"
                            },
                            {
                                "type": "screenshot",
                                "value": "reports\\html-reports\\screenshots\\20190329-204620.994.png"
                            }
                        ],
                        "errorIndex": 0,
                        "end": "2019-03-30T03:46:21.681Z"
                    }
                ]
        }
    }
    ;


    htmlReporter.onSuiteStart(htmlReporter.suites["suite-0-0"]);
    htmlReporter.onTestStart(htmlReporter.suites["suite-0-0"].tests[0]);

    describe('the test:pass event', () => {
        it('should increase passing tests', () => {
            htmlReporter.onTestPass(htmlReporter.suites["suite-0-0"].tests[0]);
            htmlReporter.suites["suite-0-0"].tests[0].passing.should.equal(1)
        })
    });


    describe('the test:fail event', () => {
        it('should increase failing tests', () => {
            htmlReporter.onTestFail(htmlReporter.suites["suite-0-0"].tests[1]);
            htmlReporter.suites["suite-0-0"].tests[1].failing.should.equal(1)
        })
    });

    describe('the end event', () => {
        it('should create a html report', () => {

            htmlReporter.onTestEnd(htmlReporter.suites["suite-0-0"].tests[0]);
            htmlReporter.onSuiteEnd(htmlReporter.suites["suite-0-0"]);
            htmlReporter.onRunnerEnd(htmlReporter.stats);
            let reportfile = path.join(htmlReporter.options.outputDir, htmlReporter.suiteUid, htmlReporter.options.filename);
            fs.existsSync(reportfile).should.eql(true)

            nightmare
                .goto(`file://${reportfile}`)
                .evaluate(function () {
                    return {
                        header: document.querySelector('.page-header').innerText
                    }
                })
                .end()
                .then(function (result) {
                    result.header.should.match(/Test HTML Report/)
                })
                .catch(function (error) {
                    console.error('Search failed:', error);
                })
        })
    })
})
