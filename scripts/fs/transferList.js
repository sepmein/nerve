/**
 * Created by Spencer on 14-3-15.
 */

var message = require('../message');
//var transferList =[];

var TransferList = function (tl) {
    this.list = tl;
};
TransferList.prototype.add = function (fo) {
    //console.log('[transferList].add called');
    message.emit('[transferList].add', fo);
    this.list.push(fo);
};
TransferList.prototype.del = function (file) {

};

//var transferList = new TransferList();

//transferList.on();

module.exports = TransferList;