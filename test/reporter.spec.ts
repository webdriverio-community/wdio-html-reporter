import fs from 'fs-extra';
import path from 'path';
import log4js from 'log4js' ;
import {expect} from 'chai';
import {HtmlReporter, ReportGenerator, ReportAggregator} from '../src/index.js';
import {RUNNER, SUITES} from './testdata.js';

log4js.configure({
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



let logger = log4js.getLogger("debug") ;

let htmlReporter  = new HtmlReporter({
    outputDir: './reports/html-reports/valid',
    filename: 'report.html',
    reportTitle: 'Unit Test Report Title',
    LOG : logger,
    browserName: "dummy"
});
let reportAggregator  = new ReportAggregator({
        outputDir: './reports/html-reports/valid',
        filename: 'master-report.html',
        reportTitle: 'Master Report',
        browserName : "test browser",
        produceJson: true,
        LOG : logger
    });
    reportAggregator.clean();

suite('HtmlReporter', async () => {


   test('on create should verify initial properties', async () => {
        expect(htmlReporter._suiteUids.size).to.deep.equal(0);
        expect(htmlReporter._indents).to.equal(0);
        expect(htmlReporter._suiteIndents).to.deep.equal({});
        expect(htmlReporter.defaultTestIndent).to.equal('   ');
        expect(htmlReporter.metrics).to.deep.equal({
            passed: 0,
            skipped: 0,
            failed: 0,
            duration: 0
        });
    });
    test('onRunnerStart should set cid', async () =>  {
        htmlReporter.onRunnerStart(RUNNER);
        expect(htmlReporter._currentCid).to.equal(RUNNER.cid);
     });
    test('onSuiteStart should add to suiteUids', async () =>  {
        htmlReporter.onSuiteStart(SUITES[0])
        expect(htmlReporter._suiteUids.size).to.equal(1);
        // expect(htmlReporter._suiteUids[0]).to.equal('Foo test1')
        expect(htmlReporter._currentSuiteUid).to.equal('Foo test1')
        expect(htmlReporter._suiteIndents['Foo test1']).to.equal(1)
    });

    test('onTestStart', async () =>  {
        htmlReporter.onTestStart(SUITES[0].tests[0])
    });
    test('onTestPass', async () =>  {
        htmlReporter.onTestPass(SUITES[0].tests[0])
        expect(htmlReporter.metrics.passed).to.equal(1)
        htmlReporter.onTestEnd(SUITES[0].tests[0])
    });

    test('onTestStart', async () =>  {
        htmlReporter.onTestStart(SUITES[0].tests[1])
    });
    test('onTestFail', async () =>  {
        htmlReporter.onTestFail(SUITES[0].tests[1])
        expect(htmlReporter.metrics.failed).to.equal(1)
        htmlReporter.onTestEnd(SUITES[0].tests[1])
    });

    test('onTestStart', async () =>  {
        htmlReporter.onTestStart(SUITES[0].tests[2])
    });
    test('onTestSkip', async () =>  {
        htmlReporter.onTestSkip(SUITES[0].tests[2])
        expect(htmlReporter.metrics.skipped).to.equal(1)
        htmlReporter.onTestEnd(SUITES[0].tests[2])
    });

    test('onTestEnd', async () =>  {
        htmlReporter.onTestEnd(SUITES[0].tests[0]);
        htmlReporter.onTestEnd(SUITES[0].tests[1]);
        htmlReporter.onTestEnd(SUITES[0].tests[2]);
    });


    test('onSuiteEnd', async () =>  {
        htmlReporter.onSuiteEnd(SUITES[0])

        test('should decrease indents', async () =>  {
            expect(htmlReporter._indents).to.equal(0)
        });

        test('should add the suite to the suites array', async () =>  {
            expect(htmlReporter._suiteUids.size).to.equal(1)
        })
    });

    test('call reportAggregator', async () =>  {
        await htmlReporter.onRunnerEnd(RUNNER);
        await reportAggregator.createReport();
        expect(fs.existsSync(reportAggregator.reportFile)).to.equal(true);
    });

});
