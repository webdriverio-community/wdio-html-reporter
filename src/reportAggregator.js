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
const copyFiles_1 = __importDefault(require("./copyFiles"));
const open = require('open');
const fs = require('fs-extra');
const path = require('path');
const log4js = require('@log4js-node/log4js-api');
const timeFormat = "YYYY-MM-DDTHH:mm:ss.SSS[Z]";
function walk(dir, extensions, filelist = []) {
    const files = fs.readdirSync(dir);
    files.forEach(function (file) {
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);
        if (stat.isDirectory()) {
            filelist = walk(filepath, extensions, filelist);
        }
        else {
            extensions.forEach(function (extension) {
                if (file.indexOf(extension) == file.length - extension.length) {
                    filelist.push(filepath);
                }
            });
        }
    });
    return filelist;
}
class ReportAggregator {
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
        this.reports = [];
    }
    readJsonFiles() {
        return walk(this.options.outputDir, [".json"]);
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
    createReport() {
        return __awaiter(this, void 0, void 0, function* () {
            this.options.LOG.info("Report Generation started");
            let metrics = new types_1.Metrics();
            let suites = [];
            let specs = [];
            let files = this.readJsonFiles();
            for (let i = 0; i < files.length; i++) {
                try {
                    let filename = files[i];
                    let report = JSON.parse(fs.readFileSync(filename));
                    if (!report.info || !report.info.specs) {
                        this.options.LOG.error("report structure in question, no info or info.specs ", JSON.stringify(report));
                        this.options.LOG.debug("report content: ", JSON.stringify(report));
                    }
                    report.info.specs.forEach((spec) => {
                        specs.push(spec);
                    });
                    this.reports.push(report);
                }
                catch (ex) {
                    console.error(ex);
                }
            }
            this.reports.sort((report1, report2) => {
                let first = dayjs_1.default.utc(report1.info.start);
                let second = dayjs_1.default.utc(report2.info.start);
                if (first.isAfter(second)) {
                    return 1;
                }
                else if (first.isBefore(second)) {
                    return -1;
                }
                return 0;
            });
            for (let j = 0; j < this.reports.length; j++) {
                try {
                    let report = this.reports[j];
                    metrics.passed += report.metrics.passed;
                    metrics.failed += report.metrics.failed;
                    metrics.skipped += report.metrics.skipped;
                    for (let k = 0; k < report.suites.length; k++) {
                        let suiteInfo = report.suites[k];
                        this.updateSuiteMetrics(metrics, suiteInfo);
                        suites.push(suiteInfo);
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
            if (!this.reports || !this.reports.length) {
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
                this.reports = [];
                this.reports.push(report);
            }
            this.options.LOG.info("Aggregated " + specs.length + " specs, " + suites.length + " suites, ");
            this.reportFile = path.join(process.cwd(), this.options.outputDir, this.options.filename);
            let reportData = new types_1.ReportData(this.options.reportTitle, this.reports[0].info, suites, metrics, this.reportFile, this.options.browserName);
            try {
                yield htmlGenerator_1.default.htmlOutput(this.options, reportData);
                this.options.LOG.info("Report Aggregation completed");
            }
            catch (ex) {
                console.error("Report Aggregation failed: " + ex);
            }
        });
    }
    finalize() {
        return __awaiter(this, void 0, void 0, function* () {
            let jsFiles = path.join(__dirname, '../css/');
            let reportDir = path.join(process.cwd(), this.options.outputDir);
            yield (0, copyFiles_1.default)(jsFiles, reportDir);
            this.options.LOG.info('copyfiles complete : ' + jsFiles + " to " + reportDir);
            if (this.options.showInBrowser) {
                yield open(this.reportFile);
                this.options.LOG.info("browser launched");
            }
        });
    }
}
exports.default = ReportAggregator;
