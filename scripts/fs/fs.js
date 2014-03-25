/**
 * Created by Spencer on 14-3-11.
 * Given the input as a Javascript fileList Object
 * Output node fileStream
 */
// node fs
var fs = require('fs'),
    file = {};
file.readDir = function (fo, next, errHandler) {
    var path = fo.path;
    fs.readdir(path, function (err, files) {
        //console.log(files);
        if (!err) {
            for (var i = files.length - 1; i >= 0; i--) {
                var fom = {};
                fom.path = fo.path + '\\' + files[i];
                fom.name = files[i];
                fom._rootPath = fo._rootPath;
                //console.log(fom);
                next(fom);
            }
        } else {
            errHandler(err);
        }
    });
};

file.readFile = function (fo) {
    var path = fo.path;
    var rs = fs.createReadStream(path);
    return rs;
};

file.encodeHeader = function (rs) {
    var options = rs._attributes,
        p = JSON.stringify(options);
    p += '\n\n';
    rs.unshift(new Buffer(p));
};

file.judger = function (fo, fileHandler, dirHandler, errHandler) {
    var path = fo.path;
    //console.log(path);
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
//given a rootPath, create some relativePath in it
file.mkdir = function (rootPath, relativePath, callback) {
    //while (relativePath)
};

file.addPath = function () {
};

file.addRootPath = function (file) {
    file._rootPath = file.path.substring(0, file.path.lastIndexOf('\\') + 1);
    return file;
};

file.addRelativePath = function (file) {
    return file._relativePath = file.path.slice((file._rootPath).length);
};

//api port to html5 fs
file.recursive = function recursive(fo, errHandler, next) {
    file.judger(fo, function (fo) {
            next(fo);
        },
        function (fo) {
            file.readDir(fo, function (fom) {
                recursive(fom, errHandler, next);
            }, function (err) {
                errHandler(err);
            });
        }, errHandler);
};

module.exports = file;