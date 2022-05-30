import {HtmlReporterOptions, ReportData} from "./types";
import nunjucks from "nunjucks";
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import {SuiteStats, TestStats} from "@wdio/reporter";
import log4js from "@log4js-node/log4js-api";
const json = require('big-json');

const fs = require('fs-extra');
const _ = require('lodash');
const path = require('path');
const encode = require('./encode').default;


dayjs.extend(duration);

class HtmlGenerator {


    static writeJson(jsonFile:string , stringified:string , reportOptions:HtmlReporterOptions, reportData: ReportData) {
        fs.outputFileSync(jsonFile, stringified);
        reportOptions.LOG.info("Json write completed: " + jsonFile );
        let html = nunjucks.render("report.html", reportData);

        if (fs.pathExistsSync(reportOptions.outputDir)) {
            fs.outputFileSync(reportData.reportFile, html);
        }
        reportOptions.LOG.info("Html Generation completed");
    }

    static async htmlOutput(reportOptions: HtmlReporterOptions, reportData: ReportData, callback = (done: boolean) => {
    }) {
        if (! reportOptions.LOG) {
            reportOptions.LOG = log4js.getLogger(reportOptions.debug ? 'debug' : 'default');
        }

        const specFileReferences: string[] = [];
        try {
            reportOptions.LOG.info("Html Generation started");

            let environment = nunjucks.configure([path.join(__dirname, '../templates/')], { // set folders with templates
                autoescape: true,
            });


            environment.addGlobal('renderImage', function (screenshotFile: string, screenshotPath: string) {
                // occurs when there is an error file
                if (!fs.existsSync(screenshotFile)) {
                    if (screenshotPath) {
                        screenshotFile = `${screenshotPath}/${screenshotFile}`;
                    } else {
                        screenshotFile = `${screenshotFile}`;
                    }
                }

                if (reportOptions.linkScreenshots) {
                    let relPath =  path.relative(reportOptions.outputDir,screenshotFile);
                    reportOptions.LOG.info("Screenshot Relative Path: " + relPath);
                    return relPath ;
                } else {
                    return encode(path.resolve(screenshotFile));
                }
            });
            environment.addGlobal('renderVideo', function (videoCaptureFile: string) {
                let relPath =  path.relative(reportOptions.outputDir,videoCaptureFile).split(path.sep).join(path.posix.sep);
                reportOptions.LOG.info("Video Relative Path: " + relPath);
                return relPath ;
            });
            environment.addGlobal('displaySpecFile', (suiteInfo:SuiteStats) => {
                if (suiteInfo && suiteInfo.file) {
                    if (specFileReferences && !specFileReferences.includes(suiteInfo.file)) {
                        specFileReferences.push(suiteInfo.file)
                        return true;
                    }
                }
                return false ;
            });

            environment.addGlobal('formatSpecFile', (suiteInfo:SuiteStats) => {
                // Display file path of spec
                let specFile = `${suiteInfo.file.replace(process.cwd(), '')}`
                return specFile;
            });

            environment.addGlobal('testStateColour', (testInfo:TestStats) => {
                if (testInfo.state === 'passed') {
                    return 'test-pass';
                } else if (testInfo.state === 'failed') {
                    return 'test-fail';
                } else if (testInfo.state === 'pending') {
                    return 'test-pending';
                } else if (testInfo.state === 'skipped') {
                    return 'test-skipped';
                }
            });

            environment.addGlobal('testStateClass', (testInfo:TestStats) => {
                if (testInfo.state === 'passed') {
                    return 'success';
                } else if (testInfo.state === 'failed') {
                    return 'error';
                } else if (testInfo.state === 'pending') {
                    return 'pending';
                } else if (testInfo.state === 'skipped') {
                    return 'skipped';
                }
            });
            environment.addGlobal('testStateIcon', (testInfo:TestStats) => {
                if (testInfo.state === 'passed') {
                    return '&#10004;';
                } else if (testInfo.state === 'failed') {
                    return '&#10006;';
                } else if (testInfo.state === 'pending') {
                    return '&#10004;';
                } else if (testInfo.state === 'skipped') {
                    return '&#10034;';
                }
            });
            environment.addGlobal('suiteStateColour', (suiteInfo:SuiteStats) => {
                if (suiteInfo.type.includes('feature')) {
                    return 'suite-feature';
                }
                if (!suiteInfo || !suiteInfo.tests) {
                    return 'suite-unknown';
                }
                let numTests = Object.keys(suiteInfo.tests).length;
                let tests = suiteInfo.tests;

                _.values(tests).find((test: TestStats) => {
                    if (test.state === "pending") {
                        --numTests;
                    }
                });

                let fail = _.values(tests).find((test: TestStats) => {
                    return test.state === 'failed';
                })
                if (fail != null) {
                    return 'suite-fail';
                }

                let passes = _.values(tests).filter((test: TestStats) => {
                    return test.state === 'passed';
                })
                if (passes.length === numTests && numTests > 0) {
                    return 'suite-pass';
                }

                //skipped is the lowest priority check
                let skipped = _.values(tests).find((test: TestStats) => {
                    return test.state === 'skipped';
                })
                if (skipped != null) {
                    return 'suite-pending';
                }

                return 'suite-unknown'
            });

            environment.addGlobal('humanizeDuration', (duration:number) => {
                return dayjs.duration(duration, "milliseconds").format('HH:mm:ss.SSS');
            });

            environment.addGlobal('ifCollapseTests', (text:string) => {
                return reportOptions.collapseTests;
            });

            environment.addGlobal('ifCollapseSuites', (text:string) => {
                return reportOptions.collapseSuites;
            });

            environment.addGlobal('logClass', (text:string) => {
                if (text && text.includes('Test Iteration')) {
                    return "test-iteration";
                } else {
                    return "log-output";
                }
            });

            if (fs.pathExistsSync(reportOptions.outputDir)) {
                if (reportOptions.removeOutput) {
                    for (let i = 0; i < reportData.suites.length; i++) {
                        let suite = reportData.suites[i];
                        for (let j = 0; j < suite.tests.length; j++) {
                            let test = suite.tests[j];
                            test.output = [];
                        }
                    }
                }
                let jsonFile = reportData.reportFile.replace('.html', '.json');
                try {
                    reportOptions.LOG.info("Json report write starting: " + jsonFile );
                    await json.stringify({body: reportData})
                            .then((stringified) => {
                                HtmlGenerator.writeJson(jsonFile, stringified, reportOptions, reportData);
                                callback(true);
                            })
                            .catch((error) => {
                                reportOptions.LOG.error("Json write failed: " + error);
                                callback(false);
                            });

                } catch (ex:any) {
                    reportOptions.LOG.error("Json write failed: " + ex.toString());
                    callback(false);
                }
            }

        } catch (ex) {
            reportOptions.LOG.error("Html Generation processing ended in error: " + ex);
            callback(false);
        }
    }


}

export default HtmlGenerator;