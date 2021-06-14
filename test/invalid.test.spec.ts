const fs = require('fs-extra');
const path = require('path');
import {expect} from 'chai';
import {HtmlReporter, ReportAggregator} from '../src/index';
import {RUNNER, SUITES} from './testdata';
const log4js = require ('log4js') ;

log4js.configure({ // configure to use all types in different files.
    appenders: {
        fileLog: {
            type: 'file',
            filename: "logs/console.log"
        },
        'out': {
            type: 'stdout',
            layout: {type: 'basic'}
        }
    },
    categories: {
        file: {appenders: ['fileLog'], level: 'debug'},
        default: {appenders: ['out', 'fileLog'], level: 'debug'}
    }
});

let logger = log4js.getLogger("default") ;
let reportAggregator : ReportAggregator;

let htmlReporter  = new HtmlReporter({
    logFile: './logs/reporter.log',
    outputDir: './reports/html-reports/invalid/',
    filename: 'report.html',
    reportTitle: 'Unit Test Report Title',
    showInBrowser: false,
    browserName: "dummy",
    LOG : logger,
    collapseTests: true,
    templateFilename: path.resolve(__dirname, '../templates/wdio-html-reporter-template.hbs'),
    useOnAfterCommandForScreenshot: false
});

describe('HtmlReporter', () => {
    before(function () {
        reportAggregator = new ReportAggregator({
            debug: false,
            outputDir: './reports/html-reports/invalid/',
            filename: 'master-report.html',
            reportTitle: 'Master Report',
            browserName : "test browser",
            templateFilename: path.resolve(__dirname, '../templates/wdio-html-reporter-template.hbs'),
            showInBrowser: true,
            collapseTests: false,
            LOG : logger,
            useOnAfterCommandForScreenshot: false
        });
        reportAggregator.clean();
    });
    //
    // describe('on create', function () {
    //     it('should verify initial properties', function () {
    //         expect(Array.isArray(htmlReporter.suiteUids)).to.equal(true);
    //         expect(htmlReporter.suiteUids.length).to.equal(0);
    //         expect(Array.isArray(htmlReporter.suites)).to.equal(true);
    //         expect(htmlReporter.suites.length).to.deep.equal(0);
    //         expect(htmlReporter.indents).to.equal(0);
    //         expect(htmlReporter.suiteIndents).to.deep.equal({});
    //         expect(htmlReporter.defaultTestIndent).to.equal('   ');
    //         expect(htmlReporter.metrics).to.deep.equal({
    //             passed: 0,
    //             skipped: 0,
    //             failed: 0,
    //             start: 0,
    //             end: 0,
    //             duration: 0
    //         });
    //     })
    // });
    describe('onRunnerStart', function () {
        before(function () {
            htmlReporter.onRunnerStart(RUNNER);
        });
        //This will fail.
        it('fail to set cid test', function () {
            expect(htmlReporter._currentCid).to.be.null;
        });
    });
    describe('onRunnerEnd', function () {
        it('should call htmlOutput method', function () {
            htmlReporter.onRunnerEnd(RUNNER);
            let reportFile = path.join(process.cwd(), htmlReporter.options.outputDir, encodeURIComponent(htmlReporter._currentSuiteUid), encodeURIComponent(htmlReporter._currentCid), htmlReporter.options.filename);
            expect(fs.existsSync(reportFile)).to.equal(true);
            //wipe out output
            fs.emptyDirSync(path.join(process.cwd(), htmlReporter.options.outputDir, encodeURIComponent(htmlReporter._currentSuiteUid), encodeURIComponent(htmlReporter._currentCid)));
        });
        it('should invoke the reportAggregator', function () {
            (async () => {
                await reportAggregator.createReport();
                expect(fs.existsSync(reportAggregator.reportFile)).to.equal(true);
            })();

        })
    });

});
