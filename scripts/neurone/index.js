/**
 * Neurone: Tcp Net Sockets
 * Created by Spencer on 14-3-11.
 */
var message = require('../message');
var Ntm = require('./ntm'),
    _find = require('underscore').find;

//core controller
var N = function (transferList) {
    this.transferList = transferList;
    this.pendingList = [];
    this.availableNtms = [];
    this.ntms = [];
};
N.prototype.init = function (concurrent) {
    //spawn several ntms based on concurrent
    for (var i = concurrent - 1; i >= 0; i--) {
        var ntm = this.spawn();
    }

    var _this = this;

    //if ntm done its job, push it back to the available list
    //and the Neurone should check if there is a file need to be transferred
    message.on('[ntm].available', function (id) {
        console.log(id);
        _this.availableNtms.push(id);
        console.log('_this.availableNtms： ' + _this.availableNtms.length);
        if (_this.hasPending()) {
            var fo = _this.pendingList.shift();
            _this.transmit(fo);
        } else {
            //console.log('[N].start: It seems that all jobs has been finished.');
        }
    });

    //listen for the 'add' event from the transfer list
    message.on('[transferList].add', function (fo) {
        //console.log('[Neurone].listener.called');
        if (_this.isAvailable()) {
            _this.transmit(fo);
        } else {
            _this.pushPending(fo);
        }
    });
};


//create a new ntm
//push it to availableNtms
N.prototype.spawn = function () {
    var ntm = new Ntm();
    this.ntms.push(ntm);
    //once created it's available
    this.availableNtms.push(ntm.id);
    return ntm;
};

N.prototype.transmit = function (fo) {
    var id = this.availableNtms.shift();
    var ntm = _find(this.ntms, function (n) {
        return n.id === id;
    });
    ntm.transmit(fo);
};

N.prototype.isAvailable = function () {
    return Boolean(this.availableNtms.length);
};

N.prototype.pushPending = function (fo) {
    this.pendingList.push(fo);
};

N.prototype.hasPending = function () {
    return Boolean(this.pendingList.length);
};
//N.prototype.kill = function (id) {
//    for (var i = ntms.length - 1; i >= 0; i--) {
//        if (ntms[i].id === id) {
//            delete ntms[i];
//            ntms.slice(i, 1);
//        }
//    }
//};

exports.Neurone = N;
exports.client = require('./client');
exports.server = require('./server');