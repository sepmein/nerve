/**
 * Created by Spencer on 14-3-15.
 */

var message = require('../message'),
    client = require('./client'),
    file = require('../fs/file.js'),
    configure = require('../configure/configure.js'),
    net = require('net');

var Ntm = function () {
    this.socket = new net.Socket();
    this.socket.connect({port: configure.net.port});
    this.socket.setNoDelay(false);
    this.id = Math.random().toString(36).slice(12);
};

Ntm.prototype.transmit = function (fileObject) {
    var socket = this.socket,
        _this = this;
    client.sendStartSignal(socket, fileObject, startTransmit);

    function startTransmit() {
//        console.log('ntm id: ' + _this.id);
//        console.log(fileObject);
        var readStream = file.readFile(fileObject);
        readStream.pipe(socket, {end: false});
        readStream.on('close', onTransmitEnd);
    }

    function onTransmitEnd() {
//        console.log('transmit end');
        message.emit('[ntm].available', _this.id);
    }

};

module.exports = Ntm;