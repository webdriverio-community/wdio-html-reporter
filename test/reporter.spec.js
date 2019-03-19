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
                cid: '0:0',
                specs: {
                    a: false,
                    b: 1
                }
            })

            htmlReporter.results['0:0'].should.eql({
                passing: 0,
                pending: 0,
                failing: 0
            })

            htmlReporter.specs['0:0'].should.eql({
                a: false,
                b: 1
            })
        })
    })


    describe('the test:pass event', () => {
        it('should increase passing tests', () => {
            htmlReporter.onTestPass({
                cid: '0:0'
            })
            htmlReporter.results['0:0'].passing.should.equal(1)
        })
    })

    describe('the test:fail event', () => {
        it('should increase failing tests', () => {
            htmlReporter.onTestFail({
                cid: '0:0'
            })
            htmlReporter.results['0:0'].failing.should.equal(1)
        })
    })

    describe('the end event', () => {
        it('should create a html report', () => {

            let testrunner1 = fs.readFileSync(path.resolve(__dirname, '../test/test1.json'), 'utf8');
            htmlReporter.stats.runners[testrunner1.cid] = testrunner1;
            htmlReporter.onRunnerStart(testrunner1);
            htmlReporter.onTestPass({cid: testrunner1.cid}) ;
            htmlReporter.onTestPass({cid: testrunner1.cid}) ;
            htmlReporter.onTestPass({cid: testrunner1.cid}) ;
            htmlReporter.onTestFail({cid: testrunner1.cid}) ;
            htmlReporter.onRunnerEnd(htmlReporter.stats);
            let reportfile = path.join(htmlReporter.options.outputDir, htmlReporter.options.filename);
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
