// Merge namespace with global NodeJS
export { } //This file needs to be a module
declare global {
    export namespace NodeJS {
        interface Global {
            reportAggregator: any;
        }
        interface Process {
            emit(event: "test:log", message: string): boolean;
            emit(event: "test:screenshot", filename: string): boolean;
        }
    }
}


