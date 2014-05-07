/**
 * Created by Spencer on 14-3-15.
 */

var message = require('../message');
//var transferList =[];

var TransferList = function (tl) {
    this.list = tl;
};
TransferList.prototype.add = function (fileObject) {
    //console.log('[transferList].add called');
    message.emit('[transferList].add', fileObject);
    this.list.push(fileObject);
};
//TransferList.prototype.del = function (file) {
//
//};

//var transferList = new TransferList();

//transferList.on();

module.exports = TransferList;