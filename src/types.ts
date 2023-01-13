import type {
    SuiteStats, Tag, HookStats, RunnerStats } from "@wdio/reporter";
import type { Reporters, Capabilities, Options } from '@wdio/types';

export class HtmlReporterOptions implements Reporters.Options  {
    outputDir: string;
    filename: string;
    reportTitle: string;
    showInBrowser?: boolean | undefined;
    collapseTests?: boolean;
    collapseSuites?: boolean;
    useOnAfterCommandForScreenshot?: boolean | undefined;
    LOG?: any ;
    debug ?: boolean | undefined;
    browserName:string;
    removeOutput?: boolean | undefined;
    linkScreenshots?: boolean ;
    produceJson?:boolean | undefined;

    constructor() {
        this.outputDir = 'reports/html-reports/';
        this.filename =  'report.html';
        this.reportTitle =  'Test Report Title';
        this.showInBrowser = false;
        this.collapseTests = false;
        this.collapseSuites = false;
        this.useOnAfterCommandForScreenshot = false;
        this.LOG = null ;
        this.debug = false;
        this.browserName = "not specified" ;
        this.removeOutput = true ;
        this.linkScreenshots = false ;
        this.collapseTests = false ;
        this.collapseSuites = false ;
        this.produceJson = true ;
    }
}

export class Metrics   {
    passed : number;
    skipped : number;
    failed : number;
    start?: string ;
    end?: string ;
    duration: number  ;

    constructor() {
        this.passed = 0;
        this.skipped = 0;
        this.failed = 0;
        this.duration = 0 ;
    }
}

interface TestStats   {
    events : InternalReportEvent[];
    errorIndex:number;
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
    suites: SuiteStats[];
    // specs: RunnerStats[] ;
    title: string;
    reportFile: string ;
    browserName: string;
    constructor(title: string, info: RunnerStats, suites: SuiteStats[], metrics: Metrics, reportFile:string, browserName :string) {
        this.info = info;
        this.metrics = metrics;
        this.title = title;
        this.suites = suites;
        this.reportFile = reportFile;
        this.browserName = browserName;
    }
}