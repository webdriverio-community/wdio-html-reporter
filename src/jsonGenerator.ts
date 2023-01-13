import {HtmlReporterOptions, ReportData} from "./types.js";
import log4js from "@log4js-node/log4js-api";
import json from 'big-json';
import {String} from 'typescript-string-operations';
import fs from 'fs-extra';
import path from 'node:path';

import url from 'node:url';

class JsonGenerator {

    static writeJson(jsonFile:string , stringified:string , reportOptions:HtmlReporterOptions, reportData: ReportData) {
        fs.outputFileSync(jsonFile, stringified);
        reportOptions.LOG.info("Json write completed: " + jsonFile );
    }

    static async jsonOutput(reportOptions: HtmlReporterOptions, reportData: ReportData) {
        if (! reportOptions.LOG) {
            reportOptions.LOG = log4js.getLogger(reportOptions.debug ? 'debug' : 'default');
        }

        try {

            if (fs.pathExistsSync(reportOptions.outputDir)) {
                if (reportOptions.removeOutput) {
                    for (let i = 0; i < reportData.suites.length; i++) {
                        let suite = reportData.suites[i];
                        for (let j = 0; j < suite.tests.length; j++) {
                            let test = suite.tests[j];
                            test.output = [];
                        }
                    }
                }

                if (reportOptions.produceJson ) {
                    let jsonFile = reportData.reportFile.replace('.html', '.json');
                    reportOptions.LOG.info("Json report write starting: " + jsonFile);
                    try {
                        let stringified = await json.stringify({body: reportData});
                        JsonGenerator.writeJson(jsonFile, stringified, reportOptions, reportData);
                    } catch (error) {
                        reportOptions.LOG.error("Json write failed: " + error);
                    }
                } else {
                    reportOptions.LOG.info("reportOptions.produceJson is false");
                }
            }
            reportOptions.LOG.info("Json Generation Completed");
        } catch (ex) {
            reportOptions.LOG.error("Json Generation processing ended in error: " + ex);
        }
    }
}

export default JsonGenerator;