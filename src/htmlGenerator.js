"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nunjucks_1 = __importDefault(require("nunjucks"));
const dayjs_1 = __importDefault(require("dayjs"));
const duration_1 = __importDefault(require("dayjs/plugin/duration"));
const log4js_api_1 = __importDefault(require("@log4js-node/log4js-api"));
const json = require('big-json');
const typescript_string_operations_1 = require("typescript-string-operations");
const fs = require('fs-extra');
const _ = require('lodash');
const path = require('path');
const encode = require('./encode').default;
dayjs_1.default.extend(duration_1.default);
class HtmlGenerator {
    static writeJson(jsonFile, stringified, reportOptions, reportData) {
        fs.outputFileSync(jsonFile, stringified);
        reportOptions.LOG.info("Json write completed: " + jsonFile);
    }
    static htmlOutput(reportOptions, reportData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!reportOptions.LOG) {
                reportOptions.LOG = log4js_api_1.default.getLogger(reportOptions.debug ? 'debug' : 'default');
            }
            const specFileReferences = [];
            try {
                reportOptions.LOG.info("Html Generation started");
                let environment = nunjucks_1.default.configure([path.join(__dirname, '../templates/')], {
                    autoescape: true,
                });
                environment.addGlobal('renderImage', function (screenshotFile, screenshotPath) {
                    // occurs when there is an error file
                    if (!fs.existsSync(screenshotFile)) {
                        if (screenshotPath) {
                            screenshotFile = `${screenshotPath}/${screenshotFile}`;
                        }
                        else {
                            screenshotFile = `${screenshotFile}`;
                        }
                    }
                    if (reportOptions.linkScreenshots) {
                        let relPath = path.relative(reportOptions.outputDir, screenshotFile);
                        reportOptions.LOG.info("Screenshot Relative Path: " + relPath);
                        return relPath;
                    }
                    else {
                        return encode(path.resolve(screenshotFile));
                    }
                });
                environment.addGlobal('renderVideo', function (videoCaptureFile) {
                    let relPath = path.relative(reportOptions.outputDir, videoCaptureFile).split(path.sep).join(path.posix.sep);
                    reportOptions.LOG.debug("Video Relative Path: " + relPath);
                    return relPath;
                });
                environment.addGlobal('displaySpecFile', (suiteInfo) => {
                    if (suiteInfo && suiteInfo.file) {
                        if (specFileReferences && !specFileReferences.includes(suiteInfo.file)) {
                            specFileReferences.push(suiteInfo.file);
                            return true;
                        }
                    }
                    return false;
                });
                environment.addGlobal('formatSpecFile', (suiteInfo) => {
                    // Display file path of spec
                    let specFile = `${suiteInfo.file.replace(process.cwd(), '')}`;
                    return specFile;
                });
                environment.addGlobal('testStateColour', (testInfo) => {
                    if (testInfo.state === 'passed') {
                        return 'test-pass';
                    }
                    else if (testInfo.state === 'failed') {
                        return 'test-fail';
                    }
                    else if (testInfo.state === 'pending') {
                        return 'test-pending';
                    }
                    else if (testInfo.state === 'skipped') {
                        return 'test-skipped';
                    }
                });
                environment.addGlobal('testStateClass', (testInfo) => {
                    if (testInfo.state === 'passed') {
                        return 'success';
                    }
                    else if (testInfo.state === 'failed') {
                        return 'error';
                    }
                    else if (testInfo.state === 'pending') {
                        return 'pending';
                    }
                    else if (testInfo.state === 'skipped') {
                        return 'skipped';
                    }
                });
                environment.addGlobal('testStateIcon', (testInfo) => {
                    if (testInfo.state === 'passed') {
                        return '&#10004;';
                    }
                    else if (testInfo.state === 'failed') {
                        return '&#10006;';
                    }
                    else if (testInfo.state === 'pending') {
                        return '&#10004;';
                    }
                    else if (testInfo.state === 'skipped') {
                        return '&#10034;';
                    }
                });
                environment.addGlobal('suiteStateColour', (suiteInfo) => {
                    if (suiteInfo.type.includes('feature')) {
                        return 'suite-feature';
                    }
                    if (!suiteInfo || !suiteInfo.tests) {
                        return 'suite-unknown';
                    }
                    let numTests = Object.keys(suiteInfo.tests).length;
                    let tests = suiteInfo.tests;
                    _.values(tests).find((test) => {
                        if (test.state === "pending") {
                            --numTests;
                        }
                    });
                    let fail = _.values(tests).find((test) => {
                        return test.state === 'failed';
                    });
                    if (fail != null) {
                        return 'suite-fail';
                    }
                    let passes = _.values(tests).filter((test) => {
                        return test.state === 'passed';
                    });
                    if (passes.length === numTests && numTests > 0) {
                        return 'suite-pass';
                    }
                    //skipped is the lowest priority check
                    let skipped = _.values(tests).find((test) => {
                        return test.state === 'skipped';
                    });
                    if (skipped != null) {
                        return 'suite-pending';
                    }
                    return 'suite-unknown';
                });
                environment.addGlobal('humanizeDuration', (duration) => {
                    return dayjs_1.default.duration(duration, "milliseconds").format('HH:mm:ss.SSS');
                });
                environment.addGlobal('ifCollapseTests', (text) => {
                    return reportOptions.collapseTests;
                });
                environment.addGlobal('ifCollapseSuites', (text) => {
                    return reportOptions.collapseSuites;
                });
                environment.addGlobal('logClass', (text) => {
                    if (text && text.includes('Test Iteration')) {
                        return "test-iteration";
                    }
                    else {
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
                    let html = nunjucks_1.default.render("report.html", reportData);
                    if (fs.pathExistsSync(reportOptions.outputDir)) {
                        reportData.reportFile = reportData.reportFile.replace('.html', typescript_string_operations_1.String.Format('-{0}.html', reportData.info.cid));
                        fs.outputFileSync(reportData.reportFile, html);
                    }
                    if (reportOptions.produceJson) {
                        let jsonFile = reportData.reportFile.replace('.html', '.json');
                        reportOptions.LOG.info("Json report write starting: " + jsonFile);
                        try {
                            let stringified = yield json.stringify({ body: reportData });
                            HtmlGenerator.writeJson(jsonFile, stringified, reportOptions, reportData);
                        }
                        catch (error) {
                            reportOptions.LOG.error("Json write failed: " + error);
                        }
                    }
                }
                reportOptions.LOG.info("Html Generation Completed");
            }
            catch (ex) {
                reportOptions.LOG.error("Html Generation processing ended in error: " + ex);
            }
        });
    }
}
exports.default = HtmlGenerator;
