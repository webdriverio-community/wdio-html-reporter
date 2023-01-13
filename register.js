/**
 * Overrides the tsconfig used for the app.
 * In the test environment we need some tweaks.
 */

import tsNode from 'ts-node' ;
import mainTSConfig from './tsconfig.json' assert {type: "json"};
import testTSConfig from './test/tsconfig.json' assert {type: "json"};


tsNode.register({
    files: true,
    transpileOnly: true,
    project: './test/tsconfig.json'
});