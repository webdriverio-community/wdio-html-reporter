const concat = require('concat');
concat([, "./lib/index.d.ts", "./src/global.d.ts.stub" ] , "./lib/html-reporter.d.ts")
    .then(result => console.log(result));
