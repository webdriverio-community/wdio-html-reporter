// import events from 'events
const events = require('events')
const Handlebars = require('handlebars')
const fs = require('fs-extra')
const _ = require('lodash');
const path = require('path')
const moment = require('moment')
const momentDurationFormatSetup = require("moment-duration-format");

/**
 * Initialize a new `html` test reporter.
 *
 * @param {Runner} runner
 * @api public
 */
class HtmlReporter extends events.EventEmitter {
    constructor (baseReporter, config, options = {}) {
        super()

        this.baseReporter = baseReporter

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

        this.on('suite:start', function (suite) {
        })

        this.on('test:pending', function (test) {
            this.results[test.cid].pending++
        })

        this.on('test:pass', function (test) {
            this.results[test.cid].passing++
        })

        // this.on('runner:log', function (runner) {
        //     console.log("===> LOG!!")
        // })


        this.on('runner:screenshot', function (runner) {
            const cid = runner.cid
            const stats = this.baseReporter.stats
            const results = stats.runners[cid]
            const specHash = stats.getSpecHash(runner)
            const spec = results.specs[specHash]
            const lastKey = Object.keys(spec.suites)[Object.keys(spec.suites).length-1]
            const currentTestKey = Object.keys(spec.suites[lastKey].tests)[Object.keys(spec.suites[lastKey].tests).length-1]
            spec.suites[lastKey].tests[currentTestKey].screenshots.push(runner.filename)
        })

        this.on('test:fail', function (test) {
            this.results[test.cid].failing++
        })

        this.on('suite:end', function (suite) {
        })

        this.on('runner:end', function (runner) {
        })

        this.on('end', function () {
            this.htmlOutput();
        })

        this.on('runner:logit', function (data) {
          // console.log(`==> CUSTOM LOG: ${JSON.stringify(data)}`)

          const stats = this.baseReporter.stats
          // console.log(stats.runners[data.cid])

          const results = stats.runners[data.cid]
          const specHash = Object.keys(results.specs)[Object.keys(results.specs).length-1]


          const spec = results.specs[specHash]

          // console.log(`--> spec: ${spec}`)
          // console.log(`--> specHash: ${specHash}`)

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
        if (!fs.existsSync(screenshotFile)) {
          const fullpath = `${screenshotPath}/${screenshotFile}`
          return `data:image/png;base64,${fs.readFileSync(fullpath, 'base64')}`
        } else {
          return `data:image/png;base64,${fs.readFileSync(screenshotFile, 'base64')}`
        }
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

      fs.outputFileSync('./spec-report.html', result);

      // let specKeys = Object.keys(data.stats.runners['0-0'].specs)
      // console.log(data.stats)
      // console.log(data.stats.runners['0-0'].config)
      // console.log(data.stats.runners['0-0'].specs[specKeys[0]].suites)
      // console.log(data.stats.runners['0-0'].specs[specKeys[0]].suites["Empty Basket7"].tests)
      // console.log(data.stats.runners['0-0'].specs[specKeys[0]].suites["Postcode checker10"].tests)

    }
}

module.exports = HtmlReporter
