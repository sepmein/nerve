/**
 * Created by Spencer on 14-3-7.
 */
/*
 * requirements*/
//fs
var fileReader = require('./scripts/fs/fs.js');
//simple errHandler
var errHandler = require('./scripts/errHandler/errHandler.js');
//configuration
var configure = require('./scripts/configure/configure.js');
//net
var neurone = require('./scripts/neurone');
//stream
var stream = require('./scripts/streams/streams.js');

/**
 * debug
 **/
// open Chrome dev tools
require('nw.gui').Window.get().showDevTools();

/**
 * real code
 **/
// prevent default behavior from changing page on dropped file
window.ondragover = function (e) {
    e.preventDefault();
    return false
};
window.ondrop = function (e) {
    e.preventDefault();
    return false
};

var holder = document.getElementById('holder');
holder.ondragover = function () {
    this.className = 'hover';
    return false;
};
holder.ondragend = function () {
    this.className = '';
    return false;
};
holder.ondrop = function (event) {
    event.preventDefault();
    //console.log(event.dataTransfer.files);
    for (var i = 0; i < event.dataTransfer.files.length; ++i) {
        var fo = event.dataTransfer.files[i];
        //console.log(fo);
        fileReader.recursive(fo, errHandler, function (readStream) {
            neurone.client.connect({
                port: configure.net.port
            }, function (socket) {
                readStream.pipe(socket);
            });
        });
    }
    return false;
};

/*
 * pipers
 * */

neurone.server.start(neurone.server.listener, configure.net.port, function (connection) {
    var piperGetPreference = new stream.SimpleProtocol()
    var decoded = connection.pipe(piperGetPreference);
    decoded.on('header', function (h) {
        console.log(h);
    });
    //var    rs = fs.createWriteStream(filePath);
    //decoded.pipe(rs);

});
