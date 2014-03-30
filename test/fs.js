require("should");


describe('Nerve File Module', function () {

    var file = require('../scripts/fs/file.js'),
        ReadableStream = require('stream').Readable;

    describe('readDir', function () {
        it('should throw an err, when path is not right', function (done) {
            file.readDir({path: 'dummy'},
                function (fom) {
                    console.log(fom);
                },
                function (err) {
                    err.should.be.an.Error;
                    done();
                });
        });
        it('should have the same root path as fo object', function (done) {
            file.readDir({
                    path: '.',
                    _rootPath: '/'
                },
                function (fo) {
                    fo.should.have.property('_rootPath', '/');
                },
                function (err) {

                });
            done();
        });
    });
    describe('readFile', function () {
        it('should return a read stream from the file object', function () {
            var readStream = file.readFile({path: 'test/fs.js'});
            readStream.should.be.an.instanceOf.ReadableStream;
        });
    });
    describe('judger', function () {
        it('should use file handler instead of dir handler if the fo.path is a file', function (done) {
            file.judger(
                {
                    path: 'test/fs.js'
                },
                function (fo) {
                    fo.should.have.property('size');
                    fo.should.have.property('atime');
                    fo.should.have.property('mtime');
                    fo.should.have.property('ctime');
                    done();
                }
            )
        });
        it('should use dir handler instead of file handler if the fo.path is a dir', function (done) {
            file.judger(
                {
                    path: 'test'
                },
                function (fo) {

                },
                function (fo) {
                    fo.should.have.property('path', 'test');
                    done();
                }
            );
        });

    });
    describe('addRelativePath', function(){
        it('[OSX version] should have a relative path if arguments is a file', function (done) {
            var fileObject = {
                _rootPath: '~/sepmein/',
                path: '~/sepmein/nerve'
            }

            var added = file.addRelativePath(fileObject);
            added._relativePath.should.be.equal('nerve');
            done();
        });
        it('[Windows version] should have a relative path if arguments is a file', function (done) {
            var fileObject = {
                _rootPath: 'f:/sepmein/',
                path: 'f:/sepmein/nerve'
            }

            var added = file.addRelativePath(fileObject);
            added._relativePath.should.be.equal('nerve');
            done();
        });
        it('should return empty string, when rootPath equals relative path', function (done) {
            var fileObject = {
                path: 'f:/sepmein/blabla',
                _rootPath: 'f:/sepmein/blabla'
            };
            var added = file.addRelativePath(fileObject);
            added._relativePath.should.be.equal('');
            done();
        });
    });
    describe('addRootPath', function () {

    });
    describe('recursive', function(){
        it('')
    })

});