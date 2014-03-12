/**
 * Created by Spencer on 14-3-11.
 */

var net = require('net');
var client  = {};
//client
client.connect = function (options, next) {
    var socket = net.connect(options);
    socket.on('close', function () {
        console.log('connection closed');
    });
    next(socket);
};

module.exports = client;