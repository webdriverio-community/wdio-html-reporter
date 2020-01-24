import WDIOReporter from '@wdio/reporter'
import HtmlGenerator from './htmlGenerator'

const fs = require('fs-extra');
const _ = require('lodash');
const path = require('path');
const moment = require('moment');
const momentDurationFormatSetup = require("moment-duration-format");
momentDurationFormatSetup(moment);
const logger = require('log4js');
const log4js = require('@log4js-node/log4js-api');
const ReportEvents  = require("@rpii/wdio-report-events") ;
let proxy = new ReportEvents.default() ;

class HtmlReporter extends WDIOReporter {


    constructor(opts) {
        opts = Object.assign({}, {
            stdout: true,
            outputDir: 'reports/html-reports/',
            filename: 'report.html',
            templateFilename: path.resolve(__dirname, '../src/wdio-html-reporter-template.hbs'),
            templateFuncs: {},
            reportTitle: 'Test Report Title',
            showInBrowser: false,
            useOnAfterCommandForScreenshot: true,
            LOG : null
        }, opts);
        super(opts);
        this.options = opts;
        if (!this.options.LOG) {
            this.options.LOG = logger.getLogger("default") ;
        }
        const dir = this.options.outputDir + 'screenshots' ;

        fs.ensureDirSync(dir) ;
        this.suiteUids = [];
        this.suites = [];
        this.indents = 0;
        this.suiteIndents = {};
        this.metrics = {
            passed : 0,
            skipped : 0,
            failed : 0,
            start: 0,
            end: 0 ,
            duration:0
        };
        this.openInProgress = false;
        this.defaultTestIndent = '   ' ;
        proxy.connectMessageEvent(this.saveMessage.bind(this));
        proxy.connectScreenshotEvent(this.saveScreenshot.bind(this));

    }

    get isSynchronised () {
        return !this.openInProgress ;
    }

    onRunnerStart(runner) {
        this.log("onRunnerStart: " , JSON.stringify(runner));
        //todo look at fix, not async safe. but one cid per report file
        this.cid = runner.cid;
        this.metrics.passed = 0;
        this.metrics.skipped = 0;
        this.metrics.failed = 0;
    }

    onSuiteStart(suite) {
        this.suiteUids.push(suite.uid);
        this.suiteIndents[suite.uid] = ++this.indents;
        this.suiteUid = suite.uid;
        let thisSuite = Object.assign({}, suite);
        thisSuite.type = 'suite';
        this.suites.push(thisSuite);
        this.log("onSuiteStart: ", JSON.stringify(thisSuite));
    }

    onTestStart(theTest) {
        this.log("onTestStart: " , JSON.stringify(theTest));
        this.testUid = theTest.uid ;
        let test = this.getTest(theTest.uid) ;
        test.events = [];
        test.errorIndex = 0 ;
    }

    onTestPass(test) {
        this.log("onTestPass: " , JSON.stringify(test));
        this.metrics.passed++;
    }

    onTestSkip(test) {
        this.log("onTestSkip: " , JSON.stringify(test));
        this.metrics.skipped++;
    }

    onTestFail(test) {
        this.log("onTestFail: " , JSON.stringify(test));
        this.moveErrorsToEvents(test);
        this.metrics.failed++;
    }

    onHookEnd(hook) {
        if (hook.error) {
            this.metrics.failed++;
        }
    }
    onTestEnd(theTest) {
        this.log("onTestEnd: " , JSON.stringify(theTest));
        let test = this.getTest(theTest.uid) ;
        this.moveErrorsToEvents(test) ;
    }

    onSuiteEnd(suite) {
        this.log("onSuiteEnd: " , JSON.stringify(suite));
        this.indents--;
    }

    isScreenshotCommand(command) {
        const isScreenshotEndpoint = /\/session\/[^/]*\/screenshot/
        return isScreenshotEndpoint.test(command.endpoint)
    }

    //this is a hack to get around lack of onScreenshot event
    onAfterCommand(command) {
        if (this.options.useOnAfterCommandForScreenshot) {
            if (this.isScreenshotCommand(command) && command.result.value) {

                const timestamp = moment().format('YYYYMMDD-HHmmss.SSS');
                const filepath = path.join(this.options.outputDir, '/screenshots/', this.cid, timestamp, this.options.filename + '.png');
                this.log("onAfterCommand: taking screenshot " + filepath);
                fs.outputFileSync(filepath, Buffer.from(command.result.value, 'base64'));

                let test = this.getTest(this.testUid);
                test.events.push({type: 'screenshot', value: filepath});
            }
        }
    }

    log(message,object) {
        if (this.options.LOG || this.options.debug ) {
            this.options.LOG.debug(message + object) ;
        }
    }
    getSuite(uid) {
        for (let i = 0 ; i < this.suites.length ; i++) {
            if (uid === this.suites[i].uid) {
                return this.suites[i] ;
            }
        }
        return null;
    }

    getTest(uid) {
        let suite = this.getSuite(this.suiteUid);
        for (let i = 0 ; i < suite.tests.length ; i++) {
            if (uid === suite.tests[i].uid) {
                return suite.tests[i] ;
            }
        }
        return null;
    }

    //this is a hack.  we have to move all the things in test.errors before they get blown away

    moveErrorsToEvents(test) {
        if (test.errors) {
            for (let i = test.errorIndex; i < test.errors.length; i++) {
                test.events.push({type: 'Error', ...test.errors[i]});
            }
            test.errorIndex = test.errors.length;
        }
    }

    saveScreenshot(filepath) {
        let test = this.getTest(this.testUid) ;
        this.moveErrorsToEvents(test) ;
        test.events.push({type: 'screenshot', value: filepath}) ;
    }

    saveMessage(message) {
        const test = this.getTest(this.testUid);
        this.moveErrorsToEvents(test) ;
        test.events.push({type: 'log', value: message}) ;
    }


    getOrderedSuites() {
        if (this.orderedSuites) {
            return this.orderedSuites;
        }

        this.orderedSuites = [];

        for (const uid of this.suiteUids) {
            for (const suite of this.suites) {
                if (suite.uid !== uid) {
                    continue;
                }

                this.orderedSuites.push(suite);
            }
        }

        return this.orderedSuites;
    }

// convert to a style class
    indent(uid) {
        const indents = this.suiteIndents[uid];
        return indents === 0 ? '' : Array(indents).join('    ');
    }

    onRunnerEnd(runner) {
        let self = this ;
        this.log("onRunnerEnd: " , JSON.stringify(runner));
        self.openInProgress = true;
        self.metrics.start = runner.start ;
        self.metrics.end = runner.end ;
        self.metrics.duration = runner._duration;

        const reportOptions = {
            data : {
                info: runner,
                metrics: self.metrics,
                suites: self.getOrderedSuites(),
                title: self.options.reportTitle
            },
            showInBrowser : self.options.showInBrowser,
            outputDir : self.options.outputDir,
            reportFile : path.join(process.cwd(), self.options.outputDir, self.suiteUid , self.cid, self.options.filename),
            templateFilename: self.options.templateFilename,
            templateFuncs: self.options.templateFuncs,
        };
        HtmlGenerator.htmlOutput(reportOptions,() => {
            self.openInProgress = false  ;
        })
    }

}

export default HtmlReporter;
