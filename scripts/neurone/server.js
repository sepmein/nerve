/**
 * Created by Spencer on 14-3-11.
 */
var net = require('net');

var server = {};
//client
server.start = function (listener, port, next) {
    var server = net.createServer(function (connection) {
        console.log('client connected');
        listener(connection);
        next(connection);
    });
    server.listen(port);
};
server.listener = function (s) {
    s.on('connect', function (a, b) {
        console.log(a, b);
    });
    s.on('data', function (d) {
        //console.log(d.toString());
    });
};
module.exports = server;