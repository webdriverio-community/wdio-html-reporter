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
var fs_extra_1 = require("fs-extra");
var path_1 = require("path");
var log4js = require('log4js');
var chai_1 = require("chai");
var index_js_1 = require("../src/index.js");
var testdata_js_1 = require("./testdata.js");
log4js.configure({
    appenders: {
        fileLog: {
            type: 'file',
            filename: "logs/html-reporter.log",
            maxLogSize: 5000000,
            level: 'debug'
        },
        debugLog: {
            type: 'file',
            filename: "logs/debug-html-reporter.log",
            maxLogSize: 5000000,
            level: 'debug'
        },
        out: {
            type: 'stdout',
            layout: {
                type: "pattern",
                pattern: "%[[%p]%] - %10.-100f{2} | %7.12l:%7.12o - %[%m%]"
            }
        },
        filterOut: {
            type: 'stdout',
            layout: {
                type: "pattern",
                pattern: "%[[%p]%] - %10.-100f{2} | %7.12l:%7.12o - %[%m%]"
            },
            level: 'info'
        }
    },
    categories: {
        file: { appenders: ['fileLog'], level: 'info' },
        "default": { appenders: ['fileLog'], level: 'info' },
        debug: { appenders: ['debugLog'], level: 'debug' }
    }
});
var logger = log4js.getLogger("debug");
var reportAggregator;
var htmlReporter = new index_js_1.HtmlReporter({
    outputDir: './reports/html-reports/valid',
    filename: 'report.html',
    reportTitle: 'Unit Test Report Title',
    LOG: logger,
    browserName: "dummy"
});
describe('HtmlReporter', function () {
    before(function () {
        reportAggregator = new index_js_1.ReportAggregator({
            outputDir: './reports/html-reports/valid',
            filename: 'master-report.html',
            reportTitle: 'Master Report',
            browserName: "test browser",
            LOG: logger
        });
        reportAggregator.clean();
    });
    describe('on create', function () {
        it('should verify initial properties', function () {
            (0, chai_1.expect)(htmlReporter._suiteUids.size).to.deep.equal(0);
            (0, chai_1.expect)(htmlReporter._indents).to.equal(0);
            (0, chai_1.expect)(htmlReporter._suiteIndents).to.deep.equal({});
            (0, chai_1.expect)(htmlReporter.defaultTestIndent).to.equal('   ');
            (0, chai_1.expect)(htmlReporter.metrics).to.deep.equal({
                passed: 0,
                skipped: 0,
                failed: 0,
                duration: 0
            });
        });
    });
    describe('onRunnerStart', function () {
        before(function () {
            htmlReporter.onRunnerStart(testdata_js_1.RUNNER);
        });
        it('should set cid', function () {
            (0, chai_1.expect)(htmlReporter._currentCid).to.equal(testdata_js_1.RUNNER.cid);
        });
    });
    describe('onSuiteStart', function () {
        before(function () {
            htmlReporter.onSuiteStart(testdata_js_1.SUITES[0]);
        });
        it('should add to suiteUids', function () {
            (0, chai_1.expect)(htmlReporter._suiteUids.size).to.equal(1);
            // expect(htmlReporter._suiteUids[0]).to.equal('Foo test1')
            (0, chai_1.expect)(htmlReporter._currentSuiteUid).to.equal('Foo test1');
        });
        it('should increase suiteIndents', function () {
            (0, chai_1.expect)(htmlReporter._suiteIndents['Foo test1']).to.equal(1);
        });
    });
    describe('onTestStart', function () {
        before(function () {
            htmlReporter.onTestStart(testdata_js_1.SUITES[0].tests[0]);
        });
    });
    describe('onTestPass', function () {
        before(function () {
            htmlReporter.onTestPass(testdata_js_1.SUITES[0].tests[0]);
        });
        it('should increase metrics.passed by 1', function () {
            (0, chai_1.expect)(htmlReporter.metrics.passed).to.equal(1);
        });
        after(function () {
            htmlReporter.onTestEnd(testdata_js_1.SUITES[0].tests[0]);
        });
    });
    describe('onTestStart', function () {
        before(function () {
            htmlReporter.onTestStart(testdata_js_1.SUITES[0].tests[1]);
        });
    });
    describe('onTestFail', function () {
        before(function () {
            htmlReporter.onTestFail(testdata_js_1.SUITES[0].tests[1]);
        });
        it('should increase metrics.failed by 1', function () {
            (0, chai_1.expect)(htmlReporter.metrics.failed).to.equal(1);
        });
        after(function () {
            htmlReporter.onTestEnd(testdata_js_1.SUITES[0].tests[1]);
        });
    });
    describe('onTestStart', function () {
        before(function () {
            htmlReporter.onTestStart(testdata_js_1.SUITES[0].tests[2]);
        });
    });
    describe('onTestSkip', function () {
        before(function () {
            htmlReporter.onTestSkip(testdata_js_1.SUITES[0].tests[2]);
        });
        it('should increase metrics.skipped by 1', function () {
            (0, chai_1.expect)(htmlReporter.metrics.skipped).to.equal(1);
        });
        after(function () {
            htmlReporter.onTestEnd(testdata_js_1.SUITES[0].tests[2]);
        });
    });
    describe('onTestEnd', function () {
        before(function () {
            htmlReporter.onTestEnd(testdata_js_1.SUITES[0].tests[0]);
            htmlReporter.onTestEnd(testdata_js_1.SUITES[0].tests[1]);
            htmlReporter.onTestEnd(testdata_js_1.SUITES[0].tests[2]);
        });
    });
    describe('onSuiteEnd', function () {
        before(function () {
            htmlReporter.onSuiteEnd(testdata_js_1.SUITES[0]);
        });
        it('should decrease indents', function () {
            (0, chai_1.expect)(htmlReporter._indents).to.equal(0);
        });
        it('should add the suite to the suites array', function () {
            (0, chai_1.expect)(htmlReporter._suiteUids.size).to.equal(1);
        });
    });
    describe('onRunnerEnd', function () {
        it('should call htmlOutput method', function () {
            var _this = this;
            (function () { return __awaiter(_this, void 0, void 0, function () {
                var reportFile;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, htmlReporter.onRunnerEnd(testdata_js_1.RUNNER)];
                        case 1:
                            _a.sent();
                            reportFile = path_1["default"].join(process.cwd(), htmlReporter.options.outputDir, encodeURIComponent(htmlReporter._currentSuiteUid), encodeURIComponent(htmlReporter._currentCid), htmlReporter.options.filename);
                            (0, chai_1.expect)(fs_extra_1["default"].existsSync(reportFile)).to.equal(true);
                            return [2 /*return*/];
                    }
                });
            }); })();
        });
        it('should invoke the reportAggregator', function () {
            var _this = this;
            (function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, reportAggregator.createReport()];
                        case 1:
                            _a.sent();
                            (0, chai_1.expect)(fs_extra_1["default"].existsSync(reportAggregator.reportFile)).to.equal(true);
                            return [2 /*return*/];
                    }
                });
            }); })();
        });
    });
});
