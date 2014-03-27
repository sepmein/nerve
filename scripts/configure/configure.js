/**
 * Created by Spencer on 14-3-11.
 */


//var fs = require('fs'),
//    errHandler = require('../errHandler/errHandler.js');
//
//var userConfigFile, userConfig = {};
//try{
//     userConfigFile = fs.readFileSync(process.cwd() + '\\configure.json');
//} catch (e) {
//    errHandler(e);
//}
//
//try {
//     userConfig = JSON.parse(userConfigFile);
//} catch (e) {
//    errHandler(new Error('[configure] - configure.json is not valid'));
//}


//fs.readFile(process.cwd() + '\\configure.json', function (err, data) {
//    try {
//        userConfig = JSON.parse(userConfigFile);
//    } catch (e) {
//        errHandler(new Error('[configure] - configure.json is not valid'));
//    }
//});

var configure = {
    net: {
        port: 8124
    },
    concurrent: 200,
    receiveFolder: 'F:\\sepmein\\receive\\'
};

module.exports = configure;