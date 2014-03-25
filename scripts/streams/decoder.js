/**
 * Created by Spencer on 14-3-17.
 */

var Readable = require('stream').Readable,
    inherits = require('util').inherits;

inherits(Decoder, Readable);

function Decoder(buf) {
    Readable.call(this);
}

Decoder.prototype._read = function () {

};

module.exports = Decoder;