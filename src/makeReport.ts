import {ReportAggregator} from './index.js' ;
import path from 'node:path';
import url from 'node:url';

import log4js from 'log4js' ;
log4js.configure({
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

let logger = log4js.getLogger("debug");

(async () => {
    let args = process.argv.slice(2) ;
    let reportName = args[0] ? args[0] : "master-report.html";
    let reportFolder = args[1] ? args[1] : 'reports/html-reports/';
    try {
        // need full paths
        const dirname = url.fileURLToPath(new URL('../', import.meta.url));
        let htmlReportFile = path.resolve(dirname, reportFolder + reportName );
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
