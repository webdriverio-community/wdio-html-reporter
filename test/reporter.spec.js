 // import sinon from 'sinon'
// import expect from 'chai'
const should = require('chai').should()
const HtmlReporter = require('../lib/reporter')
const fs = require('fs-extra')
const path = require('path');
const Nightmare = require('nightmare');
const nightmare = Nightmare({
  show: false,
})
const sleep = require('sleep')
// const moment = require('moment')
// import {
//     SUITE, COLORS, RESULTLIST, SUMMARY, ERRORS, ERRORLIST,
//     STATS, STATS_WITH_NO_SPECS, SUITERESULT, JOBLINKRESULT,
//     ERRORS_NO_STACK, ERRORLIST_NO_STACK, SUITES_SUMMARY,
//     STATS_WITH_MULTIPLE_RUNNERS
// } from './fixtures'
const SUITE = require('./fixtures').SUITE
const RESULTLIST = require('./fixtures').RESULTLIST

const baseReporter = {
    _events: {

    },
    stats: {
      runners: {

      }
    },
    reporters: [

    ]
}
const reporter = new HtmlReporter(baseReporter)

describe('html reporter', () => {
  describe('the runner:start event', () => {
    it('should setup an initial state', () => {
      reporter.emit('runner:start', {
        cid: 42,
        specs: {
          a: false,
          b: 1
        }
      })

      reporter.results['42'].should.eql({
        passing: 0,
        pending: 0,
        failing: 0
      })

      reporter.specs['42'].should.eql({
        a: false,
        b: 1
      })
    })
  })

  describe('the test:pending event', () => {
    it('should increase pending tests', () => {
      reporter.emit('test:pending', {
        cid: 42
      })
      reporter.results[42].pending.should.equal(1)
    })
  })

  describe('the test:pass event', () => {
    it('should increase passing tests', () => {
      reporter.emit('test:pass', {
        cid: 42
      })
      reporter.results[42].passing.should.equal(1)
    })
  })

  describe('the test:fail event', () => {
    it('should increase failing tests', () => {
      reporter.emit('test:fail', {
        cid: 42
      })
      reporter.results[42].failing.should.equal(1)
    })
  })

  describe('the end event', () => {
    it('should create a html report', () => {
      const testrunner1 = {
        type: 'runner',
        cid: 42,
        specs: {
          abcdef123456: {
            type: 'spec',
            start: Date.now(),
            end: Date.now(),
            _duration: 123456,
            specHash: 'abcdef123456',
            files: ['file1.spec'],
            suites: {
              'test suite1': {
                type: 'suite',
                start: Date.now(),
                end: Date.now(),
                _duration: 123456,
                uid: 'test case1',
                title: "Test Case 1",
                tests: {
                  'First Test': {
                    type: 'test',
                    title: 'The first test title',
                    state: 'pass',
                    screenshots: [],
                    logit: [],
                  },
                  'Second Test': {
                    type: 'test',
                    title: 'The second test title',
                    state: 'fail',
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
                    state: 'pass',
                    screenshots: [],
                    logit: [],
                  },
                },
              },
            },
          },
        },
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
                    state: 'pass',
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
      }



      baseReporter.stats.runners['42'] = testrunner1
      baseReporter.stats.runners['43'] = testrunner2
      baseReporter.stats.counts = {
        passes: 2,
        pending: 1,
        failures: 1
      }
      reporter.emit('runner:start', testrunner1)
      reporter.emit('runner:start', testrunner2)
      reporter.emit('end', {})

      fs.existsSync('spec-report.html').should.eql(true)
      sleep.sleep(1)

      // fs.removeSync('spec-report.html')

      nightmare
        .goto(`file://${__dirname}/../spec-report.html`)
        // .type('#search_form_input_homepage', 'github nightmare')
        // .click('#search_button_homepage')
        // .wait('.result__title a')
        .evaluate(function() {
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
