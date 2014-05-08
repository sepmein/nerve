/**
 * Created by Spencer on 14-3-30.
 */

var server = require('../../scripts/neurone/server');

describe('Neurone Server', function () {
    var startSignal = new Buffer('##Ntm Start##\nblabla'),
        falseStartSignal = new Buffer('##Ntm asdfStart##\nblabla');

    describe('on start signal', function () {
        it('startSignal test should be alright', function () {
            server.onStartSignal(startSignal).should.be.true;
            server.onStartSignal(falseStartSignal).should.be.false;
        });
    });
});