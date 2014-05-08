/**
 * Created by Spencer on 14-3-11.
 */

//var net = require('net');
var client = {};
//client

client.sendStartSignal = function (socket, header, next) {
    var startString = '##Ntm Start##\n';
    startString += JSON.stringify(header);
//    console.log('send start signal: ' + startString);
    var startBuffer = new Buffer(startString);
    socket.write(startBuffer, function () {
        next();
    });
};

module.exports = client;