"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportData = exports.InternalReportEvent = exports.Metrics = exports.HtmlReporterOptions = void 0;
class HtmlReporterOptions {
    constructor() {
        this.outputDir = "";
        this.filename = "";
        this.reportTitle = "Please add a Title";
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
        this.produceJson = false;
    }
}
exports.HtmlReporterOptions = HtmlReporterOptions;
class Metrics {
    constructor() {
        this.passed = 0;
        this.skipped = 0;
        this.failed = 0;
        this.duration = 0;
    }
}
exports.Metrics = Metrics;
class InternalReportEvent {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
}
exports.InternalReportEvent = InternalReportEvent;
class ReportData {
    constructor(title, info, suites, metrics, reportFile, browserName) {
        this.info = info;
        this.metrics = metrics;
        this.title = title;
        this.suites = suites;
        this.reportFile = reportFile;
        this.browserName = browserName;
    }
}
exports.ReportData = ReportData;
