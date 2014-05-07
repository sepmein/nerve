/**
 * Created by Spencer on 14-3-30.
 */

var server = require('../../scripts/neurone/server');

describe('Neurone Server', function () {
    var startSignal = new Buffer('##Ntm Start##\nblabla'),
        falseStartSignal = new Buffer('##Ntm asdfStart##\nblabla'),
        endSignal = new Buffer('##Ntm End##\n');

    describe('on start signal', function () {
        it('startSignal test should be alright', function () {
            server.onStartSignal(startSignal).should.be.true;
            server.onStartSignal(falseStartSignal).should.be.false;
        });
    });
    describe('on end signal', function () {
        it('endSignal test should be alright', function () {
            server.onEndSignal(endSignal).should.be.true;
            server.onEndSignal(startSignal).should.be.false;
        });
    });
});