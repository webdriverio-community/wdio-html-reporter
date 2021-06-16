#@rpii/wdio-html-reporter

A reporter for webdriver.io which generates a HTML report.  
Compatible with webdriverio version 7.7



####Newest Features:  

    Totally rewritten in typescript.
    
    No more jquery, uses only vanilla js

    No more moment.js dependency

    use 'html' for reporter definition
    
    Removed need for global scope reportAggregator in client code

    Add collapseTests and collapseSuites options


## Information

This project is a rewrite of [@rpii/wdio-html-reporter](https://www.npmjs.com/package/wdio-html-reporter)
It is written in typescript with many enhancements.

## Configuration

The following code shows the default wdio test runner configuration. Just add an HtmlReporter object as another reporter to the reporters array:

###A functioning wdio.config.ts is provided in the [/samples/wdio.config.ts](/samples/wdio.config.ts)

below are snippets from that file

```typescript
// wdio.config.ts
import {ReportAggregator, HtmlReporter} from '@wdio/html-reporter';
let reportAggregator: ReportAggregator;

const BaseConfig: WebdriverIO.Config = {
    
  reporters: ['spec',
        ["html", {
            outputDir: './reports/html-reports/',
            filename: 'report.html',
            reportTitle: 'Test Report Title',
            
            //to show the report in a browser when done
            showInBrowser: true,
            collapseTests: false,
            //to turn on screenshots after every test
            useOnAfterCommandForScreenshot: false,

            // to use the template override option, can point to your own file in the test project:
            // templateFilename: path.resolve(__dirname, '../template/wdio-html-reporter-alt-template.hbs'),
            
            // to add custom template functions for your custom template:
            // templateFuncs: {
            //     addOne: (v) => {
            //         return v+1;
            //     },
            // },

            //to initialize the logger
            LOG: log4j.getLogger("default")
        }
        ]
    ]
    
 
};
```
## Configuration Options:
  
### To generate a master report for all suites

webdriver.io will call the reporter for each test suite.  It does not aggregate the reports.  To do this, add the following event handlers to your wdio.config.js

```javascript
    onPrepare: function (config, capabilities) {

        reportAggregator = new ReportAggregator({
            outputDir: './reports/html-reports/',
            filename: 'master-report.html',
            reportTitle: 'Master Report',
            browserName : capabilities.browserName,
            collapseTests: true
          });
        reportAggregator.clean() ;
    },
    
    onComplete: function(exitCode, config, capabilities, results) {
        (async () => {
            await reportAggregator.createReport();
        })();
    },
    
``` 
### To use a logger for debugging

A new feature for developers is to add a log4js logger to see detailed debug output.  See the test/reporter.spec.js for configuration options.
If you dont want to use the logging, include in your project @log4js-node/log4js-api and you can quiet all debugging.
via:

    const log4js = require('@log4js-node/log4js-api');
    const logger = log4js.getLogger(this.options.debug ? 'debug' : 'default');
 

  
### To use a custom handlebars template for reports

Uncomment the templateFilename above, and in the ReportAggregator.  You must provide an absolute path to the file you can modify the alt-template above if you wish
The template must support all the constructs in the default template.  You may add more or just change the formatting and css.

### To generate a pdf file from this report

Requires an additional plugin to keep the support lightweight for those that dont want it.
see [@rpii/wdio-html-reporter-pdf](https://www.npmjs.com/package/@rpii/wdio-html-reporter-pdf)


## Sample Output:

![Report Screenshot](TestReport.png)

##browserName

This must be set manually.  Its not available at config time since the browser object doesnt exist until you start a session.

Add to browser config object:
```
let baseConfig = require('./base.config') ;
exports.config = Object.assign({}, baseConfig.config, {
    path: '/',
    capabilities: [
        {
            // Set maxInstances to 1 if screen recordings are enabled:
            // maxInstances: 1,
            browserName: 'chrome',
            'goog:chromeOptions': {
                args: [process.env.CHROME_ARGS]
            }
        }
    ],
    port: 9515, // default for ChromeDriver
    services: ['chromedriver'],
    chromeDriverLogs: './logs'
});
```

Add to onPrepare:
```
    onPrepare: function (config, capabilities) {

        reportAggregator = new ReportAggregator({
            outputDir: './reports/html-reports/',
            filename: 'master-report.html',
            reportTitle: 'Master Report',
            LOG: logger,
            showInBrowser: true,
            collapseTests: true,
            browserName : capabilities.browserName,
        });
        reportAggregator.clean() ;

        reportAggregator = reportAggregator;
    },
```