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
import {HtmlReporterOptions, InternalReportEvent, Metrics, ReportData } from "./types";
import dayjs from 'dayjs';
import ReportEvents from "@rpii/wdio-report-events" ;
import { String } from 'typescript-string-operations';

const fs = require('fs-extra');
const path = require('path');
const log4js = require('@log4js-node/log4js-api');

let proxy = new ReportEvents() ;

export default class HtmlReporter extends WDIOReporter {
    options: HtmlReporterOptions;
    openInProgress:boolean;
    defaultTestIndent:string;
    metrics:Metrics;
    _indents : number;
    _suiteIndents: Record<string, number> = {};
    _suiteUids = new Set();
    _suiteStats: SuiteStats[] ;
    _currentSuiteUid: string;
    _currentTestUid: string;
    _currentCid: string;
    _orderedSuites: SuiteStats[] = [];

    constructor(options: HtmlReporterOptions) {
        super(Object.assign(
            {
                stdout: true,
                logFile: './logs/reporter.log',
            }, options))
        let opts =
            {
                stdout: true,
                outputDir: 'reports/html-reports/',
                filename: 'report.html',
                reportTitle: 'Test Report Title',
                useOnAfterCommandForScreenshot: true
            };

        this.options = Object.assign(opts, options);
        if (!this.options.LOG) {
            this.options.LOG = log4js.getLogger(this.options.debug ? 'debug' : 'default' );;
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
        this.options.LOG.info(String.Format("onRunnerStart: {0}", runner.cid)) ;
        this.options.LOG.debug( JSON.stringify(runner));
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
        this.pushSuite(suite) ;
        this.options.LOG.info(String.Format("onSuiteStart: {0}:{1}", suite.cid, suite.uid)) ;
        this.options.LOG.debug(JSON.stringify(suite));
    }

    onTestStart(theTest :TestStats) {
        this.options.LOG.info(String.Format("onTestStart: {0}:{1}", theTest.cid, theTest.uid)) ;
        this.options.LOG.debug(JSON.stringify(theTest));
        this._currentTestUid = theTest.uid ;

        this.pushTest(theTest) ;
        //@ts-ignore
        theTest.events = [];
        //@ts-ignore
        theTest.errorIndex = 0;
      }

    onTestPass(theTest :TestStats) {
        this.options.LOG.info(String.Format("onTestPass: {0}:{1}", theTest.cid, theTest.uid)) ;
        this.options.LOG.debug(JSON.stringify(theTest));
        let test = this.getTest(theTest.uid) ;
        if (test) {
            this.moveErrorsToEvents(test);
        }
        this.metrics.passed++;
    }

    onTestSkip(test : TestStats) {
        this.options.LOG.info(String.Format("onTestSkip: {0}:{1}", test.cid, test.uid)) ;
        this.options.LOG.debug(JSON.stringify(test));
        this.metrics.skipped++;
    }

    onTestFail(theTest :TestStats) {
        this.options.LOG.info(String.Format("onTestFail: {0}:{1}", theTest.cid, theTest.uid)) ;
        this.options.LOG.debug(JSON.stringify(theTest));
        let test = this.getTest(theTest.uid) ;
        if (test) {
            this.moveErrorsToEvents(test);
        }
        this.metrics.failed++;
    }

    onTestEnd(theTest :TestStats) {
        this.options.LOG.info(String.Format("onTestEnd: {0}:{1}", theTest.cid, theTest.uid)) ;
        this.options.LOG.debug(JSON.stringify(theTest));
        let test = this.getTest(theTest.uid) ;
        if (test) {
            this.moveErrorsToEvents(test);
        }
    }
    onHookStart(hook: HookStats) {
        this.options.LOG.info(String.Format("onHookStart: {0}:{1}", hook.cid, hook.uid)) ;
    }

    onHookEnd(hook: HookStats) {
        this.options.LOG.info(String.Format("onHookEnd: {0}:{1}", hook.cid, hook.uid)) ;
        if (hook.error) {
            this.metrics.failed++;
        }
    }
    onSuiteEnd(suite : SuiteStats  ) {
        this.options.LOG.info(String.Format("onSuiteEnd: {0}:{1}", suite.cid, suite.uid)) ;
        this.options.LOG.debug(JSON.stringify(suite));
        this._indents--;
        // this is to display suite end time and duration in master report.
        for (const suiteInfo of this._suiteStats) {
            if (suiteInfo.uid == suite.uid) {
                suiteInfo.end = suite.end;
                suiteInfo._duration = suite._duration;
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
                this.options.LOG.info(String.Format("onAfterCommand: {0}:{1} taking screenshot {2}" , this._currentCid, this._currentTestUid, filepath));
                fs.outputFileSync(filepath, Buffer.from(command.result.value, 'base64'));

                let test = this.getTest(this._currentTestUid);
                if (test) {
                    //@ts-ignore
                    test.events.push({type: 'screenshot', value: filepath});
                }
            }
        }
    }

    onRunnerEnd(runner: RunnerStats) {
        this.options.LOG.info(String.Format("onRunnerEnd: {0}", runner.cid)) ;
        this.options.LOG.debug(JSON.stringify(runner));
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
        this.filterSuites(this._suiteStats) ;
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

    getSuite(uid:string|undefined) : SuiteStats | undefined {
        if (uid) {
            for (let i = 0; i < this._suiteStats.length; i++) {
                if (uid === this._suiteStats[i].uid) {
                    return this._suiteStats[i];
                }
            }
        }
        return undefined ;
    }
    pushSuite(suite:SuiteStats ) {
        let suiteInfo = this.getSuite(suite.uid);
        if (suiteInfo) {
            suiteInfo = suite;
        } else {
            this._suiteStats.push(suite);
        }
    }
    removeSuite(uid:string|undefined)  {
        if (uid) {
            for (let i = this._suiteStats.length-1; i >= 0; i--) {
                if (uid === this._suiteStats[i].uid) {
                    this._suiteStats.splice(i,1);
                    break;
                }
            }
        }
    }
    getTest(uid:string ) : TestStats | undefined {
        let suiteInfo = this.getSuite(this._currentSuiteUid);
        if (suiteInfo) {
            for (let i = 0; i < suiteInfo.tests.length; i++) {
                if (uid === suiteInfo.tests[i].uid) {
                    return suiteInfo.tests[i];
                }
            }
        }
        return undefined ;
    }
    pushTest(test:TestStats ) {
        let suiteInfo = this.getSuite(this._currentSuiteUid);
        if (suiteInfo) {
            let existingTest = this.getTest(test.uid) ;
            if (existingTest) {
                existingTest = test;
            } else {
                suiteInfo.tests.push(test);
            }
        }
    }
    //this is a hack.  we have to move all the things in test.errors before they get blown away

    moveErrorsToEvents(test: TestStats) {
        if (test.errors) {
            //@ts-ignore
            for (let i = test.errorIndex; i < test.errors.length; i++) {
                let errorObj = test.errors[i];
                let stack = test.errors[i].stack ;
                if (stack && stack.includes("AssertionError")) {
                  errorObj = {
                    //@ts-ignore
                    message: test.errors[i].message.split("      \n").shift(),
                    stack: test.errors[i].stack,
                  };
                }
                //@ts-ignore
                test.events.push(new InternalReportEvent('Error', errorObj));
            }
            //@ts-ignore
            test.errorIndex = test.errors.length;
        }
    }

    saveScreenshot(filepath:string) {
        let test = this.getTest(this._currentTestUid) ;
        if (test) {
            this.moveErrorsToEvents(test);
            //@ts-ignore
            test.events.push(new InternalReportEvent('screenshot', filepath));
        }
    }

    saveMessage(message:string) {
        const test = this.getTest(this._currentTestUid);
        if (test) {
            this.moveErrorsToEvents(test);
            //@ts-ignore
            test.events.push({type: 'log', value: message});
        }
    }

    filterSuites(suites:SuiteStats[]) {
        for (let i = suites.length-1; i >= 0; i--) {
            let parentSuite = suites[i];
            if (parentSuite.type === 'feature') {
                for (let k= parentSuite.suites.length-1; k >= 0; k--) {
                    let suite = parentSuite.suites[k] ;
                    if (suite.type === 'scenario') {
                        this.removeSuite(suite.uid) ;
                    }
                }
            }
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
                if (suite.uid !== uid) {
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

