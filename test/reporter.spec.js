
const fs = require('fs-extra');
const path = require('path');
const Nightmare = require('nightmare');
import {expect} from 'chai';
const nightmare = Nightmare({
    show: false,
})

import {
    RUNNER,
    SUITE_UIDS,
    SUITES,
    SUITES_NO_TESTS,
    SUITES_NO_TESTS_WITH_HOOK_ERROR,
    SUITES_MULTIPLE_ERRORS
} from './testdata';

const HtmlReporter = require('../build/reporter');

let htmlReporter = null;

describe('HtmlReporter', () => {
    before(function ()  {
        htmlReporter = new HtmlReporter.default({
            debug: true,
            outputDir: './reports/html-reports/',
            filename: 'report.html',
            reportTitle: 'Test Report Title',
            showInBrowser: true
        });
 
    })
    
    describe('on create', function ()  {
        it('should verify initial properties', function ()  {
            expect(Array.isArray(htmlReporter.suiteUids)).to.equal(true);
            expect(htmlReporter.suiteUids.length).to.equal(0);
            expect(Array.isArray(htmlReporter.suites)).to.equal(true);
            expect(htmlReporter.suites.length).to.deep.equal(0);
            expect(htmlReporter.indents).to.equal(0);
            expect(htmlReporter.suiteIndents).to.deep.equal({});
            expect(htmlReporter.defaultTestIndent).to.equal('   ');
            expect(htmlReporter.metrics).to.deep.equal({
                passed : 0,
                skipped : 0,
                failed : 0
            });
        })
    });
    describe('onRunnerStart', function ()  {
        before(function ()  {
            htmlReporter.onRunnerStart(RUNNER);
        });
        it('should set cid', function ()  {
            expect(htmlReporter.cid).to.equal(RUNNER.cid);
        });
    });
    describe('onSuiteStart', function ()  {
        before(function ()  {
            htmlReporter.onSuiteStart(SUITES[0])
        });
        it('should add to suiteUids', function ()  {
            expect(htmlReporter.suiteUids.length).to.equal(1);
            expect(htmlReporter.suiteUids[0]).to.equal('Foo test1')
        });

        it('should increase suiteIndents', function ()  {
            expect(htmlReporter.suiteIndents['Foo test1']).to.equal(1)
        })
    });


    describe('onTestPass', function ()  {
        before(function ()  {
            htmlReporter.onTestPass(SUITES[0].tests[0])
        });

        it('should increase metrics.passed by 1', function ()  {
            expect(htmlReporter.metrics.passed).to.equal(1)
        })
    });

    describe('onTestFail', function ()  {
        before(function ()  {
            htmlReporter.onTestFail(SUITES[0].tests[1])
        });

        it('should increase metrics.failed by 1', function ()  {
            expect(htmlReporter.metrics.failed).to.equal(1)
        });
    });

    describe('onTestSkip', function ()  {
        before(function ()  {
            htmlReporter.onTestSkip(SUITES[0].tests[2])
        });

        it('should increase metrics.skipped by 1', function ()  {
            expect(htmlReporter.metrics.skipped).to.equal(1)
        });
    });

    describe('onTestEnd', function ()  {
        before(function ()  {
            htmlReporter.onTestEnd(SUITES[0].tests[0]);
            htmlReporter.onTestEnd(SUITES[0].tests[1]);
            htmlReporter.onTestEnd(SUITES[0].tests[2]);            
        })

    });

    
    describe('onSuiteEnd', function ()  {
        before(function ()  {
            htmlReporter.onSuiteEnd(SUITES[0])
        });

        it('should decrease indents', function ()  {
            expect(htmlReporter.indents).to.equal(0)
        });

        it('should add the suite to the suites array', function ()  {
            expect(htmlReporter.suites.length).to.equal(1)
            expect(htmlReporter.suites[0]).to.equal(SUITES[0])
        })
    });


    describe('onRunnerEnd', function ()  {
        it('should call htmlOutput method', function ()  {
            htmlReporter.onRunnerEnd(RUNNER)
            let reportfile = path.join(htmlReporter.options.outputDir, htmlReporter.suiteUid, htmlReporter.cid, htmlReporter.options.filename);
            expect(fs.existsSync(reportfile)).to.equal(true);

            // nightmare
            //     .goto(`file://${reportfile}`)
            //     .evaluate(function () {
            //         return {
            //             header: document.querySelector('.page-header').innerText
            //         }
            //     })
            //     .end()
            //     .then(function (result) {
            //         result.header.should.match(/Test HTML Report/)
            //     })
            //     .catch(function (error) {
            //         console.error('Search failed:', error);
            //     })
        })
    })
});
