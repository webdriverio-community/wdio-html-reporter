// Merge namespace with global NodeJS
export { } //This file needs to be a module
declare global {
    export namespace NodeJS {
        interface Global {
            reportAggregator: any;
        }
    }
}


