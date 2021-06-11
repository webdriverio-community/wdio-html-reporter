import HtmlGenerator from "./htmlGenerator";
import {HtmlReporterOptions, Metrics, ReportData} from "./types";

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);

const open = require('open');
const copyfiles = require("copyfiles");
const fs = require('fs-extra');
const path = require('path');
const log4js = require('@log4js-node/log4js-api');

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
            templateFilename: path.resolve(__dirname, '../templates/wdio-html-reporter-template.hbs'),
            browserName: "not specified",
            collapseTests: false,
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

    clean() {
        fs.emptyDirSync(this.options.outputDir);
    }


    readJsonFiles() {
        return walk(this.options.outputDir, [".json"]);
    }


    log(message:string , object:any) {
        this.options.LOG.debug(message + object) ;
    }
    async createReport() {
        this.options.LOG.debug("Report Aggregation started");
        let metrics = new Metrics () ;

        let suites = [];
        let specs : string[] =  [];

        let files = this.readJsonFiles();

        for (let i = 0; i < files.length; i++) {
            try {
                let filename = files[i];
                let report = JSON.parse(fs.readFileSync(filename));
                if (!report.info || !report.info.specs) {
                    this.options.LOG.error("report structure in question, no info or info.specs " , JSON.stringify(report));
                    this.options.LOG.info("report content: " , JSON.stringify(report));
                }
                report.info.specs.forEach((spec:any) => {
                    specs.push(spec) ;
                });


                this.reports.push(report);
                metrics.passed += report.metrics.passed;
                metrics.failed += report.metrics.failed;
                metrics.skipped += report.metrics.skipped;
                metrics.start = dayjs().utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
                metrics.end = dayjs("2021-01-01").utc().format();
                for (let k = 0; k < report.suites.length; k++) {
                    let suiteInfo = report.suites[k] ;
                    let start = dayjs.utc(suiteInfo.suite.start) ;
                    if ( start.isSameOrBefore(metrics.start)) {
                        metrics.start = start.utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]") ;
                    }
                    let end = dayjs.utc(suiteInfo.suite.end) ;
                    if ( end.isAfter(dayjs.utc(metrics.end))) {
                        metrics.end = end.utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]") ;
                    }

                    suites.push(suiteInfo);
                }
            } catch (ex) {
                console.error(ex);
            }

        }
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
        metrics.duration = dayjs.duration(dayjs(metrics.end).utc().diff(dayjs(metrics.start).utc())).as('milliseconds');

        this.options.LOG.debug("Aggregated " + specs.length + " specs, " + suites.length + " suites, " + this.reports.length + " reports, ");
        this.reportFile = path.join(process.cwd(), this.options.outputDir, this.options.filename);
        if (this.options.removeOutput) {
            for (let i = 0; i < suites.length; i++) {
                let suite = suites[i].suite;
                for (let j = 0; j < suite.tests.length; j++) {
                    let test = suite.tests[j];
                    test.output = [];
                }
                let tests = suites[i].tests;
                for (let k = 0; k < tests.length; k++) {
                    let test = tests[k];
                    test.testStats.output = [];
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

        this.options.LOG.debug("Report Aggregation completed");
        let jsFiles = path.join(__dirname, '../css/*.*');
        let reportDir = path.join(process.cwd(), this.options.outputDir);
        copyfiles( [jsFiles, reportDir] , true,
            () => {
                this.options.LOG.info( 'copyfiles complete : ' + jsFiles  + " to " + reportDir) ;
                try {
                    if (this.options.showInBrowser) {

                        let childProcess = open(reportData.reportFile);
                        childProcess.then(
                            () => {
                                this.options.LOG.info('browser launched');
                            },
                            (error:any) => {
                                this.options.LOG.error('showInBrowser error spawning :' + reportData.reportFile + " " + error.toString());
                            })
                    }
                } catch (ex) {
                    this.options.LOG.error('Error opening browser:' + ex);
                }
            }
        )

    }


}

export default ReportAggregator;
