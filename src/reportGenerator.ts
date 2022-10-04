import HtmlGenerator from "./htmlGenerator";
import {HtmlReporterOptions, Metrics, ReportData} from "./types";
import {String } from 'typescript-string-operations';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);
import {SuiteStats} from "@wdio/reporter";
const open = require('open');
const fs = require('fs-extra');
const path = require('path');
const log4js = require('@log4js-node/log4js-api');
const timeFormat ="YYYY-MM-DDTHH:mm:ss.SSS[Z]";


class ReportGenerator {

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
        this.synchronised = true ;
    }
    public options: HtmlReporterOptions;
    public reportFile : string = "";
    public synchronised : boolean ;

    isSynchronised() {
        return this.synchronised  ;
    }
    updateSuiteMetrics(metrics: Metrics, suiteInfo : SuiteStats)
    {
        // metrics.passed += suite.metrics.passed;
        // metrics.failed += suite.metrics.failed;
        // metrics.skipped += suite.metrics.skipped;
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
        this.options.LOG.info(String.format("Included metrics for suite: {0} {1}" , suiteInfo.cid, suiteInfo.uid) );
    }

    async createReport(reportData: ReportData ) {
        this.synchronised = false ;
        this.options.LOG.info("Report Generation started");
        let metrics = new Metrics () ;

        let suites = reportData.suites ;
        let specs : string[] =  reportData.info.specs;

        for (let j = 0; j < suites.length; j++) {
            try {
                let suite = suites[j];
                this.updateSuiteMetrics(metrics, suite) ;

                for (let k = 0; k < suite.suites.length; k++) {
                    let suiteInfo = suite.suites[k];
                    this.updateSuiteMetrics(metrics, suiteInfo) ;
                }

            } catch (ex) {
                console.error(ex);
            }
        }
        if (!metrics.start || !metrics.end) {
            this.options.LOG.error(String.format("Invalid Metrics computed: {0} -- {1}" , metrics.start, metrics.end));
        }
        metrics.duration = dayjs.duration(dayjs(metrics.end).utc().diff(dayjs(metrics.start).utc())).as('milliseconds');

        if (!suites || ! suites.length ) {
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
        }

        this.options.LOG.info("Generated " + specs.length + " specs, " + suites.length + " suites, " );
        this.reportFile = path.join(process.cwd(), this.options.outputDir, this.options.filename);
        reportData.reportFile = this.reportFile ;

        try {
            reportData.reportFile = reportData.reportFile.replace('.html', String.format('-{0}.html',reportData.info.cid));
            await HtmlGenerator.htmlOutput(this.options,reportData) ;
            this.options.LOG.info("Report Generation completed");
            this.synchronised = true ;

        } catch (ex) {
            console.error("Report Generation failed: " + ex);
            this.synchronised = true ;
        }
    }


}

export default ReportGenerator;

