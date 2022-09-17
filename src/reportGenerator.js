"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const htmlGenerator_1 = __importDefault(require("./htmlGenerator"));
const types_1 = require("./types");
const typescript_string_operations_1 = require("typescript-string-operations");
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
dayjs_1.default.extend(utc_1.default);
const isSameOrBefore_1 = __importDefault(require("dayjs/plugin/isSameOrBefore"));
dayjs_1.default.extend(isSameOrBefore_1.default);
const open = require('open');
const fs = require('fs-extra');
const path = require('path');
const log4js = require('@log4js-node/log4js-api');
const timeFormat = "YYYY-MM-DDTHH:mm:ss.SSS[Z]";
class ReportGenerator {
    constructor(opts) {
        this.reportFile = "";
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
        this.synchronised = true;
    }
    isSynchronised() {
        return this.synchronised;
    }
    updateSuiteMetrics(metrics, suiteInfo) {
        let start = dayjs_1.default.utc(suiteInfo.start);
        if (metrics.start) {
            if (start.isBefore(metrics.start)) {
                metrics.start = start.utc().format(timeFormat);
            }
        }
        else {
            metrics.start = start.utc().format(timeFormat);
        }
        let end = dayjs_1.default.utc(suiteInfo.end);
        if (metrics.end) {
            if (end.isAfter(dayjs_1.default.utc(metrics.end))) {
                metrics.end = end.utc().format(timeFormat);
            }
        }
        else {
            metrics.end = end.utc().format(timeFormat);
        }
        this.options.LOG.info(typescript_string_operations_1.String.Format("Included metrics for suite: {0} {1}", suiteInfo.cid, suiteInfo.uid));
    }
    createReport(reportData) {
        return __awaiter(this, void 0, void 0, function* () {
            this.synchronised = false;
            this.options.LOG.info("Report Generation started");
            let metrics = new types_1.Metrics();
            let suites = reportData.suites;
            let specs = reportData.info.specs;
            // this.reports.sort((report1:any,report2:any) => {
            //     let first = dayjs.utc(report1.info.start);
            //     let second = dayjs.utc(report2.info.start);
            //     if (first.isAfter(second)) {
            //         return 1;
            //     }
            //     else if (first.isBefore(second)) {
            //         return -1;
            //     }
            //     return  0;
            // }) ;
            // if (!this.reports.length) {
            //     this.options.LOG.error(String.Format("Empty report array"));
            // }
            for (let j = 0; j < suites.length; j++) {
                try {
                    let suite = suites[j];
                    this.updateSuiteMetrics(metrics, suite);
                    // metrics.passed += suite.metrics.passed;
                    // metrics.failed += suite.metrics.failed;
                    // metrics.skipped += suite.metrics.skipped;
                    for (let k = 0; k < suite.suites.length; k++) {
                        let suiteInfo = suite.suites[k];
                        this.updateSuiteMetrics(metrics, suiteInfo);
                    }
                }
                catch (ex) {
                    console.error(ex);
                }
            }
            if (!metrics.start || !metrics.end) {
                this.options.LOG.error(typescript_string_operations_1.String.Format("Invalid Metrics computed: {0} -- {1}", metrics.start, metrics.end));
            }
            metrics.duration = dayjs_1.default.duration((0, dayjs_1.default)(metrics.end).utc().diff((0, dayjs_1.default)(metrics.start).utc())).as('milliseconds');
            if (!suites || !suites.length) {
                // the test failed hard at the beginning.  Create a dummy structure to get through html generation
                let report = {
                    "info": {
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
            this.options.LOG.info("Generated " + specs.length + " specs, " + suites.length + " suites, ");
            this.reportFile = path.join(process.cwd(), this.options.outputDir, this.options.filename);
            reportData.reportFile = this.reportFile;
            // if (this.options.removeOutput) {
            //     for (let i = 0; i < suites.length; i++) {
            //         let suite = suites[i].suite;
            //         if (suite && suite.tests) {
            //             for (let j = 0; j < suite.tests.length; j++) {
            //                 let test = suite.tests[j];
            //                 test.output = [];
            //             }
            //         }
            //     }
            // }
            try {
                yield htmlGenerator_1.default.htmlOutput(this.options, reportData);
                this.options.LOG.info("Report Generation completed");
                this.synchronised = true;
            }
            catch (ex) {
                console.error("Report Generation failed: " + ex);
                this.synchronised = true;
            }
        });
    }
}
exports.default = ReportGenerator;
