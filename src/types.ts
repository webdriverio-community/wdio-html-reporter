import {Reporters} from "@wdio/types";
import {RunnerStats, SuiteStats, TestStats} from "@wdio/reporter";

export class HtmlReporterOptions implements Reporters.Options  {
    outputDir: string;
    filename: string;
    reportTitle: string;
    templateFilename?: string | undefined;
    templateFuncs?: object | undefined;
    showInBrowser?: boolean | undefined;
    collapseTests?: boolean | undefined;
    collapseSuites?: boolean | undefined;
    useOnAfterCommandForScreenshot?: boolean | undefined;
    LOG?: any ;
    debug ?: boolean | undefined;
    browserName:string;
    removeOutput?: boolean | undefined;

    constructor() {
        this.outputDir = "";
        this.filename =  "";
        this.templateFilename = "";
        this.templateFuncs = {};
        this.reportTitle =  "Please add a Title";
        this.showInBrowser = false;
        this.collapseTests = false;
        this.collapseSuites = false;
        this.useOnAfterCommandForScreenshot = false;
        this.LOG = null ;
        this.debug = false;
        this.browserName = "not specified" ;
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