# wdio-html-reporter
A reporter for webdriver.io which generates a HTML report.
Based off the excellent wdio-spec-reporter [https://www.npmjs.com/package/wdio-spec-reporter]

## Installation

The easiest way is to keep wdio-html-reporter as a devDependency in your package.json.

```
{
  "devDependencies": {
    "wdio-html-reporter": "~0.0.1"
  }
}
```

You can simple do it by:

```
npm install wdio-html-reporter --save-dev
```


## Configuration
Following code shows the default wdio test runner configuration. Just add 'html' as reporter to the array.

```
// wdio.conf.js
module.exports = {
  // ...
  reporters: ['spec', 'html'],
  // ...
};
```
