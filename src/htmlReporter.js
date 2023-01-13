"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var reporter_1 = require("@wdio/reporter");
var types_js_1 = require("./types.js");
var dayjs_1 = require("dayjs");
var wdio_report_events_1 = require("@rpii/wdio-report-events");
var typescript_string_operations_1 = require("typescript-string-operations");
var reportGenerator_js_1 = require("./reportGenerator.js");
var fs_extra_1 = require("fs-extra");
var path_1 = require("path");
var log4js_api_1 = require("@log4js-node/log4js-api");
var reportProxy = new wdio_report_events_1["default"]();
var timeFormat = "YYYY-MM-DDTHH:mm:ss.SSS[Z]";
var HtmlReporter = /** @class */ (function (_super) {
    __extends(HtmlReporter, _super);
    function HtmlReporter(options) {
        var _this = _super.call(this, Object.assign({
            stdout: true,
            logFile: './logs/reporter.log',
            reporterSyncTimeout: 120000,
            reporterSyncInterval: 1000
        }, options)) || this;
        _this._suiteIndents = {};
        _this._suiteUids = new Map();
        _this._testUids = new Map();
        _this._specs = new Map();
        _this._suites = [];
        var opts = new types_js_1.HtmlReporterOptions();
        //@ts-ignore
        opts.stdout = true,
            _this.options = Object.assign(opts, options);
        if (!_this.options.LOG) {
            _this.options.LOG = log4js_api_1["default"].getLogger(_this.options.debug ? 'debug' : 'default');
            ;
        }
        var dir = _this.options.outputDir + 'screenshots';
        fs_extra_1["default"].ensureDirSync(dir);
        _this._indents = 0;
        _this._suiteIndents = {};
        _this.metrics = new types_js_1.Metrics();
        _this.defaultTestIndent = '   ';
        _this._currentSuiteUid = "suite uid";
        _this._currentTestUid = "test uid";
        _this._currentCid = "cid";
        reportProxy.connectMessageEvent(_this.saveMessage.bind(_this));
        reportProxy.connectScreenshotEvent(_this.saveScreenshot.bind(_this));
        reportProxy.connectVideoCaptureEvent(_this.saveVideo.bind(_this));
        _this.reportGenerator = new reportGenerator_js_1["default"](_this.options);
        return _this;
    }
    Object.defineProperty(HtmlReporter.prototype, "isSynchronised", {
        get: function () {
            //@ts-ignore
            var inSync = this.reportGenerator.isSynchronised();
            this.options.LOG.debug("isSynchronized: " + inSync);
            return inSync;
        },
        enumerable: false,
        configurable: true
    });
    HtmlReporter.prototype.onRunnerStart = function (runner) {
        this.options.LOG.info(typescript_string_operations_1.String.format("onRunnerStart: {0}", runner.cid));
        // this.options.LOG.debug(JSON.stringify(runner));
        //todo look at fix, not async safe. but one cid per report file
        this._currentCid = runner.cid;
        this.metrics.passed = 0;
        this.metrics.skipped = 0;
        this.metrics.failed = 0;
        this.metrics.start = (0, dayjs_1["default"])().utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
        this._specs.set(runner.cid, runner);
    };
    HtmlReporter.prototype.onSuiteStart = function (suite) {
        this._suiteUids.set(suite.uid, suite);
        if (suite.type === 'feature') {
            this._indents = 0;
            this._suiteIndents[suite.uid] = this._indents;
        }
        else {
            this._suiteIndents[suite.uid] = ++this._indents;
        }
        this._currentSuiteUid = suite.uid;
        suite.start = new Date();
        this.options.LOG.info(typescript_string_operations_1.String.format("onSuiteStart: {0}:{1}", suite.cid, suite.uid));
        this.options.LOG.debug(JSON.stringify(suite));
    };
    HtmlReporter.prototype.onTestStart = function (theTest) {
        this.options.LOG.info(typescript_string_operations_1.String.format("onTestStart: {0}:{1}", theTest.cid, theTest.uid));
        this.options.LOG.debug(JSON.stringify(theTest));
        this._currentTestUid = theTest.uid;
        //@ts-ignore
        theTest.events = [];
        //@ts-ignore
        theTest.errorIndex = 0;
        this._testUids.set(theTest.uid, theTest);
    };
    HtmlReporter.prototype.onTestPass = function (theTest) {
        this.options.LOG.info(typescript_string_operations_1.String.format("onTestPass: {0}:{1}", theTest.cid, theTest.uid));
        this.options.LOG.debug(JSON.stringify(theTest));
        var test = this.getTest(theTest.uid);
        if (test) {
            this.moveErrorsToEvents(test);
        }
        this.metrics.passed++;
    };
    HtmlReporter.prototype.onTestSkip = function (test) {
        this.options.LOG.info(typescript_string_operations_1.String.format("onTestSkip: {0}:{1}", test.cid, test.uid));
        this.options.LOG.debug(JSON.stringify(test));
        this.metrics.skipped++;
    };
    HtmlReporter.prototype.onTestFail = function (theTest) {
        this.options.LOG.info(typescript_string_operations_1.String.format("onTestFail: {0}:{1}", theTest.cid, theTest.uid));
        this.options.LOG.debug(JSON.stringify(theTest));
        var test = this.getTest(theTest.uid);
        if (test) {
            this.moveErrorsToEvents(test);
        }
        this.metrics.failed++;
    };
    HtmlReporter.prototype.onTestEnd = function (theTest) {
        this.options.LOG.info(typescript_string_operations_1.String.format("onTestEnd: {0}:{1}", theTest.cid, theTest.uid));
        this.options.LOG.debug(JSON.stringify(theTest));
        var test = this.getTest(theTest.uid);
        if (test) {
            this.moveErrorsToEvents(test);
        }
    };
    HtmlReporter.prototype.onHookStart = function (hook) {
        this.options.LOG.info(typescript_string_operations_1.String.format("onHookStart: {0}:{1}", hook.cid, hook.uid));
    };
    HtmlReporter.prototype.onHookEnd = function (hook) {
        this.options.LOG.info(typescript_string_operations_1.String.format("onHookEnd: {0}:{1}", hook.cid, hook.uid));
        if (hook.error) {
            this.metrics.failed++;
        }
    };
    HtmlReporter.prototype.onSuiteEnd = function (suite) {
        this.options.LOG.info(typescript_string_operations_1.String.format("onSuiteEnd: {0}:{1}", suite.cid, suite.uid));
        this.options.LOG.debug(JSON.stringify(suite));
        this._indents--;
        suite.end = new Date();
        this._suites.push(suite);
    };
    HtmlReporter.prototype.isScreenshotCommand = function (command) {
        var isScreenshotEndpoint = /\/session\/[^/]*(\/element\/[^/]*)?\/screenshot/;
        return (
        // WebDriver protocol
        (command.endpoint && isScreenshotEndpoint.test(command.endpoint)) ||
            // DevTools protocol
            command.command === 'takeScreenshot');
    };
    //this is a hack to get around lack of onScreenshot event
    HtmlReporter.prototype.onAfterCommand = function (command) {
        if (this.options.useOnAfterCommandForScreenshot) {
            if (this.isScreenshotCommand(command) && command.result.value) {
                var timestamp = (0, dayjs_1["default"])().format('YYYYMMDD-HHmmss.SSS');
                var filepath = path_1["default"].join(this.options.outputDir, '/screenshots/', encodeURIComponent(this._currentCid), timestamp, this.options.filename + '.png');
                this.options.LOG.info(typescript_string_operations_1.String.format("onAfterCommand: {0}:{1} taking screenshot {2}", this._currentCid, this._currentTestUid, filepath));
                fs_extra_1["default"].outputFileSync(filepath, Buffer.from(command.result.value, 'base64'));
                var test_1 = this.getTest(this._currentTestUid);
                if (test_1) {
                    //@ts-ignore
                    test_1.events.push({ type: 'screenshot', value: filepath });
                }
            }
        }
    };
    HtmlReporter.prototype.onRunnerEnd = function (runner) {
        var _a;
        this.options.LOG.info(typescript_string_operations_1.String.format("onRunnerEnd: {0}", runner.cid));
        // this.options.LOG.debug(JSON.stringify(runner));
        this.metrics.end = (0, dayjs_1["default"])().utc().format();
        this.metrics.duration = runner._duration;
        var suites = this.filterChildSuites();
        var reportFile = path_1["default"].join(process.cwd(), this.options.outputDir, encodeURIComponent(this._currentSuiteUid), encodeURIComponent(this._currentCid), this.options.filename);
        var reportData = new types_js_1.ReportData(this.options.reportTitle, runner, suites, this.metrics, reportFile, this.options.browserName);
        (_a = this.reportGenerator) === null || _a === void 0 ? void 0 : _a.createReport(reportData);
    };
    HtmlReporter.prototype.getSuite = function (uid) {
        if (this._suiteUids.has(uid)) {
            return this._suiteUids.get(uid);
        }
        return undefined;
    };
    HtmlReporter.prototype.removeSuite = function (uid) {
        if (uid && this._suiteUids.has(uid)) {
            this._suiteUids["delete"](uid);
        }
    };
    HtmlReporter.prototype.getTest = function (uid) {
        if (uid && this._testUids.has(uid)) {
            return this._testUids.get(uid);
        }
    };
    //this is a hack.  we have to move all the things in test.errors before they get blown away
    HtmlReporter.prototype.moveErrorsToEvents = function (test) {
        if (test.errors) {
            //@ts-ignore
            for (var i = test.errorIndex; i < test.errors.length; i++) {
                var errorObj = test.errors[i];
                var stack = test.errors[i].stack;
                if (stack && stack.includes("AssertionError")) {
                    errorObj = {
                        //@ts-ignore
                        message: test.errors[i].message.split("      \n").shift(),
                        stack: test.errors[i].stack
                    };
                }
                //@ts-ignore
                test.events.push(new types_js_1.InternalReportEvent('Error', errorObj));
            }
            //@ts-ignore
            test.errorIndex = test.errors.length;
        }
    };
    HtmlReporter.prototype.saveScreenshot = function (filepath) {
        this.options.LOG.info(typescript_string_operations_1.String.format("saveScreenshot: {0}", filepath));
        var test = this.getTest(this._currentTestUid);
        if (test) {
            this.moveErrorsToEvents(test);
            //@ts-ignore
            test.events.push(new types_js_1.InternalReportEvent('screenshot', filepath));
        }
    };
    HtmlReporter.prototype.saveVideo = function (filepath) {
        this.options.LOG.info(typescript_string_operations_1.String.format("saveVideo: {0}", filepath));
        var test = this.getTest(this._currentTestUid);
        if (test) {
            this.moveErrorsToEvents(test);
            //@ts-ignore
            test.events.push(new types_js_1.InternalReportEvent('video-capture', filepath));
        }
    };
    HtmlReporter.prototype.saveMessage = function (message) {
        this.options.LOG.info(typescript_string_operations_1.String.format("saveMessage: {0}", message));
        var test = this.getTest(this._currentTestUid);
        if (test) {
            this.moveErrorsToEvents(test);
            //@ts-ignore
            test.events.push({ type: 'log', value: message });
        }
    };
    HtmlReporter.prototype.filterChildSuites = function () {
        var suites = Array.from(this._suiteUids.values());
        for (var i = suites.length - 1; i >= 0; i--) {
            var parentSuite = suites[i];
            if (parentSuite.suites) {
                for (var k = parentSuite.suites.length - 1; k >= 0; k--) {
                    var suite_1 = parentSuite.suites[k];
                    this.removeSuite(suite_1.uid);
                }
            }
        }
        return Array.from(this._suiteUids.values());
    };
    HtmlReporter.prototype.indent = function (uid) {
        var indents = this._suiteIndents[uid];
        return indents === 0 ? '' : Array(indents).join('    ');
    };
    return HtmlReporter;
}(reporter_1["default"]));
exports["default"] = HtmlReporter;
