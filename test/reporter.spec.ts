const fs = require('fs-extra');
const path = require('path');
import {expect} from 'chai';
import {HtmlReporter, ReportAggregator} from '../src/index';
import {RUNNER, SUITES} from './testdata';
const LOG = require ('log4js') ;
LOG.configure({
    appenders: {
        fileLog: {
            type: 'file',
            filename: "logs/html-reporter.log",
            maxLogSize: 5000000,
            level: 'debug'
        },
        debugLog: {
            type: 'file',
            filename: "logs/debug-html-reporter.log",
            maxLogSize: 5000000,
            level: 'debug'
        },
        out: {
            type: 'stdout',
            layout: {
                type: "pattern",
                pattern: "%[[%p]%] - %10.-100f{2} | %7.12l:%7.12o - %[%m%]"
            }
        },
        filterOut: {
            type: 'stdout',
            layout: {
                type: "pattern",
                pattern: "%[[%p]%] - %10.-100f{2} | %7.12l:%7.12o - %[%m%]"
            },
            level: 'info'
        }
    },
    categories: {
        file: {appenders: ['fileLog'], level: 'info'},
        default: {appenders: ['fileLog'], level: 'info'},
        debug: {appenders: ['debugLog'], level: 'debug'}
    }
});



let logger = LOG.getLogger("debug") ;


let reportAggregator : ReportAggregator;

let htmlReporter  = new HtmlReporter({
    outputDir: './reports/html-reports/valid',
    filename: 'report.html',
    reportTitle: 'Unit Test Report Title',
    LOG : logger,
    browserName: "dummy"
});

describe('HtmlReporter', () => {
    before(function () {
        reportAggregator = new ReportAggregator({
            outputDir: './reports/html-reports/valid',
            filename: 'master-report.html',
            reportTitle: 'Master Report',
            browserName : "test browser",
            LOG : logger
        });
        reportAggregator.clean();
    });

    describe('on create', function () {
        it('should verify initial properties', function () {
            expect(Array.isArray(htmlReporter._suiteStats)).to.equal(true);
            expect(htmlReporter._suiteStats.length).to.deep.equal(0);
            expect(htmlReporter._indents).to.equal(0);
            expect(htmlReporter._suiteIndents).to.deep.equal({});
            expect(htmlReporter.defaultTestIndent).to.equal('   ');
            expect(htmlReporter.metrics).to.deep.equal({
                passed: 0,
                skipped: 0,
                failed: 0,
                duration: 0
            });
        })
    });
    describe('onRunnerStart', function () {
        before(function () {
            htmlReporter.onRunnerStart(RUNNER);
        });
        it('should set cid', function () {
            expect(htmlReporter._currentCid).to.equal(RUNNER.cid);
        });
    });
    describe('onSuiteStart', function () {
        before(function () {
            htmlReporter.onSuiteStart(SUITES[0])
        });
        it('should add to suiteUids', function () {
            expect(htmlReporter._suiteUids.size).to.equal(1);
            // expect(htmlReporter._suiteUids[0]).to.equal('Foo test1')
            expect(htmlReporter._currentSuiteUid).to.equal('Foo test1')
        });

        it('should increase suiteIndents', function () {
            expect(htmlReporter._suiteIndents['Foo test1']).to.equal(1)
        })
    });

    describe('onTestStart', function () {
        before(function () {
            htmlReporter.onTestStart(SUITES[0].tests[0])
        });
    });
    describe('onTestPass', function () {
        before(function () {
            htmlReporter.onTestPass(SUITES[0].tests[0])
        });

        it('should increase metrics.passed by 1', function () {
            expect(htmlReporter.metrics.passed).to.equal(1)
        });
        after(function () {
            htmlReporter.onTestEnd(SUITES[0].tests[0])
        });
    });

    describe('onTestStart', function () {
        before(function () {
            htmlReporter.onTestStart(SUITES[0].tests[1])
        });
    });
    describe('onTestFail', function () {
        before(function () {
            htmlReporter.onTestFail(SUITES[0].tests[1])
        });

        it('should increase metrics.failed by 1', function () {
            expect(htmlReporter.metrics.failed).to.equal(1)
        });
        after(function () {
            htmlReporter.onTestEnd(SUITES[0].tests[1])
        });
    });

    describe('onTestStart', function () {
        before(function () {
            htmlReporter.onTestStart(SUITES[0].tests[2])
        });
    });
    describe('onTestSkip', function () {
        before(function () {
            htmlReporter.onTestSkip(SUITES[0].tests[2])
        });

        it('should increase metrics.skipped by 1', function () {
            expect(htmlReporter.metrics.skipped).to.equal(1)
        });
        after(function () {
            htmlReporter.onTestEnd(SUITES[0].tests[2])
        });
    });

    describe('onTestEnd', function () {
        before(function () {
            htmlReporter.onTestEnd(SUITES[0].tests[0]);
            htmlReporter.onTestEnd(SUITES[0].tests[1]);
            htmlReporter.onTestEnd(SUITES[0].tests[2]);
        })

    });


    describe('onSuiteEnd', function () {
        before(function () {
            htmlReporter.onSuiteEnd(SUITES[0])
        });

        it('should decrease indents', function () {
            expect(htmlReporter._indents).to.equal(0)
        });

        it('should add the suite to the suites array', function () {
            expect(htmlReporter._suiteStats.length).to.equal(1)
            // expect(htmlReporter.suites[0]).to.equal(SUITES[0])
        })
    });


    describe('onRunnerEnd', function () {
        it('should call htmlOutput method', function () {
            htmlReporter.onRunnerEnd(RUNNER);
            let reportFile = path.join(process.cwd(), htmlReporter.options.outputDir,  encodeURIComponent(htmlReporter._currentSuiteUid),  encodeURIComponent(htmlReporter._currentCid), htmlReporter.options.filename);
            expect(fs.existsSync(reportFile)).to.equal(true);
        });
        it('should invoke the reportAggregator', function () {
            (async () => {
                await reportAggregator.createReport();
                expect(fs.existsSync(reportAggregator.reportFile)).to.equal(true);
            })();

        })
    });

});
