/**
 * Created by Spencer on 14-3-11.
 * Given the input as a Javascript fileList Object
 * Output node fileStream
 */
// node fs
var fs = require('fs'),
    mkdirp = require('mkdirp'),
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
    return fs.createReadStream(path);
};

//file.encodeHeader = function (rs) {
//    var options = rs._attributes,
//        p = JSON.stringify(options);
//    p += '\n\n';
//    rs.unshift(new Buffer(p));
//};

file.judger = function (fo, fileHandler, dirHandler, errHandler) {
    var path = fo.path;
    //console.log(path);
    fs.lstat(path, function (err, stats) {
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

file.addPath = function () {
};

file.addRootPath = function (file) {
    file._rootPath = file.path.substring(0, file.path.lastIndexOf('\\') + 1);
    return file;
};

file.addRelativePath = function (file) {
    var relativePathWithFileName = file.path.slice((file._rootPath).length);
//    console.log(relativePathWithFileName);
    if (relativePathWithFileName.lastIndexOf('\\') === -1) {
        file._relativePath = '';
    } else {
        file._relativePath = relativePathWithFileName.slice(0, relativePathWithFileName.lastIndexOf('\\') + 1);
    }
//    console.log('relative path')
//    console.log(file);
    return file;
};

//api port to html5 fs
file.recursive = function recursive(fo, onError, next) {
    file.judger(fo, function (fo) {
            file.addRelativePath(fo);
            next(fo);
        },
        function (fo) {
            file.readDir(fo, function (fom) {
                recursive(fom, onError, next);
            }, function (err) {
                onError(err);
            });
        }, onError);
};

//create dir
file.mkdirp = function (path, onError, next) {
    mkdirp(path, function (err) {
        if (!err) {
            next();
        } else {
            onError(err);
        }
    })
};

file.createWriteStream = function (f) {
    return fs.createWriteStream(f);
};

module.exports = file;
