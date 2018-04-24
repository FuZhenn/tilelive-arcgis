var Arcgis = require('../');
var assert = require('assert');
var fs = require('fs');

describe('reading arcgis tilesources', function() {

    it('should retrieve a tile from file-based source correctly', function(done) {
        var tilepath = __dirname+'/sample/file/_alllayers/L02/R00000971/C00000d50.png';
        new Arcgis('arcgis://./test/sample/file', function(err, source) {
            if (err) return done(err);
            source.getTile(2, 0xd50, 0x971, function(err, tile, headers) {
                if (err) return done(err);
                var mtime = fs.statSync(tilepath).mtime;
                assert.deepEqual(tile, fs.readFileSync(tilepath));
                assert.equal(headers['Last-Modified'], new Date(mtime).toUTCString());
                assert.equal(headers['Content-Type'], 'image/png');
                assert.equal(headers['ETag'], tile.length+'-'+Number(mtime));
                done(null);
            });

        });
    });

    it('should retrieve a tile from bundle-based source correctly', function(done) {
        var tilepath = __dirname+'/sample/bundle/tile.png';
        var bundlepath = __dirname+'/sample/bundle/_alllayers/L02/R0900C0d00.bundle';
        new Arcgis('arcgis://./test/sample/bundle', function(err, source) {
            if (err) return done(err);
            source.getTile(2, 0xd50, 0x971, function(err, tile, headers) {
                if (err) return done(err);
                var mtime = fs.statSync(bundlepath).mtime;
                assert.deepEqual(tile, fs.readFileSync(tilepath));
                assert.equal(headers['Last-Modified'], new Date(mtime).toUTCString());
                assert.equal(headers['Content-Type'], 'image/png');
                assert.equal(headers['ETag'], tile.length+'-'+Number(mtime));
                done(null);
            });

        });
    });

    it('should get bundle-based tilesource\'s conf.xml with getInfo',function(done) {
        var confpath = __dirname+'/sample/bundle/Conf.xml';
        new Arcgis('arcgis://./test/sample/bundle', function(err, source) {
            if (err) return done(err);
            source.getInfo(function(err, info) {
                if (err) return done(err);
                assert.deepEqual(info.conf, fs.readFileSync(confpath).toString('utf-8'));
                done();
            });

        });
    });

    it('should get file-based tilesource\'s conf.xml with getInfo',function(done) {
        var confpath = __dirname+'/sample/file/conf.xml';
        new Arcgis('arcgis://./test/sample/file', function(err, source) {
            if (err) return done(err);
            source.getInfo(function(err, info) {
                if (err) return done(err);
                assert.deepEqual(info.conf, fs.readFileSync(confpath).toString('utf-8'));
                done();
            });

        });
    });

    it('should retrieve a tile from bundle-based(improved) source correctly', function(done) {
        var tilepath = __dirname+'/sample/newbundle/tile.png';
        var bundlepath = __dirname+'/sample/newbundle/_alllayers/L10/R0180C0300.bundle';
        new Arcgis('arcgis://./test/sample/newbundle', function(err, source) {
            if (err) return done(err);
            source.getTile(10, 0x358, 0x1a2, function(err, tile, headers) {
                if (err) return done(err);
                var mtime = fs.statSync(bundlepath).mtime;
                assert.deepEqual(tile, fs.readFileSync(tilepath));
                assert.equal(headers['Last-Modified'], new Date(mtime).toUTCString());
                assert.equal(headers['Content-Type'], 'image/png');
                assert.equal(headers['ETag'], tile.length+'-'+Number(mtime));
                done(null);
            });

        });
    });

});
