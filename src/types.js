"use strict";
exports.__esModule = true;
exports.ReportData = exports.InternalReportEvent = exports.Metrics = exports.HtmlReporterOptions = void 0;
var HtmlReporterOptions = /** @class */ (function () {
    function HtmlReporterOptions() {
        this.outputDir = 'reports/html-reports/';
        this.filename = 'report.html';
        this.reportTitle = 'Test Report Title';
        this.showInBrowser = false;
        this.collapseTests = false;
        this.collapseSuites = false;
        this.useOnAfterCommandForScreenshot = false;
        this.LOG = null;
        this.debug = false;
        this.browserName = "not specified";
        this.removeOutput = true;
        this.linkScreenshots = false;
        this.collapseTests = false;
        this.collapseSuites = false;
        this.produceJson = true;
    }
    return HtmlReporterOptions;
}());
exports.HtmlReporterOptions = HtmlReporterOptions;
var Metrics = /** @class */ (function () {
    function Metrics() {
        this.passed = 0;
        this.skipped = 0;
        this.failed = 0;
        this.duration = 0;
    }
    return Metrics;
}());
exports.Metrics = Metrics;
var InternalReportEvent = /** @class */ (function () {
    function InternalReportEvent(type, value) {
        this.type = type;
        this.value = value;
    }
    return InternalReportEvent;
}());
exports.InternalReportEvent = InternalReportEvent;
var ReportData = /** @class */ (function () {
    function ReportData(title, info, suites, metrics, reportFile, browserName) {
        this.info = info;
        this.metrics = metrics;
        this.title = title;
        this.suites = suites;
        this.reportFile = reportFile;
        this.browserName = browserName;
    }
    return ReportData;
}());
exports.ReportData = ReportData;
