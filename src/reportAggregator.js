import HtmlGenerator from "./htmlGenerator";

const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
const logger = require('@log4js-node/log4js-api');

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
            showInBrowser: false,
            templateFilename: path.resolve(__dirname, '../src/wdio-html-reporter-template.hbs'),
            templateFuncs: {},
            LOG: null
        }, opts);
        this.options = opts;
        if (!this.options.LOG) {
            this.options.LOG = logger.getLogger("default")      ;
        }
        this.options.reportFile = path.join(process.cwd(), this.options.outputDir, this.options.filename);
        this.reports = [];
    }

    clean() {
        fs.emptyDirSync(this.options.outputDir);
    }



    readJsonFiles() {
        return walk(this.options.outputDir, [".json"]);
    }


    log(message,object) {
        if (this.options.LOG) {
            this.options.LOG.debug(message + object) ;
        }
    }
    async createReport(results) {

        let metrics = {
            passed: 0,
            skipped: 0,
            failed: 0,
            start : moment("2048-01-01T01:00:00-08:00"),
            end : moment("2000-01-01T01:00:00-08:00"),
            duration: 0
        };
        let suites = [];
        let specs = [];

        let files = this.readJsonFiles();

        for (let i = 0; i < files.length; i++) {
            try {
                let filename = files[i];
                let report = JSON.parse(fs.readFileSync(filename));
                if (!report.info || !report.info.specs) {
                    this.options.LOG.error("report structure in question, no info or info.specs " , JSON.stringify(report));
                    this.options.LOG.info("report content: " , JSON.stringify(report));
                }
                report.info.specs.forEach((spec) => {
                    specs.push(spec) ;
                });


                this.reports.push(report);
                metrics.passed += report.metrics.passed;
                metrics.failed += report.metrics.failed;
                metrics.skipped += report.metrics.skipped;

                for (let k = 0; k < report.suites.length; k++) {
                    let suite = report.suites[k] ;
                    let start = moment.utc(suite.start) ;
                    if ( start.isSameOrBefore(metrics.start)) {
                        metrics.start =  start ;
                    }
                    let end = moment.utc(suite.end) ;
                    if ( end.isAfter(metrics.end)) {
                        metrics.end =  end ;
                    }
                    suites.push(suite);
                }
            } catch (ex) {
                console.error(ex);
            }

        }
        metrics.duration = moment.duration(metrics.end.diff(metrics.start), "milliseconds").format('hh:mm:ss.SS', {trim: false});
        metrics.start = metrics.start.format() ;
        metrics.end = metrics.end.format() ;

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
            templateFilename: this.options.templateFilename,
            LOG : this.options.LOG,
            templateFuncs: this.options.templateFuncs,
            showInBrowser: this.options.showInBrowser
        };

        HtmlGenerator.htmlOutput(reportOptions);

    }
}

    export default ReportAggregator;
