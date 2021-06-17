import {BaseConfig} from "./wdio.config";
import * as process from "process";
/*
*   Notes:
*      driver is installed by chromedriver in lib/chromedriver of module folder.
*
* */


global.screenSize = {
    height: 1000,
    width: 1400
};

const ChromeOptions: WebdriverIO.Config = {
    path: '/',
    port: 9515, // default for ChromeDriver
    services: ['chromedriver'],
    //@ts-ignore
    chromeDriverLogs: './logs'
};


const ChromeConfig = {
    capabilities: [
        {
            // Set maxInstances to 1 if screen recordings are enabled:
            maxInstances: 1,
            browserName  : 'chrome',
            'goog:chromeOptions': {
                args: (process.env.CHROME_ARGS) ? [process.env.CHROME_ARGS] : []
            }
        }
    ]
};
process.env.TEST_BROWSER="Chrome";
const config = Object.assign({}, BaseConfig,ChromeOptions,ChromeConfig);
export  {config, ChromeOptions, ChromeConfig} ;

