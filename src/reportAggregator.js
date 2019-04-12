import HtmlGenerator from "./htmlGenerator";

const fs = require('fs-extra');
const path = require('path');

function  walk(dir, extensions , filelist = []) {
    const files = fs.readdirSync(dir);

    files.forEach(function (file) {
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);

        if (stat.isDirectory()) {
            filelist = walk(filepath, extensions, filelist);
        } else {
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
        opts = Object.assign({}, {
            outputDir: 'reports/html-reports/',
            filename: 'master-report.html',
            reportTitle: 'Test Master Report',
        }, opts);
        this.options = opts;
        this.options.reportFile = path.join(process.cwd(), this.options.outputDir, this.options.filename);
        this.reports = [];
    }

    clean() {
        fs.emptyDirSync(this.options.outputDir);
    }



    readJsonFiles() {
        return walk(this.options.outputDir, [".json"]);
    }


    async createReport(results) {

        let metrics = {
            passed: 0,
            skipped: 0,
            failed: 0
        };
        let suites = [];
        let specs = [];

        let files = this.readJsonFiles();

        for (let i = 0; i < files.length; i++) {
            try {
                let filename = files[i];
                let report = JSON.parse(fs.readFileSync(filename));
                report.info.specs.forEach((spec) => {
                    specs.push(spec) ;
                })

                this.reports.push(report);
                metrics.passed += report.metrics.passed;
                metrics.failed += report.metrics.failed;
                metrics.skipped += report.metrics.skipped;
                for (let k = 0; k < report.suites.length; k++) {
                    suites.push(report.suites[k]);
                }

            } catch (ex) {
                console.error(ex);
            }

        }
        const reportOptions = {
            data: {
                info: this.reports[0].info,
                specs:specs,
                metrics: metrics,
                suites: suites,
                title: this.options.reportTitle,
            },
            outputDir: this.options.outputDir,
            reportFile: this.options.reportFile,
            openInBrowser: true
        };

        HtmlGenerator.htmlOutput(reportOptions);

    }
}

    export default ReportAggregator;
