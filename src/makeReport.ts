const path = require("path") ;
const fs = require("fs-extra") ;
import {ReportAggregator} from './index' ;
const LOG = require('log4js');
LOG.configure({
    appenders: {
        fileLog: {
            type: 'file',
            filename: "logs/makeReport.log",
            maxLogSize: 5000000,
            level: 'debug'
        },
        out: {
            type: 'stdout',
            layout: {
                type: "colored"
            },
        },
    },
    categories: {
        file: {appenders: ['fileLog'], level: 'info'},
        default: {appenders: ['out','fileLog'], level: 'info'},
        debug: {appenders: ['out','fileLog'], level: 'debug'}
    }
});

let logger = LOG.getLogger("debug");

(async () => {
    let args = process.argv.slice(2) ;
    let reportName = args[0] ? args[0] : "master-report.html";
    let reportFolder = args[1] ? args[1] : 'reports/html-reports/';
    try {
        // need full paths
        let htmlReportFile = path.resolve(__dirname, reportFolder + reportName );
        let options = [];
        let reportAggregator = new ReportAggregator(
          {
            outputDir: './reports/html-reports/',
            filename: reportName,
            reportTitle: 'Micro-Magic Web Test Report',
            browserName: process.env.TEST_BROWSER ? process.env.TEST_BROWSER : 'unspecified',
            showInBrowser: true,
            LOG: logger
          });
        await reportAggregator.createReport();
      } catch (ex)  {
          console.error(ex);
      }
})();
