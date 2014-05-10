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
    });
    socket.on('error', function (e) {
        onError(e);
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
 * 重要的潜在问题：startSignal & endSignal的buffer可能都不在一个chunk里!
 *
 * 或者建立一个duplex stream，当然，算法应该是相同的。
 * */
server.onData = function (socket, chunk) {
//    console.log(chunk.toString());
    var startSignal = server.onStartSignal(chunk);
    if (!startSignal) {
        if (socket._wsPoint) {
//            socket.pause();
            socket._ws[socket._wsPoint].write(chunk);
//            socket.resume();
        } else {
            onError(new Error('[ntm server] {onData} if no start signal, it should have a writable stream or left chunk'));
        }
    } else {
//            如果之前已经有过writeStream
//        console.log(chunk.toString());
        socket.pause();
        if (socket._wsPoint) {
            socket._ws[socket._wsPoint].end(function () {
                delete socket._ws[socket._wsPoint];
            });
        } else {
            onError(new Error('[ntm server] {onData} no write stream point'));
        }
        createFile(socket, chunk, function (wsId) {
            socket._wsPoint = wsId;
            console.log(socket._wsPoint);
            socket.resume();
        });
    }
//    console.log(socket._ws);
//    console.log(socket._wsPoint);

};

function createFile(socket, chunk, callback) {
    if (!socket._ws) {
        socket._ws = {};
    }
    socket._id = Math.random().toString(36).slice(8);
    try {
        //slice signal
        var optionString = chunk.slice(14),
            fileAttributes = JSON.parse(optionString);
    } catch (e) {
        onError(e);
        console.log('parse json error');
        console.log('chunk', chunk.toString());
        console.log('socket: ', socket);
    }

//    console.log('fileAttributes:-----------');
//    console.log(fileAttributes);

    file.mkdirp(path.join(receiveFolder, fileAttributes._relativePath),
        onError,
        function () {
            //                console.log(path.join(receiveFolder, fileAttributes._relativePath, fileAttributes.name));
            var wsId = Math.random().toString(36).slice(6);
            socket._ws[wsId] = file.createWriteStream(path.join(receiveFolder, fileAttributes._relativePath, fileAttributes.name));
            socket._ws[wsId].on('open', function () {
                callback(wsId);
            });
        });
}

server.onStartSignal = function (b) {
    var result = false;
    //b.toString === '##Ntm Start##\n', safer version
    if (b[0] === 35 && b[1] === 35 && b[2] === 78 && b[3] === 116 && b[4] === 109 && b[5] === 32 && b[6] === 83 && b[7] === 116 && b[8] === 97 && b[9] === 114 && b[10] === 116 && b[11] === 35 && b[12] === 35 && b[13] === 10) {
//        console.log('[ntm server] {onStartSignal} start signal found');
        result = true;
    }
    return result;
};

module.exports = server;