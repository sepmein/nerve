/**
 * Created by Spencer on 14-3-15.
 */


var ee = require('events').EventEmitter;

var message = new ee();

message.setMaxListeners(1000);

module.exports = message;