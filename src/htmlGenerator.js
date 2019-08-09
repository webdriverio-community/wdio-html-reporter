
const Handlebars = require('handlebars');
const fs = require('fs-extra');
const _ = require('lodash');
const path = require('path');
const moment = require('moment');
const Png = require("pngjs").PNG;
const Jpeg = require("jpeg-js");
const open = require('open');

const momentDurationFormatSetup = require("moment-duration-format");
momentDurationFormatSetup(moment);


class HtmlGenerator  {


    static htmlOutput(reportOptions, callback = () =>{}) {
        try {

            let templateFile = fs.readFileSync(path.resolve(__dirname, '../src/wdio-html-reporter-template.hbs'), 'utf8');

            Handlebars.registerHelper('imageAsBase64', function (screenshotFile, screenshotPath, hbopts) {
                // occurs when there is an error file
                if (!fs.existsSync(screenshotFile)) {
                    screenshotFile = `${screenshotPath}/${screenshotFile}`
                }
                let png = new Png.sync.read(fs.readFileSync(path.resolve(`${screenshotFile}`)));
                return `data:image/jpeg;base64,${Jpeg.encode(png, 50).data.toString('base64')}`
            });

            Handlebars.registerHelper('isValidSuite', function (suite, hbopts) {
                if (suite.title.length > 0 &&
                    suite.type === 'suite' &&
                    suite.tests.length > 0 ) {
                    return hbopts.fn(this);
                }
            });

            Handlebars.registerHelper('testStateColour', function (state, hbopts) {
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

            Handlebars.registerHelper('testStateIcon', function (state, hbopts) {
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

            Handlebars.registerHelper('suiteStateColour', function (tests, hbopts) {
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

            Handlebars.registerHelper('humanizeDuration', function (duration, hbopts) {
                return moment.duration(duration, "milliseconds").format('hh:mm:ss.SS', {trim: false})
            });

            Handlebars.registerHelper('ifSuiteHasTests', function (testsHash, hbopts) {
                if (Object.keys(testsHash).length > 0) {
                    return hbopts.fn(this)
                }
                return hbopts.inverse(this);
            });


            Handlebars.registerHelper('ifEventIsError', function (event, hbopts) {
                if (event.type === 'Error') {
                    return hbopts.fn(this);
                }
                return hbopts.inverse(this);
            });

            Handlebars.registerHelper('ifEventIsScreenshot', function (event, hbopts) {
                if (event.type === 'screenshot') {
                    return hbopts.fn(this);
                }
                return hbopts.inverse(this);
            });

            Handlebars.registerHelper('ifEventIsLogMessage', function (event, hbopts) {
                if (event.type === 'log') {
                    return hbopts.fn(this);
                }
                return hbopts.inverse(this);
            });

            Handlebars.registerHelper('logClass', function (text , hbopts) {
                if (text.includes('Test Iteration')) {
                    return "test-iteration";
                } else {
                    return "log-output";
                }
            });






            if (fs.pathExistsSync(reportOptions.outputDir)) {
               let jsonFile = reportOptions.reportFile.replace('.html' , '.json') ;
                    fs.outputFileSync(jsonFile, JSON.stringify(reportOptions.data));
            }

            let template = Handlebars.compile(templateFile);
            let html = template(reportOptions.data);

            if (fs.pathExistsSync(reportOptions.outputDir)) {
                fs.outputFileSync(reportOptions.reportFile, html);
                try {
                    if (reportOptions.showInBrowser) {

                        let childProcess = open(reportOptions.reportFile);
                        childProcess.then(
                            () => {
                                console.log('browser launched');
                            },
                            (error) => {
                                console.error('showInBrowser error spawning :' + reportOptions.reportFile + " " + error.toString());
                            })
                    }
                } catch (ex) {
                    console.error('Error opening browser:' + ex);
                }
            }
            callback(true);
        } catch(ex) {
            console.error('Error processing report template:' + ex);
            callback(false);
        }
    }
}

export default HtmlGenerator;
