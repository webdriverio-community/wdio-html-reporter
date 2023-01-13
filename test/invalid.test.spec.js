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
var chai_1 = require("chai");
var index_js_1 = require("../src/index.js");
var testdata_js_1 = require("./testdata.js");
var log4js = require('log4js');
log4js.configure({
    appenders: {
        fileLog: {
            type: 'file',
            filename: "logs/console.log"
        },
        'out': {
            type: 'stdout',
            layout: {
                type: "colored"
            }
        }
    },
    categories: {
        file: { appenders: ['fileLog'], level: 'debug' },
        "default": { appenders: ['out', 'fileLog'], level: 'debug' }
    }
});
var logger = log4js.getLogger("default");
var reportAggregator;
var htmlReporter = new index_js_1.HtmlReporter({
    outputDir: './reports/html-reports/invalid/',
    filename: 'report.html',
    reportTitle: 'Unit Test Report Title',
    showInBrowser: false,
    browserName: "dummy",
    LOG: logger,
    collapseTests: true,
    useOnAfterCommandForScreenshot: false
});
describe('HtmlReporter', function () {
    before(function () {
        reportAggregator = new index_js_1.ReportAggregator({
            debug: false,
            outputDir: './reports/html-reports/invalid/',
            filename: 'master-report.html',
            reportTitle: 'Master Report',
            browserName: "test browser",
            showInBrowser: true,
            collapseTests: false,
            LOG: logger,
            useOnAfterCommandForScreenshot: false
        });
        reportAggregator.clean();
    });
    //
    // describe('on create', function () {
    //     it('should verify initial properties', function () {
    //         expect(Array.isArray(htmlReporter.suiteUids)).to.equal(true);
    //         expect(htmlReporter.suiteUids.length).to.equal(0);
    //         expect(Array.isArray(htmlReporter.suites)).to.equal(true);
    //         expect(htmlReporter.suites.length).to.deep.equal(0);
    //         expect(htmlReporter.indents).to.equal(0);
    //         expect(htmlReporter.suiteIndents).to.deep.equal({});
    //         expect(htmlReporter.defaultTestIndent).to.equal('   ');
    //         expect(htmlReporter.metrics).to.deep.equal({
    //             passed: 0,
    //             skipped: 0,
    //             failed: 0,
    //             start: 0,
    //             end: 0,
    //             duration: 0
    //         });
    //     })
    // });
    describe('onRunnerStart', function () {
        before(function () {
            htmlReporter.onRunnerStart(testdata_js_1.RUNNER);
        });
        //This will fail.
        it('set cid test', function () {
            (0, chai_1.expect)(htmlReporter._currentCid).to.equal("0-0");
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
                            //wipe out output
                            fs_extra_1["default"].emptyDirSync(path_1["default"].join(process.cwd(), htmlReporter.options.outputDir, encodeURIComponent(htmlReporter._currentSuiteUid), encodeURIComponent(htmlReporter._currentCid)));
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
