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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var htmlGenerator_js_1 = require("./htmlGenerator.js");
var types_js_1 = require("./types.js");
var typescript_string_operations_1 = require("typescript-string-operations");
var dayjs_1 = require("dayjs");
var utc_js_1 = require("dayjs/plugin/utc.js");
dayjs_1["default"].extend(utc_js_1["default"]);
var isSameOrBefore_js_1 = require("dayjs/plugin/isSameOrBefore.js");
dayjs_1["default"].extend(isSameOrBefore_js_1["default"]);
var copyFiles_js_1 = require("./copyFiles.js");
var open_1 = require("open");
var fs_extra_1 = require("fs-extra");
var path_1 = require("path");
var log4js_api_1 = require("@log4js-node/log4js-api");
var node_url_1 = require("node:url");
var timeFormat = "YYYY-MM-DDTHH:mm:ss.SSS[Z]";
function walk(dir, extensions, filelist) {
    if (filelist === void 0) { filelist = []; }
    var files = fs_extra_1["default"].readdirSync(dir);
    files.forEach(function (file) {
        var filepath = path_1["default"].join(dir, file);
        var stat = fs_extra_1["default"].statSync(filepath);
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
var ReportAggregator = /** @class */ (function () {
    function ReportAggregator(opts) {
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
            this.options.LOG = log4js_api_1["default"].getLogger(this.options.debug ? 'debug' : 'default');
        }
        this.reports = [];
    }
    ReportAggregator.prototype.clean = function () {
        fs_extra_1["default"].emptyDirSync(this.options.outputDir);
    };
    ReportAggregator.prototype.readJsonFiles = function () {
        return walk(this.options.outputDir, [".json"]);
    };
    ReportAggregator.prototype.updateSuiteMetrics = function (metrics, suiteInfo) {
        var start = dayjs_1["default"].utc(suiteInfo.start);
        if (metrics.start) {
            if (start.isBefore(metrics.start)) {
                metrics.start = start.utc().format(timeFormat);
            }
        }
        else {
            metrics.start = start.utc().format(timeFormat);
        }
        var end = dayjs_1["default"].utc(suiteInfo.end);
        if (metrics.end) {
            if (end.isAfter(dayjs_1["default"].utc(metrics.end))) {
                metrics.end = end.utc().format(timeFormat);
            }
        }
        else {
            metrics.end = end.utc().format(timeFormat);
        }
        this.options.LOG.info(typescript_string_operations_1.String.format("Included metrics for suite: {0} {1}", suiteInfo.cid, suiteInfo.uid));
    };
    ReportAggregator.prototype.createReport = function () {
        return __awaiter(this, void 0, void 0, function () {
            var metrics, suites, specs, files, i, filename, report, j, report, k, suiteInfo, report, reportData, ex_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.options.LOG.info("Report Aggregation started");
                        metrics = new types_js_1.Metrics();
                        suites = [];
                        specs = [];
                        files = this.readJsonFiles();
                        if (files.length == 0) {
                            this.options.LOG.error(typescript_string_operations_1.String.format("No Json files found in: {0}. Make sure options.produceJson is not false", this.options.outputDir));
                        }
                        for (i = 0; i < files.length; i++) {
                            try {
                                filename = files[i];
                                report = JSON.parse(fs_extra_1["default"].readFileSync(filename));
                                if (!report.info || !report.info.specs) {
                                    this.options.LOG.error("report structure in question, no info or info.specs ", JSON.stringify(report));
                                    this.options.LOG.debug("report content: ", JSON.stringify(report));
                                }
                                report.info.specs.forEach(function (spec) {
                                    specs.push(spec);
                                });
                                this.reports.push(report);
                            }
                            catch (ex) {
                                console.error(ex);
                            }
                        }
                        this.reports.sort(function (report1, report2) {
                            var first = dayjs_1["default"].utc(report1.info.start);
                            var second = dayjs_1["default"].utc(report2.info.start);
                            if (first.isAfter(second)) {
                                return 1;
                            }
                            else if (first.isBefore(second)) {
                                return -1;
                            }
                            return 0;
                        });
                        for (j = 0; j < this.reports.length; j++) {
                            try {
                                report = this.reports[j];
                                metrics.passed += report.metrics.passed;
                                metrics.failed += report.metrics.failed;
                                metrics.skipped += report.metrics.skipped;
                                for (k = 0; k < report.suites.length; k++) {
                                    suiteInfo = report.suites[k];
                                    this.updateSuiteMetrics(metrics, suiteInfo);
                                    suites.push(suiteInfo);
                                }
                            }
                            catch (ex) {
                                console.error(ex);
                            }
                        }
                        if (!metrics.start || !metrics.end) {
                            this.options.LOG.error(typescript_string_operations_1.String.format("Invalid Metrics computed: {0} -- {1}", metrics.start, metrics.end));
                        }
                        metrics.duration = dayjs_1["default"].duration((0, dayjs_1["default"])(metrics.end).utc().diff((0, dayjs_1["default"])(metrics.start).utc())).as('milliseconds');
                        if (!this.reports || !this.reports.length) {
                            report = {
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
                                            "tests": []
                                        }
                                    ]
                                }
                            };
                            this.reports = [];
                            this.reports.push(report);
                        }
                        this.options.LOG.info("Aggregated " + specs.length + " specs, " + suites.length + " suites, ");
                        this.reportFile = path_1["default"].join(process.cwd(), this.options.outputDir, this.options.filename);
                        reportData = new types_js_1.ReportData(this.options.reportTitle, this.reports[0].info, suites, metrics, this.reportFile, this.options.browserName);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, htmlGenerator_js_1["default"].htmlOutput(this.options, reportData)];
                    case 2:
                        _a.sent();
                        this.finalize();
                        this.options.LOG.info("Report Aggregation completed");
                        return [3 /*break*/, 4];
                    case 3:
                        ex_1 = _a.sent();
                        console.error("Report Aggregation failed: " + ex_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ReportAggregator.prototype.finalize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dirname, jsFiles, reportDir;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dirname = node_url_1["default"].fileURLToPath(new URL('.', import.meta.url));
                        jsFiles = path_1["default"].join(dirname, '../css/');
                        reportDir = path_1["default"].join(process.cwd(), this.options.outputDir);
                        return [4 /*yield*/, (0, copyFiles_js_1["default"])(jsFiles, reportDir)];
                    case 1:
                        _a.sent();
                        this.options.LOG.info('copyfiles complete : ' + jsFiles + " to " + reportDir);
                        if (!this.options.showInBrowser) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, open_1["default"])(this.reportFile)];
                    case 2:
                        _a.sent();
                        this.options.LOG.info("browser launched");
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ReportAggregator;
}());
exports["default"] = ReportAggregator;
