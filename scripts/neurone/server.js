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

    var startSignal = server.onStartSignal(chunk),
        slicedBuffer, lastIndex, bufferConcated;
//        , fileLength, fileLengthLeft
    if (!startSignal) {
        if (socket._ws) {
            socket._ws.write(chunk);
        } else if (socket.leftChunk) {
            bufferConcated = Buffer.concat([socket.leftChunk, chunk]);
            createFile(socket, bufferConcated);
        } else {
            onError(new Error('[ntm server] {onData} if no start signal, it should have a writable stream or left chunk'));
        }
    } else {
        if (startSignal[0] !== 0) {
            /*"first position of the start signal string is not 0"
             * 前面chunk有遗留数据*/
            if (socket.leftChunk) {
                slicedBuffer = chunk.slice(0, startSignal[0]);
                bufferConcated = Buffer.concat([socket.leftChunk, slicedBuffer]);
                createFile(bufferConcated, true);

                lastIndex = startSignal[0];
            } else {
                onError(new Error('[ntm server] {onData} 如果包头未从0位开始，那应该有前面的chunk留下'));
            }
        } else {
            lastIndex = 0;
        }

        for (var i = 0; i < startSignal.length; i++) {
            var metaEndSignal = server.onMetaEndSignal(chunk, lastIndex);
            if (metaEndSignal) {
//              meta信息在一个完整的包里
//                解码meta
                var meta = chunk.slice(lastIndex + 14, metaEndSignal);
                try {
                    var fileAttributes = JSON.parse(meta);
                } catch (e) {
                    onError(e);
                }
                if (fileAttributes.size) {
                    if (fileAttributes.size + metaEndSignal + 13 > chunk.size) {
//                        如果文件大过一个包的长度
                        createFile(socket, chunk.slice(startSignal[i]));
                    } else {
//                        如果文件小于一个包的长度
                        var wholeFileChunk = chunk.slice(startSignal[i], startSignal[i + 1]);
                        console.log('metaEndSignal + 13 + fileAttributes.size === startSignal[i + 1] :: ' + metaEndSignal + 13 + fileAttributes.size === startSignal[i + 1]);
                        createFile(socket, wholeFileChunk, true);
                    }
                } else {
                    onError(new Error('[ntm server] {onData} 文件没有size信息'));
                }
            } else {
//              meta信息不在一个完整的包里，将该剩余信息切下，留存备用
                socket.leftChunk = chunk.slice(startSignal[i]);
            }
        }
    }
};

function createFile(socket, chunk, wholeChunkFlag) {
    socket.pause();
    socket._id = Math.random().toString(36).slice(8);
    var endPosition = server.onMetaEndSignal(chunk, 0),
        chunkLeft = chunk.slice(endPosition + 13);
    try {
        //slice signal
        var optionString = chunk.slice(14, endPosition),
            fileAttributes = JSON.parse(optionString);
    } catch (e) {
        onError(e);
    }

    console.log('fileAttributes:-----------');
    console.log(fileAttributes);

    file.mkdirp(path.join(receiveFolder, fileAttributes._relativePath),
        onError,
        function () {
            //                console.log(path.join(receiveFolder, fileAttributes._relativePath, fileAttributes.name));
            socket._ws = file.createWriteStream(path.join(receiveFolder, fileAttributes._relativePath, fileAttributes.name));
            if (socket._ws !== null) {
                console.log('on start log socket');
                console.log(socket._ws);
                console.log(socket);
                if (wholeChunkFlag) {
                    socket._ws.end(chunkLeft, function () {
                        socket.resume();
                    });
                } else {
                    socket._ws.write(chunkLeft);
                    socket.resume();
                }
            } else {
                onError(new Error('[ntm server] {createFile} socket._ws should not be null'))
            }
        });
}

server.onStartSignal = function (b) {
    //b.toString === '##Ntm Start##\n', safer version
    var result = [];
    for (var i = 0; i < b.length; i++) {
        if (b[i] === 35 && b[i + 1] === 35) {
            if (b[i + 2] === 78 && b[i + 3] === 116 && b[i + 4] === 109 && b[i + 5] === 32 && b[i + 6] === 83 && b[i + 7] === 116 && b[i + 8] === 97 && b[i + 9] === 114 && b[i + 0] === 116 && b[i + 1] === 35 && b[i + 2] === 35 && b[i + 3 ] === 10) {
                console.log('[ntm server] {onStartSignal} start signal found');
                result.push(i);
            }
        }
    }
    return result ? result : false;
};

server.onMetaEndSignal = function (b, startFrom) {
    //b.toString === '##Meta End##\n';', safer version
    var result;
    for (var i = startFrom; i < b.length; i++) {
        if (b[i] === 35 && b[i + 1] === 35) {
            if (b[i + 2] === 77 && b[i + 3] === 101 && b[i + 4] === 116 && b[i + 5] === 97 && b[i + 6] === 32 && b[i + 7] === 69 && b[i + 8] === 110 && b[i + 9] === 100 && b[i + 10] === 35 && b[i + 11] === 35 && b[i + 12] === 10) {
                console.log('[ntm server] {onEndSignal} meta end signal found');
                result = i;
            }
        }
    }
    return result ? result : false;
};

module.exports = server;