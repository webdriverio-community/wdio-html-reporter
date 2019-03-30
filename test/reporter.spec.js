// import sinon from 'sinon'
// import expect from 'chai'
const should = require('chai').should()

const fs = require('fs-extra')
const path = require('path');
const Nightmare = require('nightmare');
const nightmare = Nightmare({
    show: false,
})

const SUITE = require('./fixtures').SUITE
const RESULTLIST = require('./fixtures').RESULTLIST;

const HtmlReporter = require('../build/reporter');

let htmlReporter = new HtmlReporter.default({
    debug: true,
    outputDir: './reports/html-results/',
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
    cid: '0:0',
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
            "start": "2019-03-28T20:15:25.300Z",
            "_duration": 45499,
            "uid": "suite-0-0",
            "cid": "0-0",
            "title": "login test suite",
            "fullTitle": "long form login test suite",
            "tests":
                [
                    {
                        "type": "test",
                        "start": "2019-03-28T20:15:25.300Z",
                        "_duration": 8370,
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
                                "value": "reports\\html-reports\\screenshots\\20190328-131529.630.png"
                            },
                            {
                                "type": "log",
                                "value": "Login Completed"
                            },
                            {
                                "type": "screenshot",
                                "value": "reports\\html-reports\\screenshots\\20190328-131533.047.png"
                            }
                        ],
                        "errorIndex": 0,
                        "end": "2019-03-28T20:15:33.670Z"
                    }
                ]
        }
    };


    htmlReporter.onSuiteStart(htmlReporter.suites["suite-0-0"]);
    htmlReporter.onTestStart(htmlReporter.suites["suite-0-0"].tests[0]);

    // describe('the test:pass event', () => {
    //     it('should increase passing tests', () => {
    //         htmlReporter.onTestPass(testData);
    //         htmlReporter.results['0-0'].passing.should.equal(1)
    //     })
    // })
    //
    // describe('the test:fail event', () => {
    //     it('should increase failing tests', () => {
    //         htmlReporter.onTestFail(testData);
    //         htmlReporter.results['0-0'].failing.should.equal(1)
    //     })
    // })

    describe('the end event', () => {
        it('should create a html report', () => {

            htmlReporter.onTestEnd(htmlReporter.suites["suite-0-0"].tests[0]);
            htmlReporter.onSuiteEnd(htmlReporter.suites["suite-0-0"]);
            htmlReporter.onRunnerEnd(htmlReporter.stats);
            let reportfile = path.join(htmlReporter.options.outputDir, htmlReporter.cid, htmlReporter.options.filename);
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
