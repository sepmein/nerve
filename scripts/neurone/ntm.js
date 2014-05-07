/**
 * Created by Spencer on 14-3-15.
 */

var message = require('../message'),
    client = require('./client'),
    file = require('../fs/file.js'),
    configure = require('../configure/configure.js'),
    net = require('net');

var Ntm = function () {
    this.socket = net.connect({port: configure.net.port});
    this.socket.setNoDelay(false);
    this.id = Math.random().toString(36).slice(12);
};

Ntm.prototype.transmit = function (fileObject) {
    var socket = this.socket,
        _this = this;
    client.sendStartSignal(socket, fileObject, startTransmit);

    function startTransmit() {
        var readStream = file.readFile(fileObject);
        readStream.pipe(socket, {end: false});
        readStream.on('close', onTransmitEnd);
    }

    function onTransmitEnd() {
//        console.log('transmit end');
        message.emit('[ntm].available', _this.id);
    }

//    //createReadStream
//    //create a web socket
//    var _this = this;
//    //需要重构，定义不同单位的作用域
//    file.readFile(fo, function (readStream) {
//        //file.encodeHeader(readStream);
//        //readStream.pipe(require('fs').createWriteStream('spencer'));
//        console.log(readStream);
//        client.connect(_this.socket, function (socket) {
//            file.start(socket, fo, function () {
//                readStream.pipe(socket,
//                    //don't auto end
//                    {end: false}
//                );
////                readStream.on('end', function () {
////                    client.endSignal(socket, function(){
////                        //force close the readStream
////                        //readStream.push(null);
////                    });
////                    message.emit('[ntm].transmit.done');
////                });
//            });
//        });
//    }


};

module.exports = Ntm;