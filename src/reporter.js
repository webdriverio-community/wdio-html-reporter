import WDIOReporter from '@wdio/reporter'

const events = require('events');
const Handlebars = require('handlebars');
const fs = require('fs-extra');
const _ = require('lodash');
const path = require('path');
const moment = require('moment');
const momentDurationFormatSetup = require("moment-duration-format");
momentDurationFormatSetup(moment);
const Png = require("pngjs").PNG;
const Jpeg = require("jpeg-js");
const open = require('open');

class HtmlReporter extends WDIOReporter {

    constructor(opts) {
        opts = Object.assign({}, {
            stdout: true,
            outputDir: 'reports/html-reports/',
            filename: 'report.html',
            reportTitle: 'Test Report Title',
            showInBrowser: false,
            useOnAfterCommandForScreenshot: true,
        }, opts);
        super(opts);
        this.options = opts;
        const dir = this.options.outputDir + 'screenshots' ;

        fs.ensureDirSync(dir) ;
        this.suiteUids = [];
        this.suites = [];
        this.indents = 0;
        this.suiteIndents = {};
        this.metrics = {
            passed : 0,
            skipped : 0,
            failed : 0
        };
        this.openInProgress = false;
        this.defaultTestIndent = '   ' ;
        process.on('test:log', this.saveMessage.bind(this));
        process.on('test:screenshot', this.saveScreenshot.bind(this));

    }

    get isSynchronised () {
        return !this.openInProgress ;
    }

    onRunnerStart(runner) {
        this.log("onRunnerStart: " , JSON.stringify(runner));
        //todo look at fix, not async safe. but one cid per report file
        this.cid = runner.cid;
        this.runner = runner;
        this.metrics.passed = 0;
        this.metrics.skipped = 0;
        this.metrics.failed = 0;
    }

    onSuiteStart(suite) {
        this.suiteUids.push(suite.uid);
        this.suiteIndents[suite.uid] = ++this.indents;
        this.suiteUid = suite.uid;
        this.log("onSuiteStart: " , JSON.stringify(suite));
    }

    onTestStart(theTest) {
        this.log("onTestStart: " , JSON.stringify(theTest));
        this.testUid = theTest.uid ;
        let test = this.getTest(theTest.uid) ;
        test.events = [];
        test.errorIndex = 0 ;
    }

    onTestPass(test) {
        this.log("onTestPass: " , JSON.stringify(test));
        this.metrics.passed++;
    }

    onTestSkip(test) {
        this.log("onTestSkip: " , JSON.stringify(test));
        this.metrics.skipped++;
    }

    onTestFail(test) {
        this.log("onTestFail: " , JSON.stringify(test));
        this.metrics.failed++;
    }

    onHookEnd(hook) {
        if (hook.error) {
            this.metrics.failed++;
        }
    }
    onTestEnd(theTest) {
        this.log("onTestEnd: " , JSON.stringify(theTest));
        let test = this.getTest(theTest.uid) ;
        this.moveErrorsToEvents(test) ;
    }

    onSuiteEnd(suite) {
        this.log("onSuiteEnd: " , JSON.stringify(suite));
        this.indents--;
        this.suites.push(suite);
    }

    isScreenshotCommand(command) {
        const isScreenshotEndpoint = /\/session\/[^/]*\/screenshot/
        return isScreenshotEndpoint.test(command.endpoint)
    }

    //this is a hack to get around lack of onScreenshot event
    onAfterCommand(command) {
        if (this.options.useOnAfterCommandForScreenshot) {
            if (this.isScreenshotCommand(command) && command.result.value) {
                const timestamp = moment().format('YYYYMMDD-HHmmss.SSS');
                const filepath = path.join(this.options.outputDir, '/screenshots/', this.cid, timestamp, this.options.filename + '.png');
                fs.outputFileSync(filepath, Buffer.from(command.result.value, 'base64'));

                let test = this.getTest(this.testUid);
                test.events.push({type: 'screenshot', value: filepath});
            }
        }
    }


    log(message,object,force) {
        if (this.options.debug || force) {
            console.log(message + object) ;
        }
    }
    getSuite(uid) {
        return this.suites[uid];
    }

    getTest(uid) {
        let suite = this.getSuite(this.suiteUid);
        for (let i = 0 ; i < suite.tests.length ; i++) {
            if (uid === suite.tests[i].uid) {
                return suite.tests[i] ;
            }
        }
        return null;
    }

    //this is a hack.  we have to move all the things in test.errors before they get blown away

    moveErrorsToEvents(test) {
        if (test.errors) {
            for (let i = test.errorIndex; i < test.errors.length; i++) {
                test.events.push(test.errors[i]);
            }
            test.errorIndex = test.errors.length;
        }
    }

    saveScreenshot(filepath) {
        let test = this.getTest(this.testUid) ;
        this.moveErrorsToEvents(test) ;
        test.events.push({type: 'screenshot', value: filepath}) ;
    }

    saveMessage(message) {
        const test = this.getTest(this.testUid);
        this.moveErrorsToEvents(test) ;
        test.events.push({type: 'log', value: message}) ;
    }

    onRunnerEnd(runner) {
        this.log("onRunnerEnd: " , JSON.stringify(runner));
        this.htmlOutput(runner);
    }

    getOrderedSuites() {
        if (this.orderedSuites) {
            return this.orderedSuites;
        }

        this.orderedSuites = [];

        for (const uid of this.suiteUids) {
            for (const suite of this.suites) {
                if (suite.uid !== uid) {
                    continue;
                }

                this.orderedSuites.push(suite);
            }
        }

        return this.orderedSuites;
    }

// convert to a style class
    indent(uid) {
        const indents = this.suiteIndents[uid];
        return indents === 0 ? '' : Array(indents).join('    ');
    }

    htmlOutput(runner) {
        try {

            let templateFile = fs.readFileSync(path.resolve(__dirname, '../src/wdio-html-reporter-template.hbs'), 'utf8');

            Handlebars.registerHelper('imageAsBase64', function (screenshotFile, screenshotPath, options) {
                // occurs when there is an error file
                if (!fs.existsSync(screenshotFile)) {
                    screenshotFile = `${screenshotPath}/${screenshotFile}`
                }
                let png = new Png.sync.read(fs.readFileSync(path.resolve(`${screenshotFile}`)))
                return `data:image/jpeg;base64,${Jpeg.encode(png, 50).data.toString('base64')}`
            });

            Handlebars.registerHelper('isValidSuite', function (suite, options) {
                if (suite.title.length > 0 &&
                    suite.type === 'suite' &&
                    suite.tests.length > 0 ) {
                    return options.fn(this);
                }
            });

            Handlebars.registerHelper('testStateColour', function (state, options) {
                if (state === 'passed') {
                    return 'test-pass';
                } else if (state === 'failed') {
                    return 'test-fail';
                } else if (state === 'pending') {
                    return 'test-pending';
                } else if (state === 'skipped') {
                return 'test-skipped';
            }
            });

            Handlebars.registerHelper('testStateIcon', function (state, options) {
                if (state === 'passed') {
                    return '<span class="success">&#10004;</span>' ;
                } else if (state === 'failed') {
                    return '<span class="error">&#10006;</span>' ;
                } else if (state === 'pending') {
                    return '<span class="pending">&#10004;</span>' ;
                } else if (state === 'skipped') {
                    return '<span class="skipped">&#10034;</span>' ;
                }
            });

            Handlebars.registerHelper('suiteStateColour', function (tests, options) {
                let numTests = Object.keys(tests).length;

                let fail = _.values(tests).find((test) => {
                    return test.state === 'failed';
                })
                if (fail != null) {
                    return 'suite-fail';
                }

                let passes = _.values(tests).filter((test) => {
                    return test.state === 'passed';
                })
                if (passes.length === numTests && numTests > 0) {
                    return 'suite-pass';
                }

                //skipped is the lowest priority check
                let skipped = _.values(tests).find((test) => {
                    return test.state === 'skipped';
                })
                if (skipped != null) {
                    return 'suite-pending';
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


            Handlebars.registerHelper('ifEventIsError', function (event, options) {
                if (event.type === 'Error') {
                    return options.fn(this);
                }
                return options.inverse(this);
            });

            Handlebars.registerHelper('ifEventIsScreenshot', function (event, options) {
                if (event.type === 'screenshot') {
                    return options.fn(this);
                }
                return options.inverse(this);
            });

            Handlebars.registerHelper('ifEventIsLogMessage', function (event, options) {
                if (event.type === 'log') {
                    return options.fn(this);
                }
                return options.inverse(this);
            });

            Handlebars.registerHelper('logClass', function (text , options) {
                if (text.includes('Test Iteration')) {
                    return "test-iteration";
                } else {
                    return "log-output";
                }
            });


            const reportData = {
                info: runner,
                metrics: this.metrics,
                suites: this.getOrderedSuites(),
                title: this.options.reportTitle
            };

            let reportFile = path.join(process.cwd(), this.options.outputDir,this.suiteUid , this.cid, this.options.filename);

            if (true) {
            // if (this.options.debug) {
                if (fs.pathExistsSync(this.options.outputDir)) {
                    let jsonFile = reportFile.replace('.html' , '.json') ;
                    fs.outputFileSync(jsonFile, JSON.stringify(reportData));
                }
            }

            let template = Handlebars.compile(templateFile)
            let html = template(reportData);

            if (fs.pathExistsSync(this.options.outputDir)) {
                fs.outputFileSync(reportFile, html);
                fs.outputFileSync(reportFile, html);
                if (this.options.showInBrowser) {
                    this.openInProgress = true;
                    let childProcess = open(reportFile);
                    childProcess.then(
                    () => {
                        console.log('browser launched');
                        this.openInProgress = false ;
                    },
                    (error) => {
                        console.error('showInBrowser error spawning :' + reportFile + " " + error.toString());
                        this.openInProgress = false ;
                    })
                }
            }

        } catch(ex) {
            console.error('Error processing report template:' + ex);
        }
    }
}

export default HtmlReporter;
