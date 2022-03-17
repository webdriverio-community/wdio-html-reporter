import {Reporters} from "@wdio/types";
import {RunnerStats, SuiteStats} from "@wdio/reporter";
import internal from "stream";

export class HtmlReporterOptions implements Reporters.Options  {
    outputDir: string;
    filename: string;
    reportTitle: string;
    pr: string;
    showInBrowser?: boolean | undefined;
    collapseTests?: boolean | undefined;
    collapseSuites?: boolean | undefined;
    useOnAfterCommandForScreenshot?: boolean | undefined;
    LOG?: any ;
    debug ?: boolean | undefined;
    browserName:string;
    removeOutput?: boolean | undefined;
    linkScreenshots?: boolean ;


    constructor() {
        this.outputDir = "";
        this.filename =  "";
        this.reportTitle =  "Please add a Title";
        this.pr = "";
        this.showInBrowser = false;
        this.collapseTests = false;
        this.collapseSuites = false;
        this.useOnAfterCommandForScreenshot = false;
        this.LOG = null ;
        this.debug = false;
        this.browserName = "not specified" ;
        this.removeOutput = true ;
        this.linkScreenshots = false ;
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