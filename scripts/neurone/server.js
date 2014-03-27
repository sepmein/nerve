/**
 * Created by Spencer on 14-3-11.
 */
var net = require('net'),
    file = require('../fs/file.js'),
    path = require('path'),
    receiveFolder = require('../configure/configure.js').receiveFolder,
    onError = require('../errHandler/errHandler.js');

var server = {};

server.start = function (listener, port) {
    var server = net.createServer(
        function (connection) {
            connection._ws = null;
            listener(connection);
        });
    server.listen(port);
};

server.listener = function (s) {
    s.on('connect', function (a, b) {
//        console.log(a, b);
    });
    s.on('data', function (chunk) {
            server.onData(s, chunk);
        }
    );
    s.on('error', function (e) {
        console.log(e);
    });
    s.on('end', function () {
//        console.log('end');
    });
    s.on('pipe', function () {
//        console.log('piping start.');
    });
};

var chunkCount = 0;
server.onData = function (socket, chunk) {
    if (server.onStartSignal(chunk)) {
        socket.pause();
        //console.log(socket);
        console.log('[server] on start');
        try {
            //slice signal
            var optionString = chunk.slice(14),
                fileAttributes = JSON.parse(optionString);
        } catch (e) {
            console.log(e);
        }

        console.log('fileAttributes:-----------');
        console.log(fileAttributes);
        file.mkdirp(path.join(receiveFolder, fileAttributes._relativePath),
            onError,
            function () {
                console.log(path.join(receiveFolder, fileAttributes._relativePath, fileAttributes.name));
                socket._ws = file.createWriteStream(path.join(receiveFolder + fileAttributes._relativePath + fileAttributes.name));
                console.log('create:');
                console.log(socket._ws);
//                ws.on('drain',function(){
//                    console.log('ws drained');
//                });
                if(socket._ws !== null){
                    socket.resume();
                }
            });
    } else if (server.onEndSignal(chunk)) {
        socket.pause();
        console.log('on end: -----');
        console.log(socket._ws);
        socket._ws.end(function () {
            socket._ws = null;
            console.log('end:');
            console.log(socket._ws);
            socket.resume();
        });
        console.log('[server] on end');
    } else {
//        console.log(++chunkCount);
//        console.log('buffer[0]:' + chunk[0]);
        socket._ws.write(chunk);
//        console.log(1);

    }
};

server.onStartSignal = function (b) {
    //b.toString === '##Ntm Start##\n', safer version
    return (b[0] === 35 && b[1] === 35 && b[2] === 78 && b[3] === 116 && b[4] === 109 && b[5] === 32
        && b[6] === 83 && b[7] === 116 && b[8] === 97 && b[9] === 114 && b[10] === 116
        && b[11] === 35 && b[12] === 35 && b[13] === 10);

};

server.onEndSignal = function (b) {
    //b.toString === '##Ntm End##\n', safer version
    return (b[0] === 35 && b[1] === 35 && b[2] === 78 && b[3] === 116 && b[4] === 109 && b[5] === 32
        && b[6] === 69 && b[7] === 110 && b[8] === 100 && b[9] === 35 && b[10] === 35
        && b[11] === 10
        );
};

module.exports = server;