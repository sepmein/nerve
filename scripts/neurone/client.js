/**
 * Created by Spencer on 14-3-11.
 */

//var net = require('net');
var client = {};
//client

client.sendStartSignal = function (socket, header, next) {
    var startString = '##Ntm Start##\n';
    startString += JSON.stringify(header);
    var startBuffer = new Buffer(startString);
    socket.write(startBuffer, function () {
        next();
    });
};

client.sendEndSignal = function (socket, next) {
    var endBuffer = new Buffer('##Ntm End##\n');
    socket.write(endBuffer, function () {
        next();
    });
};

module.exports = client;