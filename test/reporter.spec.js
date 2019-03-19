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


describe('html reporter', () => {
    describe('the runner:start event', () => {
        it('should setup an initial state', () => {
            htmlReporter.onRunnerStart({
                cid: 42,
                specs: {
                    a: false,
                    b: 1
                }
            })

            htmlReporter.results['42'].should.eql({
                passing: 0,
                pending: 0,
                failing: 0
            })

            htmlReporter.specs['42'].should.eql({
                a: false,
                b: 1
            })
        })
    })


    describe('the test:pass event', () => {
        it('should increase passing tests', () => {
            htmlReporter.onTestPass({
                cid: 42
            })
            htmlReporter.results[42].passing.should.equal(1)
        })
    })

    describe('the test:fail event', () => {
        it('should increase failing tests', () => {
            htmlReporter.onTestFail({
                cid: 42
            })
            htmlReporter.results[42].failing.should.equal(1)
        })
    })

    describe('the end event', () => {
        it('should create a html report', () => {
            const testrunner1 = {
                type: 'runner',
                cid: "42",
                "specs": [
                    "C:\\Users\\rpii\\Development\\test\\wdio-sync\\test\\login.spec.js"
                ],
                type: 'spec',
                start: Date.now(),
                end: Date.now(),
                suites: {
                    'test suite1': {
                        type: 'suite',
                        start: Date.now(),
                        end: Date.now(),
                        _duration: 123456,
                        uid: 'test case1',
                        title: "Test Case 1",
                        fullTitle: "Test Case 1",
                        tests: {
                            'First Test': {
                                type: 'test',
                                title: 'The first test title',
                                cid: 42,
                                state: 'passing',
                                output: []
                            },
                            'Second Test': {
                                type: 'test',
                                title: 'The second test title',
                                state: 'failing',
                                output: [{type: 'log', output: 'this is a log message'}]
                            },
                            'Third Test': {
                                type: 'test',
                                title: 'The thried test title',
                                state: 'pending',
                                output: []
                            }
                        }
                    },
                    'test suite2': {
                        type: 'suite',
                        start: Date.now(),
                        end: Date.now(),
                        _duration: 123456,
                        uid: 'test case2',
                        title: "Test Case 2",
                        tests: {
                            'First Test': {
                                type: 'test',
                                title: 'The first test title',
                                state: 'passing',
                                output: []
                            }
                        }
                    }
                },

                "results": {
                    "42": {
                        "passing": 4,
                        "pending": 4,
                        "failing": 0
                    }
                },

                "title": "Test Report Title"
            }

            const testrunner2 = {
                type: 'runner',
                cid: 43,
                specs: {
                    '654321FEDCBA': {
                        type: 'spec',
                        start: Date.now(),
                        end: Date.now(),
                        _duration: 123456,
                        specHash: '654321FEDCBA',
                        files: ['file2.spec'],
                        suites: {
                            'test suite3': {
                                type: 'suite',
                                start: Date.now(),
                                end: Date.now(),
                                _duration: 123456,
                                uid: 'test case1',
                                title: "Test Case 3",
                                tests: {
                                    'First Test': {
                                        type: 'test',
                                        title: 'The first test title',
                                        state: 'passing',
                                        screenshots: [],
                                        logit: [],
                                    },
                                    'Second Test': {
                                        type: 'test',
                                        title: 'The second test title',
                                        state: 'pending',
                                        screenshots: [],
                                        logit: [],
                                    },
                                    'Third Test': {
                                        type: 'test',
                                        title: 'The thried test title',
                                        state: 'pending',
                                        screenshots: [],
                                        logit: [],
                                    },
                                },
                            },
                        },
                    },
                },
            };


            htmlReporter.stats.runners['42'] = testrunner1;
            htmlReporter.stats.runners['43'] = testrunner2;
            htmlReporter.stats.counts = {
                passes: 2,
                pending: 1,
                failures: 1
            };
            htmlReporter.onRunnerStart(testrunner1);
            htmlReporter.onRunnerStart(testrunner2);
            htmlReporter.onRunnerEnd(htmlReporter.stats);
            let reportfile = path.join(htmlReporter.options.outputDir, htmlReporter.options.filename);
            fs.existsSync(reportfile).should.eql(true)

            nightmare
                .goto(`file://${reportfile}`)
                // .type('#search_form_input_homepage', 'github nightmare')
                // .click('#search_button_homepage')
                // .wait('.result__title a')
                .evaluate(function () {
                    return {
                        header: document.querySelector('.page-header').innerText
                    }
                })
                .end()
                .then(function (result) {
                    result.header.should.match(/HTML Report/)
                })
                .catch(function (error) {
                    console.error('Search failed:', error);
                })
        })
    })

    // describe('getResultList', () => {
    //     it('return a correct result list', () => {
    //         reporter.errorCount = 27
    //         reporter.suiteIndents[0] = {
    //             'some foobar test': 0,
    //             'some other foobar test': 1,
    //             'some spec title': 0
    //         }
    //         reporter.getResultList(0, SUITE, 'kuckkuck> ').should.be.equal(RESULTLIST)
    //     })
    // })


    //
    // describe('getSummary', () => {
    //     it('should return correct summary', () => {
    //         reporter.getSummary({
    //             passing: 3,
    //             pending: 1,
    //             failing: 2
    //         }, 139000, 'kuckkuck> ').should.be.equal(SUMMARY)
    //     })
    //
    //     it('should skip if the count is zero', () => {
    //         reporter.getSummary({
    //             passing: 0
    //         }, 139000, 'kuckkuck> ').should.be.equal('')
    //     })
    // })
    //
    // describe('getFailureList', () => {
    //     it('should return correct failure list', () => {
    //         reporter.getFailureList(ERRORS, 'kuckkuck> ').should.be.equal(ERRORLIST)
    //     })
    //
    //     it('should handle error messages without a stack trace correctly', () => {
    //         reporter.getFailureList(ERRORS_NO_STACK, 'kuckkuck> ').should.be.equal(ERRORLIST_NO_STACK)
    //     })
    // })
    //
    // describe('getJobLink', () => {
    //     it('should return nothing if host is not specified', () => {
    //         reporter.getJobLink({ config: {} }).should.be.equal('')
    //     })
    //
    //     it('should return nothing if host is not known', () => {
    //         reporter.getJobLink({ config: { host: 'localhost' } }).should.be.equal('')
    //     })
    //
    //     it('should display job link if host is saucelabs', () => {
    //         reporter.getJobLink({
    //             config: { host: 'ondemand.saucelabs.com' },
    //             sessionID: '12345-12345-12345'
    //         }, 'kuckkuck> ').should.be.equal(JOBLINKRESULT)
    //     })
    // })
    //
    // describe('printSuiteResult', () => {
    //     let origConsoleLog
    //
    //     before(() => {
    //         origConsoleLog = console.log
    //     })
    //
    //     beforeEach(() => {
    //         console.log = sinon.spy()
    //     })
    //
    //     afterEach(() => {
    //         console.log = origConsoleLog
    //     })
    //
    //     it('should print correct suite result', () => {
    //         reporter.specs = { '22': '/path/to/spec.js' }
    //         reporter.baseReporter.stats = STATS
    //         reporter.getResultList = () => ''
    //         reporter.getSummary = () => ''
    //         reporter.getFailureList = () => ''
    //         reporter.getJobLink = () => ''
    //
    //         reporter.printSuiteResult({ cid: 22 })
    //         const wasCalledCorrectly = console.log.calledWith(SUITERESULT)
    //
    //         wasCalledCorrectly.should.be.ok()
    //     })
    //
    //     it('should not print anything if no spec got executed', () => {
    //         reporter.specs = { '22': '/path/to/spec.js' }
    //         reporter.baseReporter.stats = STATS_WITH_NO_SPECS
    //         reporter.getResultList = () => ''
    //         reporter.getSummary = () => ''
    //         reporter.getFailureList = () => ''
    //         reporter.getJobLink = () => ''
    //
    //         reporter.printSuiteResult({ cid: 22 })
    //         const wasCalledCorrectly = console.log.calledWith('')
    //
    //         wasCalledCorrectly.should.be.ok()
    //     })
    // })
    //
    // describe('printSuitesSummary', () => {
    //     let origConsoleLog
    //
    //     before(() => {
    //         origConsoleLog = console.log
    //     })
    //
    //     beforeEach(() => {
    //         console.log = sinon.spy()
    //     })
    //
    //     afterEach(() => {
    //         console.log = origConsoleLog
    //     })
    //
    //     it('should print summary of how many specs where run', () => {
    //         reporter.baseReporter.stats = STATS_WITH_MULTIPLE_RUNNERS
    //         reporter.baseReporter.epilogue = () => console.log('foobar')
    //
    //         reporter.printSuitesSummary()
    //         const wasCalledCorrectly = console.log.calledWith(SUITES_SUMMARY)
    //
    //         wasCalledCorrectly.should.be.ok()
    //     })
    //
    //     it('should not print summary if only one spec was run', () => {
    //         reporter.baseReporter.stats = STATS
    //         reporter.baseReporter.epilogue = () => console.log('foobar')
    //
    //         reporter.printSuitesSummary()
    //         const callCount = console.log.callCount
    //
    //         callCount.should.be.equal(0)
    //     })
    // })
})
