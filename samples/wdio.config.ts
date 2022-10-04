import {ReportAggregator } from 'wdio-html-nice-reporter';
import commands from "@rpii/wdio-commands" ;
import {String, StringBuilder} from 'typescript-string-operations';

const localEnv =  require('dotenv');
localEnv.config();
const video = require('wdio-video-reporter');


const LOG = require('log4js');
LOG.configure({
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
        'out': {
            type: 'stdout',
            layout: {
                type: "colored"
            }
        },
        'filterOut': {
            type: 'stdout',
            layout: {
                type: "colored"
            },
            level: 'info'
        }
    },
    categories: {
        file: {appenders: ['fileLog'], level: 'info'},
        default: {appenders: ['out', 'fileLog'], level: 'info'},
        console: {appenders: ['out'], level: 'info'},
        debug: {appenders: ['debugLog'], level: 'debug'}
    }
});

//pick the category above to match the output you want.
let logger = LOG.getLogger("default");

let reportAggregator : ReportAggregator;

const BaseConfig: WebdriverIO.Config = {


    //
    // ====================cd ..
    // Runner Configuration
    // ====================
    //
    // WebdriverIO allows it to run your tests in arbitrary locations (e.g. locally or
    // on a remote machine).
    runner: 'local',

    //
    // ==================
    // Specify Test Files
    // ==================
    // Define which test specs should run. The pattern is relative to the directory
    // from which `wdio` was called. Notice that, if you are calling `wdio` from an
    // NPM script (see https://docs.npmjs.com/cli/run-script) then the current working
    // directory is where your package.json resides, so `wdio` will be called from there.
    //
    specs: [
        './build/test/specs/*.js'
    ],
    // Patterns to exclude.
    exclude: [
        "./build/test/specs/login2.spec.js"
    ],
    suites: {
        'loginTestSuite': [
            "./build/test/specs/login.spec.js"
        ]
    },
    //
    // ============
    // Capabilities
    // ============
    capabilities: [
        {
            // Set maxInstances to 1 if screen recordings are enabled:
            maxInstances: 1,
        }
    ],
    maxInstances: 1,

    //
    // ===================
    // Test Configurations
    // ===================
    // Define all options that are relevant for the WebdriverIO instance here
    //
    // Level of logging verbosity: trace | debug | info | warn | error | silent
    logLevel: 'warn',
    outputDir: "./logs",

    //
    // If you only want to run your tests until a specific amount of tests have failed use
    // bail (default is 0 - don't bail, run all tests).
    bail: 0,
    //
    // Set a base URL in order to shorten url command calls. If your `url` parameter starts
    // with `/`, the base url gets prepended, not including the path portion of your baseUrl.
    // If your `url` parameter starts without a scheme or `/` (like `some/path`), the base url
    // gets prepended directly.
    baseUrl: process.env.TEST_SERVER,
    //
    // Default timeout for all waitFor* commands.
    // not a typo...
    //@ts-ignore
    waitforTimeout: parseInt(process.env.WAIT_FOR_TIMEOUT),
    //
    // Default timeout in milliseconds for request
    // if Selenium Grid doesn't send response
    connectionRetryTimeout: 160000,
    //
    // Default request retries count
    connectionRetryCount: 3,

    // Framework you want to run your specs with.
    // The following are supported: Mocha, Jasmine, and Cucumber
    // see also: https://webdriver.io/docs/frameworks.html
    //
    // Make sure you have the wdio adapter package for the specific framework installed
    // before running any tests.
    framework: 'mocha',
    mochaOpts: {
        //@ts-ignore
        ui: 'tdd',
        timeout: 120000,
        compilers: ['tsconfig-paths/register'],
        require: ['ts-node/register']
    },

    reporters: [
        "spec",
        [video, {
            saveAllVideos: true,       // If true, also saves videos for successful test cases
            videoSlowdownMultiplier: 3, // Higher to get slower videos, lower for faster videos [Value 1-100]
            videoRenderTimeout: 5,      // Max seconds to wait for a video to finish rendering\
            outputDir: 'reports/html-reports/screenshots',
        }],

        ["html-nice", {
            debug: false,
            outputDir: './reports/html-reports/',
            filename: 'report.html',
            reportTitle: 'Web Test Report',
            showInBrowser: false,
            useOnAfterCommandForScreenshot: false,
            linkScreenshots: true,
            LOG: logger
        }]
    ],

    //
    // =====
    // Hooks
    // =====
    // WebdriverIO provides several hooks you can use to interfere with the test process in order to enhance
    // it and to build services around it. You can either apply a single function or an array of
    // methods to it. If one of them returns with a promise, WebdriverIO will wait until that promise got
    // resolved to continue.
    /**
     * Gets executed once before all workers get launched.
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     */
    onPrepare: function (config, capabilities) {
        reportAggregator = new ReportAggregator(
            {
                outputDir: './reports/html-reports/',
                filename: process.env.TEST_BROWSER + '-master-report.html',
                reportTitle: 'Micro-Magic Web Test Report',
                browserName: process.env.TEST_BROWSER ? process.env.TEST_BROWSER : 'unspecified',
                showInBrowser: true,
                LOG: logger
            });

        reportAggregator.clean();
    },
    /**
     * Gets executed just before initialising the webdriver session and test framework. It allows you
     * to manipulate configurations depending on the capability or spec.
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that are to be run
     */
    beforeSession: function (config, capabilities, specs) {
        require('expect-webdriverio');
    },
    /**
     * Gets executed before test execution begins. At this point you can access to all global
     * variables like `browser`. It is the perfect place to define custom commands.
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that are to be run
     */
    before: function (capabilities, specs) {

        //@ts-ignore
        commands.addCommands(driver);
    },
    /**
     * Runs before a WebdriverIO command gets executed.
     * @param {String} commandName hook command name
     * @param {Array} args arguments that command would receive
     */
    // beforeCommand: function (commandName, args) {
    // },

    /**
     * Hook that gets executed before the suite starts
     * @param {Object} suite suite details
     */
    // beforeSuite: function (suite) {
    // },
    /**
     * Function to be executed before a test (in Mocha/Jasmine) or a step (in Cucumber) starts.
     * @param {Object} test test details
     */
    // beforeTest: function (test) {
    // },
    /**
     * Hook that gets executed _before_ a hook within the suite starts (e.g. runs before calling
     * beforeEach in Mocha)
     */
    // beforeHook: function () {
    // },
    /**
     * Hook that gets executed _after_ a hook within the suite starts (e.g. runs after calling
     * afterEach in Mocha)
     */
    // afterHook: function () {
    // },
    /**
     * Function to be executed after a test (in Mocha/Jasmine) or a step (in Cucumber) starts.
     * @param {Object} test test details
     */
    afterTest: function (test: any, context: any, result: any) {
        // if test passed, ignore, else take and save screenshot.
        if (result.passed) {
            return;
        }
        //@ts-ignore
        driver.logScreenshot(String.format("Test Ended in {0}", result.error.stack));
    },


    /**
     * Hook that gets executed after the suite has ended
     * @param {Object} suite suite details
     */
    // afterSuite: function (suite) {
    // },

    /**
     * Runs after a WebdriverIO command gets executed
     * @param {String} commandName hook command name
     * @param {Array} args arguments that command would receive
     * @param {Number} result 0 - command success, 1 - command error
     * @param {Object} error error object if any
     */
    // afterCommand: function (commandName, args, result, error) {
    // },
    /**
     * Gets executed after all tests are done. You still have access to all global variables from
     * the test.
     * @param {Number} result 0 - test pass, 1 - test fail
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that ran
     */
    // after: function (result, capabilities, specs) {
    // },
    /**
     * Gets executed right after terminating the webdriver session.
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that ran
     */
    // afterSession: function (config, capabilities, specs) {
    // },
    /**
     * Gets executed after all workers got shut down and the process is about to exit.
     * @param {Object} exitCode 0 - success, 1 - fail
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {<Object>} results object containing test results
     */
    onComplete: function (exitCode, config, capabilities, results) {
        (async () => {
            await reportAggregator.createReport();
        })();
    }

    /**
     * Gets executed when a refresh happens.
     * @param {String} oldSessionId session ID of the old session
     * @param {String} newSessionId session ID of the new session
     */
    //onReload: function(oldSessionId, newSessionId) {
    //}

}

export {BaseConfig};



