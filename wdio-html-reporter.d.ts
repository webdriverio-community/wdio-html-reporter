// Merge namespace with global NodeJS
//import  from 'log4js';
declare global {
    export namespace NodeJS {
        interface Global {
            reportAggregator: ReportAggregator;
        }
    }
}
export interface ReportOptions {
    stdout?: boolean;
    debug?: boolean;
    outputDir: string ;
    filename: string ;
    reportTitle: string ;
    showInBrowser?: boolean;
    useOnAfterCommandForScreenshot?: boolean;
    templateFilename?: string ;
    templateFuncs?: any ;
    LOG?: any;
}

export declare class HtmlReporter {
    constructor(opts:ReportOptions);
}

export declare class ReportAggregator {
    constructor(opts:ReportOptions) ;
    clean() : void;
    createReport(opts: any): any;
}

