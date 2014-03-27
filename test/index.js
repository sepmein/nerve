/**
 * Created by Spencer on 14-3-19.
 */
//var fs = require('fs');
//
//var readStream = fs.createReadStream('D:\\Program Files\\Battle.net\\Hearthstone\\base-Win.mpq');
//var writeStream = fs.createWriteStream('F:\\sepmein\\receive\\temp');
//writeStream.on('pipe', function () {
//    console.log('pipe started');
//});
//
////readStream.pipe(writeStream);
//
//var net = require('net');
//var server = net.createServer(
//    function (connection) {
//        connection.on('data', function (chunck) {
//            console.dir(chunck);
//        });
//    });
//
//server.listen(8088);
//
//var client = net.connect({port: 8088},
//    function () {
//        readStream.pipe(client);
//    });

var should = require('should');

var user = {
    name: 'spencer'
}
describe('First test', function () {
    it('user\'s name should be spencer', function () {
        user.should.have.property('name', 'spencer');
    });
});