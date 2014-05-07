/**
 * Created by Spencer on 14-3-11.
 */

//var net = require('net');
var client = {};
//client

client.sendStartSignal = function (socket, header, next) {
    var startString = '##Ntm Start##\n',
        metaEnd = '##Meta End##\n';
    startString += JSON.stringify(header);
    startString += metaEnd;
    console.log('send start signal: ' + startString);
    var startBuffer = new Buffer(startString);
    socket.write(startBuffer, function () {
        next();
    });
};

//client.sendEndSignal = function (socket, next) {
//    console.log('send end signal');
//    var endBuffer = new Buffer('##Ntm End##\n');
//    socket.write(endBuffer, function () {
//        next();
//    });
//};

module.exports = client;