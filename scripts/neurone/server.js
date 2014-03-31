/**
 * Created by Spencer on 14-3-11.
 */
var net = require('net'),
    file = require('../fs/file.js'),
    path = require('path'),
    receiveFolder = require('../configure/configure.js').receiveFolder,
    onError = require('../errHandler/errHandler.js');

var server = {};

server.start = function (addListener, port) {
    var server = net.createServer(
        function (socket) {
//            connection._ws = null;
            addListener(socket);
        });
    server.listen(port);
    return server;
};

server.addListener = function (socket) {
    socket.on('data', function (chunk) {
            server.onData(socket, chunk);
        }
    );
    socket.on('error', function (e) {
        console.log(e);
    });
    socket.on('end', function () {
//        console.log('end');
    });
    socket.on('pipe', function () {
//        console.log('piping start.');
    });
};
/*
* ### 记一笔
* 终于找到了错误的原因，从前一直认为，socket.write命令就能够向server发送一条信息。
* 但是事实上，client端会将socket中的buffer缓存起来，等到达到一定的数量级后再向服务器端发送。
* 导致，在服务器端connection.on('data')事件发生次数比预期低很多，而一个buffer也可能
* 包含多个##Ntm Start##\n以及##Ntm End##\n
* 下一步
* TODO:
  * 1. 将一个chunk看作一个整体，在chunk中，任何事件都有可能发生；
  * 2. 在chunk中检测到startSignal之后，如何将头部信息与文件信息分离？
  * 3. 根据头信息，创建一个fs.writeStream
  * 4. 将文件信息write进ws
  * 5. 检测到endSignal后，关闭ws
* */
var chunkCount = 0;
server.onData = function (socket, chunk) {
//    FIXME
    console.log('ondata');
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

//        console.log('fileAttributes:-----------');
//        console.log(fileAttributes);
        file.mkdirp(path.join(receiveFolder, fileAttributes._relativePath),
            onError,
            function () {
//                console.log(path.join(receiveFolder, fileAttributes._relativePath, fileAttributes.name));
                socket._ws = file.createWriteStream(path.join(receiveFolder, fileAttributes._relativePath, fileAttributes.name));
//                console.log('create:');
//                console.log(socket._ws);
//                ws.on('drain',function(){
//                    console.log('ws drained');
//                });
                if (socket._ws !== null) {
                    console.log('on start log socket');
                    console.log(socket._ws);
                    console.log(socket);
                    socket.resume();
                }
            });
    } else if (server.onEndSignal(chunk)) {
//        socket.pause();
//        console.log('on end: -----');
//        console.log(socket._ws);
//        socket._ws.end(function () {
////            console.log(socket._ws);
//            delete socket._ws;
//            console.log('end:');
////            console.log(socket._ws);
//            socket.resume();
//        });
//        console.log('[server] on end');
    } else {
//        console.log(++chunkCount);
//        console.log('buffer[0]:' + chunk[0]);
        socket._ws.write(chunk);
        console.log(1);

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
    return (b.length === 12 &&
        b[0] === 35 && b[1] === 35 && b[2] === 78 && b[3] === 116 && b[4] === 109 && b[5] === 32
        && b[6] === 69 && b[7] === 110 && b[8] === 100 && b[9] === 35 && b[10] === 35
        && b[11] === 10);
};

module.exports = server;