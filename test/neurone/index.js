/**
 * Created by Spencer on 14-3-30.
 */

describe('Neurone', function () {
    var Neurone = require('../../scripts/neurone').Neurone,
        transferList = {};
    describe('Neurone Core Controller', function () {
        it('should create a Neurone', function () {
            var n = new Neurone(transferList);
            n.should.be.instanceOf(Neurone);
        });
    })
});