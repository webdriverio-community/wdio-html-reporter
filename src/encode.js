"use strict";
exports.__esModule = true;
var fs_1 = require("fs");
function encode(url) {
    var fileBuf = (0, fs_1.readFileSync)(url);
    return "data:image/png;base64," + fileBuf.toString('base64');
}
exports["default"] = encode;
