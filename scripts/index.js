/**
 * Created by Spencer on 14-3-7.
 */
/*
 * requirements*/
//fs
var file = require('./scripts/fs/file.js'),
    TransferList = require('./scripts/fs/transferList.js'),
//simple errHandler
    errHandler = require('./scripts/errHandler/errHandler.js'),
//configuration
    configure = require('./scripts/configure/configure.js'),
//net
    N = require('./scripts/neurone'),
    client = N.client,
    server = N.server,
    Neurone = N.Neurone,

//stream
    stream = require('./scripts/streams/streams.js');

/**
 * debug
 **/
// open Chrome dev tools
require('nw.gui').Window.get().showDevTools();
/**
 * real code
 **/
//init
var transferList = [],
    neurone = new Neurone(transferList),
    tl = new TransferList(transferList);

neurone.init(configure.concurrent);

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
    for (var i = 0; i < event.dataTransfer.files.length; ++i) {
        var fo = event.dataTransfer.files[i];
        file.addRootPath(fo);
        //console.log(fo);
        file.recursive(fo, errHandler, function (fo) {
            tl.add(fo);
        });
    }
    return false;
};

/*
 * server
 * */

server.start(server.listener, configure.net.port);

process.on('uncaughtException', function (err) {
    console.log(err);
});

var NerveApp = angular.module('Nerve', []);

NerveApp.controller('Ctrl.main', ['$scope', function ($scope) {
//    $scope.hello = 'world';
//    $scope.availableNtms = function(){
//        //$scope.$apply();
//        return neurone.availableNtms.length;
//    }
}]);
