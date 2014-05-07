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
 * 重要的潜在问题：startSignal & endSignal的buffer可能都不在一个chunk里!
 *
 * 或者建立一个duplex stream，当然，算法应该是相同的。
 * */
server.onData = function (socket, chunk) {
    //    FIXME
    // console.log('on data');
    // console.log(chunk);
    if (!server.lastChunk) {
        server.lastChunk = chunk;
    } else {
        var lastTwoChunks = Buffer.concat(server.lastChunk, chunk);
        server.lastChunk = chunk;
        var onStart = server.onStartSignal(lastTwoChunks),
            onEnd = server.onEndSignal(lastTwoChunks);
        if (!onStart && !onEnd) {
            if (socket._ws) {
                socket._ws.write(lastTwoChunks);
            } else {
                onError(new Error('[ntm server] {ondata} no start & end signal, should have a file write stream'))
            }
        } else {
            if (onStart) {
                var chunks = [];
                for (var i = onStart.length - 1; i >= 0; i--) {
                    var sliced;
                    if (i === onStart.length - 1) {
                        sliced = lastTwoChunks.slice(onStart[i], lastTwoChunks.length - 1);
                    } else {
                        sliced = lastTwoChunks.slice(onStart[i], onStart[i++]);
                    }
                    chunks.push(sliced);
                }
                for (var i = chunks.length - 1; i >= 0; i--) {
                    createFile(socket, chunks[i]);
                }
            }
        }
    }

    function createFile(socket, chunk) {
        socket.pause();
        socket._id = Math.random().toString(36).slice(8);
        //console.log(socket);
        // console.log('[server] on start');
        try {
            //slice signal
            var optionString = chunk.slice(14),
                fileAttributes = JSON.parse(optionString);
        } catch (e) {
            onError(e);
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
                } else {
                    onError(new Error('[ntm server] {createFile} socket._ws should not be null'))
                }
            });
    }

// if (server.onStartSignal(chunk)) {

// } else if (server.onEndSignal(chunk)) {
//     //        socket.pause();
//     //        console.log('on end: -----');
//     //        console.log(socket._ws);
//     //        socket._ws.end(function () {
//     ////            console.log(socket._ws);
//     //            delete socket._ws;
//     //            console.log('end:');
//     ////            console.log(socket._ws);
//     //            socket.resume();
//     //        });
//     //        console.log('[server] on end');
// } else {
//     //        console.log(++chunkCount);
//     //        console.log('buffer[0]:' + chunk[0]);
//     socket._ws.write(chunk);
//     console.log(1);

// }
};

server.onStartSignal = function (b) {
    //b.toString === '##Ntm Start##\n', safer version
    var result = [];
    for (var i = 0; i < b.length; i++) {
        if (b[i] === 35 && b[i + 1] === 35) {
            if (b[i + 2] === 78 && b[i + 3] === 116 && b[i + 4] === 109 && b[i + 5] === 32 && b[i + 6] === 83 && b[i + 7] === 116 && b[i + 8] === 97 && b[i + 9] === 114 && b[i + 0] ===116 && b[i + 1] ===35 && b[i + 2] ===35 && b[i + 3 ] ===10 ) {
                console.log('[ntm server] {onStartSignal} start signal found');
                result.push(i);
            }
        }
    }
    return result ? result : false;
};

server.onEndSignal = function (b) {
    //b.toString === '##Ntm End##\n', safer version
    var result = [];
    for (var i = 0; i < b.length; i++) {
        if (b[i] === 35 && b[i + 1] === 35) {
            if (b[i + 2] === 78 && b[i + 3] === 116 && b[i + 4] === 109 && b[i + 5] === 32 && b[i + 6] === 69 && b[i + 7] === 110 && b[i + 8] === 100 && b[i + 9] === 35 && b[i + 10] === 35 && b[i + 11] === 10) {
                console.log('[ntm server] {onEndSignal} end signal found');
                result.push(i);
            }
        }
    }
    return result ? result : false;
};

module.exports = server;