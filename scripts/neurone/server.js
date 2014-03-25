/**
 * Created by Spencer on 14-3-11.
 */
var net = require('net');

var server = {};

server.start = function (listener, port) {
    var server = net.createServer(
        function (connection) {
            listener(connection);
        });
    server.listen(port);
};

server.listener = function (s) {
    s.on('connect', function (a, b) {
        console.log(a, b);
    });
    s.on('data', server.onData);
    s.on('error', function (e) {
        console.log(e);
    });
    s.on('end', function () {
        console.log('end');
    });
    s.on('pipe', function () {
        console.log('piping start.');
    });
};

var chunkCount = 0;
var ws = require('fs').createWriteStream('f:\\sepmein\\receive\\hi');
server.onData = function (chunk) {
    if (server.onStartSignal(chunk)) {
        console.log('[server] on start')
    } else if (server.onEndSignal(chunk)) {
        console.log('[server] on end')
    } else {
        console.log(++chunkCount);
        ws.write(chunk);
    }
};

server.onStartSignal = function (buffer) {
    if (buffer.length === 14 && buffer.toString() === '##Ntm Start##\n') {
        return true;
    } else {
        return false;
    }
};

server.onEndSignal = function (buffer) {
    if ((buffer.length === 12 && buffer.toString() === '##Ntm End##\n')) {
        return true;
    } else {
        return false;
    }
};

module.exports = server;