const fs = require('fs-extra');
const path = require('path');
import {expect} from 'chai';
import {HtmlReporter, ReportGenerator, ReportAggregator} from '../src/index';
const log4js = require ('log4js') ;

log4js.configure({ // configure to use all types in different files.
    appenders: {
        fileLog: {
            type: 'file',
            filename: "logs/console.log"
        },
        'out': {
            type: 'stdout',
            layout: {
                type: "colored"
            },
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

    outputDir: './reports/html-reports/',
    filename: 'report.html',
    reportTitle: 'Unit Test Report Title',
    showInBrowser: false,
    browserName: "dummy",
    LOG : logger,
    collapseTests: true,
    useOnAfterCommandForScreenshot: false
});

reportAggregator = new ReportAggregator({
    debug: false,
    outputDir: './reports/html-reports',
    filename: 'master-report.html',
    reportTitle: 'Master Report',
    browserName : "test browser",
    showInBrowser: true,
    collapseTests: false,
    LOG : logger,
    useOnAfterCommandForScreenshot: false
});
reportAggregator.clean();

describe('Suite 1', () => {

    describe('Suite 2', () => {
        it('test 1', async () => {
            console.log('test 1 block');
        });

        it('test 2', async () => {
            console.log('test 2 block');
        });
    });

    describe('Suite 3', () => {
        it('test 3', async () => {
            console.log('test 3 block');
        });

        describe('Suite 4', () => {
            describe('Suite 5', () => {
                it('test 5', async() => {
                    console.log('test 5 block');
                });
            });
        });
    });
});

function after () {
    (async () => {
        await reportAggregator.createReport();
        expect(fs.existsSync(reportAggregator.reportFile)).to.equal(true);
    })();
};

after() ;