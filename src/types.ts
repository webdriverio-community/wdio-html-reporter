import {Reporters} from "@wdio/types";
import {RunnerStats, SuiteStats, TestStats} from "@wdio/reporter";
import {Test} from "@wdio/reporter/build/stats/test";
import {Dayjs} from "dayjs";

export class HtmlReporterOptions implements Reporters.Options  {
    outputDir: string;
    filename: string;
    templateFilename: string;
    templateFuncs: object;
    reportTitle: string;
    showInBrowser: boolean;
    collapseTests: boolean;
    useOnAfterCommandForScreenshot: boolean;
    logFile: string;
    LOG?: any ;
    debug : boolean;
    browserName:string;
    removeOutput: boolean;

    constructor() {
        this.outputDir = "";
        this.filename =  "";
        this.templateFilename=  "";
        this.templateFuncs = {};
        this.reportTitle=  "";
        this.showInBrowser = false;
        this.collapseTests = false;
        this.useOnAfterCommandForScreenshot = false;
        this.logFile = "";
        this.LOG =  undefined;
        this.debug = false;
        this.browserName = "" ;
        this.removeOutput = true ;
    }
}

export class Metrics   {
    passed : number;
    skipped : number;
    failed : number;
    start: string ;
    end: string ;
    duration: number  ;

    constructor() {
        this.passed = 0;
        this.skipped = 0;
        this.failed = 0;
        this.start = "";
        this.end = "";
        this.duration = 0 ;
    }
}

export class SuiteInfo   {
    suite : SuiteStats;
    type : string ;
    tests: TestInfo[] ;
    constructor(type : string, suiteStats : SuiteStats) {
        this.type = type;
        this.suite = suiteStats;
        this.tests = [];
    }

}
export class TestInfo   {
    testStats: TestStats;
    events : InternalReportEvent[];
    errorIndex:number;
    constructor(test:TestStats) {
        this.testStats = test;
        this.events = [];
        this.errorIndex=0;
    }

}

export class InternalReportEvent  {
    type: string ;
    value: any;

    constructor(type: string, value: any) {
       this.type = type;
       this.value = value;
    }

}

export class ReportData {
    info: RunnerStats;
    metrics: Metrics;
    suites: SuiteInfo[];
    title: string;
    reportFile: string ;
    browserName: string;
    constructor(title: string, info: RunnerStats, suites: SuiteInfo[], metrics: Metrics, reportFile:string, browserName :string) {
        this.info = info;
        this.metrics = metrics;
        this.title = title;
        this.suites = suites;
        this.reportFile = reportFile;
        this.browserName = browserName;
    }
}