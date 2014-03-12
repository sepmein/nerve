/**
 * Created by Spencer on 14-3-11.
 * Given the input as a Javascript fileList Object
 * Output node fileStream
 */
// node fs
var fs = require('fs');
var fileReader = {};

fileReader.readDir = function (fo, next, errHandler) {
    var path = fo.path;
    fs.readdir(path, function (err, files) {
        //console.log(files);
        if (!err) {
            for (var i = files.length - 1; i >= 0; i--) {
                var fom = {};
                fom.path = fo.path + '\\' + files[i];
                fom.name = files[i];
                //console.log(fom);
                next(fom);
            }
        } else {
            errHandler(err);
        }
    })
};

fileReader.readFile = function (fo, next) {
    var path = fo.path,
        rs = fs.createReadStream(path);
    rs._attributes = fo;
    next(rs);
};

fileReader.addPath = function (rs) {
    var options = rs._attributes,
        p = JSON.stringify(options);
    p += '\n\n';
    rs.unshift(p);
};

fileReader.judger = function (fo, fileHandler, dirHandler, errHandler) {
    var path = fo.path;
    console.log(path);
    fs.stat(path, function (err, stats) {
        if (!err) {
            if (stats.isFile()) {
                fo.size = stats.size;
                fo.atime = stats.atime;
                fo.mtime = stats.mtime;
                fo.ctime = stats.ctime;
                fileHandler(fo);
            } else if (stats.isDirectory()) {
                dirHandler(fo);
            }
        } else {
            errHandler(err);
        }
    });
};

fileReader.mkdir = function () {

};

//api port to html5 fs
fileReader.recursive = function recursive(fo, errHandler, next) {
    fileReader.judger(fo, function (fo) {
            fileReader.readFile(fo, function (readStream) {
                fileReader.addPath(readStream);
                next(readStream);
            });
        },
        function (fo) {
            fileReader.readDir(fo, function (fom) {
                recursive(fom, errHandler, next);
            }, function (err) {
                errHandler(err);
            });
        }, errHandler);
};

module.exports = fileReader;