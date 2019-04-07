import HtmlGenerator from "./htmlGenerator";

const fs = require('fs-extra');
const path = require('path');


class ReportAggregator {

    constructor(opts) {
        opts = Object.assign({}, {
            outputDir: 'reports/html-reports/',
            filename: 'master-report.html',
            reportTitle: 'Test Master Report',
        }, opts);
        this.options = opts;
        this.options.reportFile = path.join(process.cwd(), this.options.outputDir, this.options.filename);
        this.reports = [];
        process.on('test:addSuite', this.addReport.bind(this));
    }

    before(capabilities, specs) {
    }

    after(result, capabilities, specs) {
        createReport(this.options);
    }

    clean() {
        fs.emptyDirSync(this.options.outputDir);
    }

    addReport(report) {
        this.reports.push(report);
    }

    createReport(options) {

        let suiteUid = "master-suite";
        let metrics = {
            passed: 0,
            skipped: 0,
            failed: 0
        };
        let suites = [];
        for (let k = 0 ; k < this.reports.length ; k++) {
            let report = this.reports[k] ;
            metrics.passed += report.metrics.passed;
            metrics.failed += report.metrics.failed;
            metrics.skipped += report.metrics.skipped;
            for (let i = 0 ; i < report.suites.length ; i++) {
                suites.push(report.suites[i]);
            }
        }
        const reportOptions = {
            data: {
                info: this.reports[0].info,
                metrics: metrics,
                suites: suites,
                title: this.options.reportTitle,
            },
            outputDir: this.options.outputDir,
            reportFile: this.options.reportFile,
            openInBrowser: true
        };
        HtmlGenerator.htmlOutput(reportOptions) ;
    }
}

export default ReportAggregator;
