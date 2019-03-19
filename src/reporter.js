import WDIOReporter from '@wdio/reporter'

const events = require('events');
const Handlebars = require('handlebars');
const fs = require('fs-extra');
const _ = require('lodash');
const path = require('path');
const moment = require('moment');
const momentDurationFormatSetup = require("moment-duration-format");
momentDurationFormatSetup(moment);
const escapeStringRegexp = require('escape-string-regexp');
const Png = require("pngjs").PNG;
const Jpeg = require("jpeg-js");
const open = require('opn');

class HtmlReporter extends WDIOReporter {

    constructor(opts) {
        opts = Object.assign({}, {
            stdout: true,
            outputDir: 'reports/html-reports/',
            filename: 'report.html',
            reportTitle: 'Test Report Title',
            showInBrowser: false
        }, opts);
        super(opts);
        this.options = opts;

        this.errorCount = 0;
        this.specs = {};
        this.results = {};

        this.on('screenshot:fullpage', function (data) {
            // if the filename isn't defined, it cannot find the file and cannot be added to the report
            if (!data.filename) {
                return
            }
            const cid = data.cid;
            const results = stats.runners[cid];
            const specHash = Object.keys(results.specs)[Object.keys(results.specs).length - 1];
            const spec = results.specs[specHash];
            const lastKey = Object.keys(spec.suites)[Object.keys(spec.suites).length - 1];
            const currentTestKey = Object.keys(spec.suites[lastKey].tests)[Object.keys(spec.suites[lastKey].tests).length - 1]
            spec.suites[lastKey].tests[currentTestKey].events({ type: 'screenshot', value: data.filename});
        });

        this.on('runner:logit', function (data) {
            const results = stats.runners[this.cid];
            const specHash = Object.keys(results.specs)[Object.keys(results.specs).length - 1];
            const spec = results.specs[specHash];
            const lastKey = Object.keys(spec.suites)[Object.keys(spec.suites).length - 1];
            const currentTestKey = Object.keys(spec.suites[lastKey].tests)[Object.keys(spec.suites[lastKey].tests).length - 1];

            if (spec.suites[lastKey].tests[currentTestKey].logit == null) {
                spec.suites[lastKey].tests[currentTestKey].logit = []
            }
            spec.suites[lastKey].tests[currentTestKey].events.push({ type: 'log', value: data.output});
        });
        this.on('runner:screenshot', function (runner) {
            onScreenshot(runner) ;
        })
    }

    onRunnerStart(runner) {
        //todo look at fix, not async safe
        this.cid = runner.cid;
        this.specs[runner.cid] = runner.specs
        this.results[runner.cid] = {
            passing: 0,
            pending: 0,
            failing: 0
        }
    }

    onSuiteStart(suite) {

    }

    onTestStart(test) {
        this.results[test.cid].pending++
    }

    onTestPass(test) {
        this.results[test.cid].passing++
    }

    onScreenshot(runner) {
        // if the filename isn't defined, it cannot find the file and cannot be added to the report
        if (!runner.filename) {
            return
        }
        const cid = runner.cid;
        const results = stats.runners[cid];
        const specHash = stats.getSpecHash(runner);
        const spec = results.specs[specHash];
        const lastKey = Object.keys(spec.suites)[Object.keys(spec.suites).length - 1];
        const currentTestKey = Object.keys(spec.suites[lastKey].tests)[Object.keys(spec.suites[lastKey].tests).length - 1];
        spec.suites[lastKey].tests[currentTestKey].events({ type: 'screenshot', value: runner.filename});
    }

    onTestFail(test) {
        this.results[test.cid].failing++
    }

    onTestEnd(suite) {

    }

    onRunnerEnd(runner) {
        this.htmlOutput(runner);
    }

    onTestEnd() {
    }


    htmlOutput(stats) {
        try {
            let templateFile = fs.readFileSync(path.resolve(__dirname, '../src/wdio-html-reporter-template.hbs'), 'utf8')

            Handlebars.registerHelper('imageAsBase64', function (screenshotFile, screenshotPath, options) {
                // occurs when there is an error file
                if (!fs.existsSync(screenshotFile)) {
                    screenshotFile = `${screenshotPath}/${screenshotFile}`
                }
                let png = new Png.sync.read(fs.readFileSync(path.resolve(`${screenshotFile}`)))
                return `data:image/jpeg;base64,${Jpeg.encode(png, 50).data.toString('base64')}`
            });

            Handlebars.registerHelper('isValidSuite', function (suite, options) {
                if (suite.title.length > 0 && suite.type === 'suite') {
                    return options.fn(this);
                }
            });

            Handlebars.registerHelper('testStateColour', function (state, options) {
                if (state === 'passed') {
                    return 'test-pass'
                } else if (state === 'failed') {
                    return 'test-fail'
                } else if (state === 'pending') {
                    return 'test-pending'
                }
            });

            Handlebars.registerHelper('testStateIcon', function (state, options) {
                if (state === 'passed') {
                    return '<span class="success">&#10004;</span>' ;
                } else if (state === 'failed') {
                    return '<span class="error">&#10006;</span>' ;
                } else if (state === 'pending') {
                    return '<span class="success">&#10004;</span>' ;
                }
            });

            Handlebars.registerHelper('suiteStateColour', function (tests, options) {
                let numTests = Object.keys(tests).length

                let fail = _.values(tests).find((test) => {
                    return test.state === 'fail'
                })
                if (fail != null) {
                    return 'suite-fail'
                }

                let pending = _.values(tests).find((test) => {
                    return test.state === 'pending'
                })
                if (pending != null) {
                    return 'suite-pending'
                }

                let passes = _.values(tests).filter((test) => {
                    return test.state === 'pass'
                })
                if (passes.length === numTests && numTests > 0) {
                    return 'suite-pass'
                }
                return 'suite-unknown'
            });

            Handlebars.registerHelper('humanizeDuration', function (duration, options) {
                return moment.duration(duration, "milliseconds").format('hh:mm:ss.SS', {trim: false})
            });

            Handlebars.registerHelper('ifSuiteHasTests', function (testsHash, options) {
                if (Object.keys(testsHash).length > 0) {
                    return options.fn(this)
                }
                return options.inverse(this);
            });


            Handlebars.registerHelper('accessCid', function (result, cid, prop) {
                let cidVar = result[cid];
                return cidVar[prop];
            });

            Handlebars.registerHelper('access', function (cid) {
                return cid;
            });

            Handlebars.registerHelper('ifEventisScreenshot', function (event) {
                if (event.type === 'screenshot') {
                    return options.fn(this);
                }
                return options.inverse(this);
            });

            Handlebars.registerHelper('ifEventiLogMessage', function (event) {
                if (event.type === 'log') {
                    return options.fn(this);
                }
                return options.inverse(this);
            });


            const data = {
                stats: stats,
                suites: this.suites,
                results: this.results,
                title: this.options.reportTitle
            };

            let template = Handlebars.compile(templateFile)
            let html = template(data);

            if (this.options && this.options.debug) {
                if (fs.pathExistsSync(this.options.outputDir)) {
                    let reportfile = `${this.options.outputDir}/raw-input.json`;
                    fs.outputFileSync(reportfile, JSON.stringify(data));
                }
            }

            if (this.options) {
                let reportfile;
                if (this.options.outputDir) {
                    if (fs.pathExistsSync(this.options.outputDir)) {
                        reportfile = path.join(this.options.outputDir, this.options.filename);
                        fs.outputFileSync(reportfile, html);
                        if (this.options.showInBrowser) {
                            open(reportfile).then(
                                console.log("launched browser with " + reportfile));
                        }
                    }
                } else {
                    console.log(`View HTML Report at: ${reportfile}`);
                }
            }
        } catch(ex) {
            console.error('Error generating report:' + ex);
        }
    }
}

export default HtmlReporter;
