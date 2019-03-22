# wdio-html-reporter
A reporter for webdriver.io which generates a HTML report.
A fork of [wdio-html-format-reporter](https://www.npmjs.com/package/wdio-html-format-reporter)

That project has not been updated and doesnt work with the latest webdriverio.


## Installation

The easiest way is to keep the `wdio-html-reporter` as a devDependency in your package.json:

```javascript
{
  "devDependencies": {
    "wdio-html-reporter": "~0.5.0"
  }
}
```

Or, you can simply do it with:

```
yarn add wdio-html-reporter --dev
```


## Configuration
The following code shows the default wdio test runner configuration. Just add 'html-format' as another reporter to the array:

```javascript
// wdio.conf.js
module.exports = {
  // ...
  
  reporters: ['spec',
        ['html', {
            debug: true,
            outputDir: './reports/html-results/',
            filename: 'report.html',
            reportTitle: 'Test Report Title',
            showInBrowser:true
        }
        ]
    ]
    
  // ...    
};
```

## To show log messages in the output
```javascript
    logMessage(message) {
        process.emit('test:log', message);
    }

```
to be fixed:
hide /show on report esctions doesnt work

[Report Example: report.html](https://cdn.rawgit.com/aruiz-caritsqa/wdio-html-format-reporter/master/wdio-report.html)

![Report Screenshot](wdio-report.jpg)



