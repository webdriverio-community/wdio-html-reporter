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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var nunjucks_1 = require("nunjucks");
var dayjs_1 = require("dayjs");
var duration_js_1 = require("dayjs/plugin/duration.js");
var log4js_api_1 = require("@log4js-node/log4js-api");
var big_json_1 = require("big-json");
var fs_extra_1 = require("fs-extra");
var lodash_1 = require("lodash");
var node_path_1 = require("node:path");
var encode_js_1 = require("./encode.js");
dayjs_1["default"].extend(duration_js_1["default"]);
var node_url_1 = require("node:url");
var HtmlGenerator = /** @class */ (function () {
    function HtmlGenerator() {
    }
    HtmlGenerator.writeJson = function (jsonFile, stringified, reportOptions, reportData) {
        fs_extra_1["default"].outputFileSync(jsonFile, stringified);
        reportOptions.LOG.info("Json write completed: " + jsonFile);
    };
    HtmlGenerator.htmlOutput = function (reportOptions, reportData) {
        return __awaiter(this, void 0, void 0, function () {
            var specFileReferences, dirname, environment, i, suite_1, j, test_1, html, jsonFile, stringified, error_1, ex_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!reportOptions.LOG) {
                            reportOptions.LOG = log4js_api_1["default"].getLogger(reportOptions.debug ? 'debug' : 'default');
                        }
                        specFileReferences = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        reportOptions.LOG.info("Html Generation started");
                        dirname = node_url_1["default"].fileURLToPath(new URL('.', import.meta.url));
                        environment = nunjucks_1["default"].configure([node_path_1["default"].join(dirname, '../templates/')], {
                            autoescape: true
                        });
                        environment.addGlobal('renderImage', function (screenshotFile, screenshotPath) {
                            // occurs when there is an image to render
                            var relPath;
                            try {
                                if (!fs_extra_1["default"].existsSync(screenshotFile)) {
                                    if (screenshotPath) {
                                        screenshotFile = "".concat(screenshotPath, "/").concat(screenshotFile);
                                    }
                                    else {
                                        screenshotFile = "".concat(screenshotFile);
                                    }
                                }
                                if (!fs_extra_1["default"].existsSync(screenshotFile)) {
                                    reportOptions.LOG.error("renderImage: file doesnt exist: " + relPath);
                                }
                                relPath = node_path_1["default"].relative(reportOptions.outputDir, screenshotFile);
                                if (reportOptions.linkScreenshots) {
                                    reportOptions.LOG.info("renderImage: Screenshot Relative Path: " + relPath);
                                    return relPath;
                                }
                                else {
                                    return (0, encode_js_1["default"])(node_path_1["default"].resolve(screenshotFile));
                                }
                            }
                            catch (err) {
                                reportOptions.LOG.error("renderImage: Error processing file: " + relPath + " " + err);
                                return relPath;
                            }
                        });
                        environment.addGlobal('renderVideo', function (videoCaptureFile) {
                            var relPath = node_path_1["default"].relative(reportOptions.outputDir, videoCaptureFile).split(node_path_1["default"].sep).join(node_path_1["default"].posix.sep);
                            try {
                                reportOptions.LOG.debug("Video Relative Path: " + relPath);
                                return relPath;
                            }
                            catch (err) {
                                reportOptions.LOG.error("renderVideo: Error processing file: " + relPath + " " + err);
                                return relPath;
                            }
                        });
                        environment.addGlobal('displaySpecFile', function (suiteInfo) {
                            if (suiteInfo && suiteInfo.file) {
                                if (specFileReferences && !specFileReferences.includes(suiteInfo.file)) {
                                    specFileReferences.push(suiteInfo.file);
                                    return true;
                                }
                            }
                            return false;
                        });
                        environment.addGlobal('formatSpecFile', function (suiteInfo) {
                            // Display file path of spec
                            var specFile = "".concat(suiteInfo.file.replace(process.cwd(), ''));
                            return specFile;
                        });
                        environment.addGlobal('testStateColour', function (testInfo) {
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
                        environment.addGlobal('testStateClass', function (testInfo) {
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
                        environment.addGlobal('testStateIcon', function (testInfo) {
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
                        environment.addGlobal('suiteStateColour', function (suiteInfo) {
                            if (suiteInfo.type.includes('feature')) {
                                return 'suite-feature';
                            }
                            if (!suiteInfo || !suiteInfo.tests) {
                                return 'suite-unknown';
                            }
                            var numTests = Object.keys(suiteInfo.tests).length;
                            var tests = suiteInfo.tests;
                            lodash_1["default"].values(tests).find(function (test) {
                                if (test.state === "pending") {
                                    --numTests;
                                }
                            });
                            var fail = lodash_1["default"].values(tests).find(function (test) {
                                return test.state === 'failed';
                            });
                            if (fail != null) {
                                return 'suite-fail';
                            }
                            var passes = lodash_1["default"].values(tests).filter(function (test) {
                                return test.state === 'passed';
                            });
                            if (passes.length === numTests && numTests > 0) {
                                return 'suite-pass';
                            }
                            //skipped is the lowest priority check
                            var skipped = lodash_1["default"].values(tests).find(function (test) {
                                return test.state === 'skipped';
                            });
                            if (skipped != null) {
                                return 'suite-pending';
                            }
                            return 'suite-unknown';
                        });
                        environment.addGlobal('humanizeDuration', function (duration) {
                            return dayjs_1["default"].duration(duration, "milliseconds").format('HH:mm:ss.SSS');
                        });
                        environment.addGlobal('ifCollapseTests', function (text) {
                            return reportOptions.collapseTests;
                        });
                        environment.addGlobal('ifCollapseSuites', function (text) {
                            return reportOptions.collapseSuites;
                        });
                        environment.addGlobal('logClass', function (text) {
                            if (text && text.includes('Test Iteration')) {
                                return "test-iteration";
                            }
                            else {
                                return "log-output";
                            }
                        });
                        if (!fs_extra_1["default"].pathExistsSync(reportOptions.outputDir)) return [3 /*break*/, 5];
                        if (reportOptions.removeOutput) {
                            for (i = 0; i < reportData.suites.length; i++) {
                                suite_1 = reportData.suites[i];
                                for (j = 0; j < suite_1.tests.length; j++) {
                                    test_1 = suite_1.tests[j];
                                    test_1.output = [];
                                }
                            }
                        }
                        try {
                            html = nunjucks_1["default"].render("report.html", reportData);
                            if (fs_extra_1["default"].pathExistsSync(reportOptions.outputDir)) {
                                fs_extra_1["default"].outputFileSync(reportData.reportFile, html);
                            }
                        }
                        catch (error) {
                            reportOptions.LOG.error("Html Generation failed: " + error);
                        }
                        if (!reportOptions.produceJson) return [3 /*break*/, 5];
                        jsonFile = reportData.reportFile.replace('.html', '.json');
                        reportOptions.LOG.info("Json report write starting: " + jsonFile);
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, big_json_1["default"].stringify({ body: reportData })];
                    case 3:
                        stringified = _a.sent();
                        HtmlGenerator.writeJson(jsonFile, stringified, reportOptions, reportData);
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        reportOptions.LOG.error("Json write failed: " + error_1);
                        return [3 /*break*/, 5];
                    case 5:
                        reportOptions.LOG.info("Html Generation Completed");
                        return [3 /*break*/, 7];
                    case 6:
                        ex_1 = _a.sent();
                        reportOptions.LOG.error("Html Generation processing ended in error: " + ex_1);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return HtmlGenerator;
}());
exports["default"] = HtmlGenerator;
