import HtmlGenerator from "./htmlGenerator";
import {HtmlReporterOptions, Metrics, ReportData} from "./types";
import {String } from 'typescript-string-operations';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);
import copyFiles from "./copyFiles";
import {SuiteStats} from "@wdio/reporter";
const open = require('open');
const fs = require('fs-extra');
const path = require('path');
const log4js = require('@log4js-node/log4js-api');
const timeFormat ="YYYY-MM-DDTHH:mm:ss.SSS[Z]";

function  walk(dir:string, extensions: string[] , filelist: string[] = []) {
    const files = fs.readdirSync(dir);


    files.forEach(function (file : string) {
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);

        if (stat.isDirectory()) {
            filelist = walk(filepath, extensions, filelist);
        } else {
            extensions.forEach(function (extension: string) {
                if (file.indexOf(extension) == file.length - extension.length) {
                    filelist.push(filepath);
                }
            });
        }
    });

    return filelist;
}

class ReportAggregator {

    constructor(opts: HtmlReporterOptions) {
        opts = Object.assign({}, {
            outputDir: 'reports/html-reports/',
            filename: 'master-report.html',
            reportTitle: 'Test Master Report',
            showInBrowser: false,
            browserName: "not specified",
            collapseTests: false,
            collapseSuites: false,
            LOG: null,
            removeOutput: true
        }, opts);
        this.options = opts;
        if (!this.options.LOG) {
            this.options.LOG = log4js.getLogger(this.options.debug ? 'debug' : 'default');
        }
        this.reports = [];
    }
    public options: HtmlReporterOptions;
    public reports: any[];
    public reportFile : string = "";
    _orderedSuites: SuiteStats[] = [];

    clean() {
        fs.emptyDirSync(this.options.outputDir);
    }


    readJsonFiles() {
        return walk(this.options.outputDir, [".json"]);
    }

    async createReport() {
        this.options.LOG.info("Report Aggregation started");
        let metrics = new Metrics () ;

        let suites = [];
        let specs : string[] =  [];

        let files = this.readJsonFiles();

        for (let i = 0; i < files.length; i++) {
            try {
                let filename = files[i];
                let report = JSON.parse(fs.readFileSync(filename));
                if (!report.info || !report.info.specs) {
                    this.options.LOG.error("report structure in question, no info or info.specs ", JSON.stringify(report));
                }
                report.info.specs.forEach((spec: any) => {
                    specs.push(spec);
                });
                this.reports.push(report);
            } catch (ex) {
                console.error(ex);
            }
        }

        this.reports.sort((report1:any,report2:any) => {
            let first = dayjs.utc(report1.info.start);
            let second = dayjs.utc(report2.info.start);
            if (first.isAfter(second)) {
                return 1;
            }
            else if (first.isBefore(second)) {
                return -1;
            }
            return  0;
        }) ;

        for (let j = 0; j < this.reports.length; j++) {
            try {
                let report = this.reports[j];
                metrics.passed += report.metrics.passed;
                metrics.failed += report.metrics.failed;
                metrics.skipped += report.metrics.skipped;
                for (let k = 0; k < report.suites.length; k++) {
                    let suiteInfo = report.suites[k];
                    let start = dayjs.utc(suiteInfo.start);
                    if (metrics.start) {
                        if (start.isBefore(metrics.start)) {
                            metrics.start = start.utc().format(timeFormat);
                        }
                    } else {
                        metrics.start = start.utc().format(timeFormat);
                    }
                    let end = dayjs.utc(suiteInfo.end);
                    if (metrics.end) {
                        if (end.isAfter(dayjs.utc(metrics.end))) {
                        metrics.end = end.utc().format(timeFormat);
                        }
                    } else {
                        metrics.end = end.utc().format(timeFormat);
                    }
                    suites.push(suiteInfo);
                }
            } catch (ex) {
                console.error(ex);
            }
        }
        if (!metrics.start || !metrics.end) {
            this.options.LOG.error(String.Format("Invalid Metrics computed: {0} -- {1}" , metrics.start, metrics.end));
        }
        metrics.duration = dayjs.duration(dayjs(metrics.end).utc().diff(dayjs(metrics.start).utc())).as('milliseconds');

        if (!this.reports || !this.reports.length ) {
            // the test failed hard at the beginning.  Create a dummy structure to get through html generation
            let report = {
                "info" : {
                    "cid": "The execution of the test suite has failed before report generation was started.  Please look at the logs to determine the error, this is likely an issue with your configuration files.",
                    "config": {
                        "hostname": "localhost"
                    },
                    "specs": [],
                    "suites": [
                        {
                            "uid": "Test Start Failure",
                            "title": "Test Start Failure",
                            "type": "suite",
                            "tests": [],
                        }
                    ]
                }
            };
            this.reports = [] ;
            this.reports.push(report);
        }

        this.options.LOG.info("Aggregated " + specs.length + " specs, " + suites.length + " suites, " + this.reports.length + " reports, ");
        this.reportFile = path.join(process.cwd(), this.options.outputDir, this.options.filename);
        if (this.options.removeOutput) {
            for (let i = 0; i < suites.length; i++) {
                let suite = suites[i].suite;
                if (suite && suite.tests) {
                    for (let j = 0; j < suite.tests.length; j++) {
                        let test = suite.tests[j];
                        test.output = [];
                    }
                }
            }
        }
        let reportData = new ReportData(
            this.options.reportTitle,
            this.reports[0].info,
            suites,
            metrics,
            this.reportFile,
            this.options.browserName) ;

        HtmlGenerator.htmlOutput(this.options,reportData) ;

        this.options.LOG.info("Report Aggregation completed");
        let jsFiles = path.join(__dirname, '../css/');
        let reportDir = path.join(process.cwd(), this.options.outputDir);
        await copyFiles( jsFiles, reportDir ) ;
        this.options.LOG.info( 'copyfiles complete : ' + jsFiles  + " to " + reportDir) ;
        try {
            if (this.options.showInBrowser) {
                let childProcess = await open(reportData.reportFile
                    // ,{ app:
                    //         {
                    //         name: 'google chrome',
                    //         arguments: ['--incognito']
                    //         }
                    // }
                    );
                this.options.LOG.info('browser launched');
            }
        } catch (ex) {
            this.options.LOG.error('Error opening browser:' + ex);
        }
    }
}

export default ReportAggregator;