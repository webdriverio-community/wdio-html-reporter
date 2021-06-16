import {HtmlReporterOptions, ReportData, TestInfo} from "./types";
import * as Handlebars from "handlebars";
import {HelperOptions} from "handlebars";
const fs = require('fs-extra');
const _ = require('lodash');
const path = require('path');
const encode = require('./encode').default;
const logger = require('@log4js-node/log4js-api');
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

class HtmlGenerator  {

    static htmlOutput(reportOptions: HtmlReporterOptions, reportData: ReportData, callback = (done:boolean) =>{}) {

        try {
            reportOptions.LOG.info("Html Generation started");
            let templateFile = fs.readFileSync(reportOptions.templateFilename, 'utf8');

            Handlebars.registerHelper('imageAsBase64', function (screenshotFile:string, screenshotPath:string, helperOpts: HelperOptions) {
                // occurs when there is an error file
                if (!fs.existsSync(screenshotFile)) {
                    if (screenshotPath) {
                        screenshotFile = `${screenshotPath}/${screenshotFile}`;
                    } else {
                        screenshotFile = `${screenshotFile}`;
                    }
                }
                return encode(path.resolve(screenshotFile)) ;
            });

            Handlebars.registerHelper('isValidReport',  (suites, helperOpts: HelperOptions) => {
                if (suites && suites.length > 0 ) {
                    return helperOpts.fn(this);
                }
                return helperOpts.inverse(this);
            });
            Handlebars.registerHelper('isValidSuite',  (suiteInfo, helperOpts: HelperOptions) => {
                if (suiteInfo.suite.title.length > 0 &&
                    suiteInfo.suite.type === 'suite:start'  &&
                    suiteInfo.suite.tests.length > 0 ) {
                    return helperOpts.fn(this);
                }
                return helperOpts.inverse(this);
            });

            Handlebars.registerHelper('testStateColour',  (testInfo:TestInfo, helperOpts: HelperOptions) => {
                if (testInfo.testStats.state === 'passed') {
                    return 'test-pass';
                } else if (testInfo.testStats.state === 'failed') {
                    return 'test-fail';
                } else if (testInfo.testStats.state === 'pending') {
                    return 'test-pending';
                } else if (testInfo.testStats.state === 'skipped') {
                return 'test-skipped';
            }
            });

            Handlebars.registerHelper('testStateIcon', (testInfo:TestInfo, helperOpts: HelperOptions) => {
                if (testInfo.testStats.state === 'passed') {
                    return '<span class="success">&#10004;</span>' ;
                } else if (testInfo.testStats.state === 'failed') {
                    return '<span class="error">&#10006;</span>' ;
                } else if (testInfo.testStats.state === 'pending') {
                    return '<span class="pending">&#10004;</span>' ;
                } else if (testInfo.testStats.state === 'skipped') {
                    return '<span class="skipped">&#10034;</span>' ;
                }
            });

            Handlebars.registerHelper('suiteStateColour', (tests, helperOpts: HelperOptions) => {
                let numTests = Object.keys(tests).length;

                _.values(tests).find((test:TestInfo) => {
                  if (test.testStats.state === "pending") {
                    --numTests;
                  }
                });

                let fail = _.values(tests).find((test:TestInfo) => {
                    return test.testStats.state === 'failed';
                })
                if (fail != null) {
                    return 'suite-fail';
                }

                let passes = _.values(tests).filter((test:TestInfo) => {
                    return test.testStats.state === 'passed';
                })
                if (passes.length === numTests && numTests > 0) {
                    return 'suite-pass';
                }

                //skipped is the lowest priority check
                let skipped = _.values(tests).find((test:TestInfo) => {
                    return test.testStats.state === 'skipped';
                })
                if (skipped != null) {
                    return 'suite-pending';
                }

                return 'suite-unknown'
            });

            Handlebars.registerHelper('humanizeDuration', (duration, helperOpts: HelperOptions) => {
                return dayjs.duration(duration, "milliseconds").format('HH:mm:ss.SSS');
            });

            Handlebars.registerHelper('ifSuiteHasTests', (testsHash, helperOpts: HelperOptions) => {
                if (Object.keys(testsHash).length > 0) {
                    return helperOpts.fn(this)
                }
                return helperOpts.inverse(this);
            });


            Handlebars.registerHelper('ifEventIsError', (event, helperOpts: HelperOptions) => {
                if (event.type.includes('Error')) {
                    return helperOpts.fn(this);
                }
                return helperOpts.inverse(this);
            });

            Handlebars.registerHelper('ifEventIsScreenshot', (event, helperOpts: HelperOptions) => {
                if (event.type === 'screenshot') {
                    return helperOpts.fn(this);
                }
                return helperOpts.inverse(this);
            });

            Handlebars.registerHelper('ifEventIsLogMessage', (event, helperOpts: HelperOptions) => {
                if (event.type === 'log') {
                    return helperOpts.fn(this);
                }
                return helperOpts.inverse(this);
            });

            Handlebars.registerHelper('ifCollapseTests',  (text , helperOpts: HelperOptions) => {
                return reportOptions.collapseTests;
            });

            Handlebars.registerHelper('ifCollapseSuites',  (text , helperOpts: HelperOptions) => {
                return reportOptions.collapseSuites;
            });

            Handlebars.registerHelper('logClass', (text , helperOpts: HelperOptions) => {
                if (text.includes('Test Iteration')) {
                    return "test-iteration";
                } else {
                    return "log-output";
                }
            });
            if (reportOptions.templateFuncs) {
                Object.keys(reportOptions.templateFuncs).forEach((name: string) => {
                    //@ts-ignore
                    Handlebars.registerHelper(name, reportOptions.templateFuncs[name]);
                });
            }
            if (fs.pathExistsSync(reportOptions.outputDir)) {
                if (reportOptions.removeOutput) {
                    for (let i = 0; i < reportData.suites.length; i++) {
                        let suite = reportData.suites[i].suite;
                        for (let j = 0; j < suite.tests.length; j++) {
                            let test = suite.tests[j];
                            test.output = [];
                        }
                        let tests = suite.tests;
                        for (let k = 0; k < tests.length; k++) {
                            let test = tests[k];
                            test.output = [];
                        }
                    }
                }
               let jsonFile = reportData.reportFile.replace('.html' , '.json') ;
               fs.outputFileSync(jsonFile, JSON.stringify(reportData));
            }

            let template = Handlebars.compile(templateFile);
            let html = template(reportData);

            if (fs.pathExistsSync(reportOptions.outputDir)) {
                fs.outputFileSync(reportData.reportFile, html);
            }
            reportOptions.LOG.info("Html Generation completed");
            callback(true);
        } catch(ex) {
            reportOptions.LOG.error("Html Generation processing ended in error: " + ex);
            callback(false);
        }
    }
}

export default HtmlGenerator;
