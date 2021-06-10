import WDIOReporter, {
    SuiteStats,
    HookStats,
    RunnerStats,
    TestStats,
    Argument,
    AfterCommandArgs,
    CommandArgs
} from '@wdio/reporter'

import HtmlGenerator from './htmlGenerator'
import {HtmlReporterOptions, InternalReportEvent, Metrics, ReportData, SuiteInfo, TestInfo} from "./types";
import dayjs from 'dayjs';
import ReportEvents from "@rpii/wdio-report-events" ;

const fs = require('fs-extra');
const path = require('path');
const log4js = require('@log4js-node/log4js-api');

let proxy = new ReportEvents() ;

class HtmlReporter extends WDIOReporter {
    options: HtmlReporterOptions;
    openInProgress:boolean;
    defaultTestIndent:string;
    metrics:Metrics;
    _indents : number;
    _suiteIndents: Record<string, number> = {};
    _suiteUids = new Set();
    _suiteStats: SuiteInfo[] ;
    _currentSuiteUid: string;
    _currentTestUid: string;
    _currentCid: string;
    _orderedSuites: SuiteInfo[] = [];

    constructor(options: HtmlReporterOptions) {
        super(Object.assign({ stdout: true }, options))
        let opts =
            {
                stdout: true,
                outputDir: 'reports/html-reports/',
                filename: 'report.html',
                templateFilename: path.resolve(__dirname, '../templates/wdio-html-reporter-template.hbs'),
                reportTitle: 'Test Report Title',
                showInBrowser: false,
                collapseTests: false,
                useOnAfterCommandForScreenshot: true,
                logFile: "logs/reporter.log",
                LOG: null
            };

        this.options = Object.assign(opts, options);
        if (!this.options.LOG) {
            this.options.LOG =  log4js.getLogger(this.options.debug ? 'debug' : 'default' );;
        }

        const dir = this.options.outputDir + 'screenshots';

        fs.ensureDirSync(dir);
        this._indents = 0;
        this._suiteIndents = {};
        this._suiteStats = [];
        this.metrics = new Metrics();
        this.openInProgress = false;
        this.defaultTestIndent = '   ';
        this._currentSuiteUid = "suite uid";
        this._currentTestUid = "test uid";
        this._currentCid = "cid";
        proxy.connectMessageEvent(this.saveMessage.bind(this));
        proxy.connectScreenshotEvent(this.saveScreenshot.bind(this))
    }

    get isSynchronised () {
        return !this.openInProgress ;
    }

    onRunnerStart(runner: RunnerStats) {
        this.log("onRunnerStart: " , JSON.stringify(runner));
        //todo look at fix, not async safe. but one cid per report file
        this._currentCid = runner.cid;
        this.metrics.passed = 0;
        this.metrics.skipped = 0;
        this.metrics.failed = 0;
        this.metrics.start =  dayjs().utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]") ;
    }

    onSuiteStart(suite: SuiteStats) {
        this._suiteUids.add(suite.uid)
        if (suite.type === 'feature') {
            this._indents = 0
            this._suiteIndents[suite.uid] = this._indents
        } else {
            this._suiteIndents[suite.uid] = ++this._indents
        }
        this._currentSuiteUid = suite.uid;
        let thisSuite = new SuiteInfo('suite', suite);
        this._suiteStats.push(thisSuite);
        this.log("onSuiteStart: ", JSON.stringify(thisSuite));
    }

    onTestStart(theTest :TestStats) {
        this.log("onTestStart: " , JSON.stringify(theTest));
        this._currentTestUid = theTest.uid ;

        let test = new TestInfo(theTest) ;
        this.pushTest(test) ;
            test.events = [];
            test.errorIndex = 0;
      }

    onTestPass(test :TestStats) {
        this.log("onTestPass: " , JSON.stringify(test));
        this.metrics.passed++;
    }

    onTestSkip(test : TestStats) {
        this.log("onTestSkip: " , JSON.stringify(test));
        this.metrics.skipped++;
    }

    onTestFail(theTest :TestStats) {
        this.log("onTestFail: " , JSON.stringify(theTest));
        let test = this.getTest(theTest.uid) ;
        if (test) {
            this.moveErrorsToEvents(test);
        }
        this.metrics.failed++;
    }

    onTestEnd(theTest :TestStats) {
        this.log("onTestEnd: " , JSON.stringify(theTest));
        let test = this.getTest(theTest.uid) ;
        if (test) {
            this.moveErrorsToEvents(test);
        }
    }

    onHookEnd(hook: HookStats) {
        if (hook.error) {
            this.metrics.failed++;
        }
    }
    onSuiteEnd(suite : SuiteStats  ) {
        this.log("onSuiteEnd: " , JSON.stringify(suite));
        this._indents--;
        // this is to display suite end time and duration in master report.
        for (const suiteInfo of this._suiteStats) {
            if (suiteInfo.suite.uid == suite.uid) {
                suiteInfo.suite.end = suite.end;
                suiteInfo.suite._duration = suite._duration;
                break;
            }
        }
    }

    isScreenshotCommand(command:CommandArgs) {
        const isScreenshotEndpoint = /\/session\/[^/]*(\/element\/[^/]*)?\/screenshot/
        return (
            // WebDriver protocol
            (command.endpoint && isScreenshotEndpoint.test(command.endpoint)) ||
            // DevTools protocol
            command.command === 'takeScreenshot'
        );

    }

    //this is a hack to get around lack of onScreenshot event
    onAfterCommand(command :AfterCommandArgs) {
        if (this.options.useOnAfterCommandForScreenshot) {
            if (this.isScreenshotCommand(command) && command.result.value) {
                let timestamp = dayjs().format('YYYYMMDD-HHmmss.SSS');
                const filepath = path.join(this.options.outputDir, '/screenshots/', encodeURIComponent(this._currentCid), timestamp, this.options.filename + '.png');
                this.log("onAfterCommand: taking screenshot " , filepath);
                fs.outputFileSync(filepath, Buffer.from(command.result.value, 'base64'));

                let test = this.getTest(this._currentTestUid);
                if (test) {
                    test.events.push({type: 'screenshot', value: filepath});
                }
            }
        }
    }

    onRunnerEnd(runner: RunnerStats) {
        this.log("onRunnerEnd: " , JSON.stringify(runner));
        this.openInProgress = true;
        this.metrics.end = dayjs().utc().format() ;
        this.metrics.duration = runner._duration;
        //error handling protection
        if (! this._currentSuiteUid) {
            this._currentSuiteUid = "suite";
        }
        if (! this._currentCid) {
            this._currentCid = "cid" ;
        }

        let reportFile = path.join(process.cwd(), this.options.outputDir, encodeURIComponent(this._currentSuiteUid) , encodeURIComponent(this._currentCid), this.options.filename);
        let reportData = new ReportData(
            this.options.reportTitle,
            runner,
            this.getOrderedSuites(),
            this.metrics,
            reportFile,
            this.options.browserName) ;

        HtmlGenerator.htmlOutput(this.options,reportData,() => {
            this.openInProgress = false  ;
        })
    }

    log(message:string, object:any ) {
        if (this.options.LOG || this.options.debug ) {
            this.options.LOG.debug(message + object) ;
        }
    }

    getSuite(uid:string|undefined) : SuiteInfo | undefined {
        if (uid) {
            for (let i = 0; i < this._suiteStats.length; i++) {
                if (uid === this._suiteStats[i].suite.uid) {
                    return this._suiteStats[i];
                }
            }
        }
        return undefined ;
    }

    getTest(uid:string ) : TestInfo | undefined {
        let suiteInfo = this.getSuite(this._currentSuiteUid);
        if (suiteInfo) {
            for (let i = 0; i < suiteInfo.tests.length; i++) {
                if (uid === suiteInfo.tests[i].testStats.uid) {
                    return suiteInfo.tests[i];
                }
            }
        }
        return undefined ;
    }
    pushTest(test:TestInfo ) {
        let suiteInfo = this.getSuite(this._currentSuiteUid);
        if (suiteInfo) {
            suiteInfo.tests.push(test) ;
        }
    }
    //this is a hack.  we have to move all the things in test.errors before they get blown away

    moveErrorsToEvents(test: TestInfo) {
        if (test.testStats.errors) {
            for (let i = test.errorIndex; i < test.testStats.errors.length; i++) {
                test.events.push(new InternalReportEvent('Error', test.testStats.errors[i]));
            }
            test.errorIndex = test.testStats.errors.length;
        }
    }

    saveScreenshot(filepath:string) {
        let test = this.getTest(this._currentTestUid) ;
        if (test) {
            this.moveErrorsToEvents(test);
            test.events.push(new InternalReportEvent('screenshot', filepath));
        }
    }

    saveMessage(message:string) {
        const test = this.getTest(this._currentTestUid);
        if (test) {
            this.moveErrorsToEvents(test);
            test.events.push({type: 'log', value: message});
        }
    }

    /**
     * Get suites in the order they were called
     * @return {Array} Ordered suites
     */
    getOrderedSuites () {
        if (this._orderedSuites.length) {
            return this._orderedSuites
        }

        this._orderedSuites = [];
        for (const uid of this._suiteUids) {
            for (const  suite of this._suiteStats) {
                if (suite.suite.uid !== uid) {
                    continue;
                }
                this._orderedSuites.push(suite);
            }
        }
        return this._orderedSuites;
    }

    indent(uid:string ) {
        const indents = this._suiteIndents[uid];
        return indents === 0 ? '' : Array(indents).join('    ');
    }


}

export default HtmlReporter;
