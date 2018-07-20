const events = require('events')
const Handlebars = require('handlebars')
const fs = require('fs-extra')
const _ = require('lodash');
const path = require('path')
const moment = require('moment')
const momentDurationFormatSetup = require("moment-duration-format");
momentDurationFormatSetup(moment);
const escapeStringRegexp = require('escape-string-regexp')
const Png = require("pngjs").PNG
const Jpeg = require("jpeg-js")

class HtmlReporter extends events.EventEmitter {
  constructor (baseReporter, config, options = {}) {
    super()
    this.baseReporter = baseReporter

    this.config = config
    this.errorCount = 0
    this.specs = {}
    this.results = {}

    this.on('runner:start', function (runner) {
      this.specs[runner.cid] = runner.specs
      this.results[runner.cid] = {
        passing: 0,
        pending: 0,
        failing: 0
      }
    })

    this.on('suite:start', function (suite) {})

    this.on('test:pending', function (test) {
      this.results[test.cid].pending++
    })

    this.on('test:pass', function (test) {
      this.results[test.cid].passing++
    })

    this.on('runner:screenshot', function (runner) {
      // if the filename isn't defined, it cannot find the file and cannot be added to the report
      if (!runner.filename) {
        return
      }
      const cid = runner.cid
      const stats = this.baseReporter.stats
      const results = stats.runners[cid]
      const specHash = stats.getSpecHash(runner)
      const spec = results.specs[specHash]
      const lastKey = Object.keys(spec.suites)[Object.keys(spec.suites).length-1]
      const currentTestKey = Object.keys(spec.suites[lastKey].tests)[Object.keys(spec.suites[lastKey].tests).length-1]
      spec.suites[lastKey].tests[currentTestKey].screenshots.push(runner.filename)
    })

    this.on('screenshot:fullpage', function (data) {
      // if the filename isn't defined, it cannot find the file and cannot be added to the report
      if (!data.filename) {
        return
      }
      const cid = data.cid
      const stats = this.baseReporter.stats
      const results = stats.runners[cid]
      const specHash = Object.keys(results.specs)[Object.keys(results.specs).length-1]
      const spec = results.specs[specHash]
      const lastKey = Object.keys(spec.suites)[Object.keys(spec.suites).length-1]
      const currentTestKey = Object.keys(spec.suites[lastKey].tests)[Object.keys(spec.suites[lastKey].tests).length-1]
      spec.suites[lastKey].tests[currentTestKey].screenshots.push(data.filename)
    })

    this.on('test:fail', function (test) {
        this.results[test.cid].failing++
    })

    this.on('suite:end', function (suite) {})

    this.on('runner:end', function (runner) {})

    this.on('end', function () {
      this.htmlOutput();
    })

    this.on('runner:logit', function (data) {
      const stats = this.baseReporter.stats
      const results = stats.runners[data.cid]
      const specHash = Object.keys(results.specs)[Object.keys(results.specs).length-1]
      const spec = results.specs[specHash]
      const lastKey = Object.keys(spec.suites)[Object.keys(spec.suites).length-1]
      const currentTestKey = Object.keys(spec.suites[lastKey].tests)[Object.keys(spec.suites[lastKey].tests).length-1]

      if (spec.suites[lastKey].tests[currentTestKey].logit == null) {
        spec.suites[lastKey].tests[currentTestKey].logit = []
      }
      spec.suites[lastKey].tests[currentTestKey].logit.push(data.output)
    })
  }

  htmlOutput() {
    let source = fs.readFileSync(path.resolve(__dirname, '../lib/wdio-html-reporter-template.hbs'), 'utf8')

    Handlebars.registerHelper('imageAsBase64', function(screenshotFile, screenshotPath, options) {
      // occurs when there is an error file
      if (!fs.existsSync(screenshotFile)) {
        screenshotFile = `${screenshotPath}/${screenshotFile}`
      }
      let png = new Png.sync.read(fs.readFileSync(path.resolve(`${screenshotFile}`)))
      return `data:image/jpeg;base64,${Jpeg.encode(png, 50).data.toString('base64')}`
    })

    Handlebars.registerHelper('isValidSuite', function(suite, options) {
      if (suite.title.length > 0 && suite.uid.match(new RegExp(escapeStringRegexp(suite.title)))) {
        return options.fn(this)
      }
      return options.inverse(this)
    })

    Handlebars.registerHelper('testStateColour', function(state, options) {
      if (state === 'pass') {
        return 'test-pass'
      } else if (state === 'fail') {
        return 'test-fail'
      } else if (state === 'pending') {
        return 'test-pending'
      }
    })

    Handlebars.registerHelper('suiteStateColour', function(tests, options) {
      let numTests = Object.keys(tests).length

      let fail = _.values(tests).find((test) => {
        return test.state === 'fail'
      })
      if (fail != null) {
        return 'suite-fail'
      }

      let pending = _.values(tests).find((test) => {
        return test.state === 'pending'
      })
      if (pending != null) {
        return 'suite-pending'
      }

      let passes = _.values(tests).filter((test) => {
        return test.state === 'pass'
      })
      if (passes.length === numTests && numTests > 0) {
        return 'suite-pass'
      }
      return 'suite-unknown'
    })

    Handlebars.registerHelper('humanizeDuration', function(duration, options) {
      return moment.duration(duration, "milliseconds").format('hh:mm:ss.SS', {trim: false})
    })

    Handlebars.registerHelper('ifSuiteHasTests', function(testsHash, options) {
      if (Object.keys(testsHash).length > 0) {
        return options.fn(this)
      }
      return options.inverse(this)
    })

    const template = Handlebars.compile(source)
    const data = {stats: this.baseReporter.stats}
    const result = template(data)

    if (this.config.reporterOptions && this.config.reporterOptions.htmlFormat && this.config.reporterOptions.htmlFormat.outputDir) {
      if (fs.pathExistsSync(this.config.reporterOptions.htmlFormat.outputDir)) {
        let reportfile = `${this.config.reporterOptions.htmlFormat.outputDir}/wdio-report.html`
        console.log(`View WDIO HTML Report at: ${reportfile}`)
        fs.outputFileSync(reportfile, result)
        return
      }
    }
    console.log(`View WDIO HTML Report at: ./wdio-report.html`)
    fs.outputFileSync('./wdio-report.html', result)
  }
}
module.exports = HtmlReporter
