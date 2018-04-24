var fs = require('fs');
var url = require('url');
var path = require('path');
var qs = require('querystring');
var tiletype = require('tiletype');
var DOMParser = require('xmldom').DOMParser;

var FileTiler = require('tiler-arcgis-file'),
    BundleTiler = require('tiler-arcgis-bundle');

module.exports=ArcTilelive;

function ArcTilelive(uri, callback) {
    if (typeof uri === 'string') uri = url.parse(uri, true);
    else if (typeof uri.query === 'string') uri.query = qs.parse(uri.query);
    uri.query = uri.query || {};

    if (!uri.pathname) {
        callback(new Error('Invalid directory ' + url.format(uri)));
        return;
    }

    if (uri.hostname === '.' || uri.hostname == '..') {
        uri.pathname = uri.hostname + uri.pathname;
        delete uri.hostname;
        delete uri.host;
    }

    this.basepath = uri.pathname;
    this._init(uri.query, callback);
}

ArcTilelive.registerProtocols = function(tilelive) {
    tilelive.protocols['arcgis:'] = ArcTilelive;
};

ArcTilelive.prototype._init = function(query, callback) {
    var filetype = query.filetype;
    var me = this;
    this.getInfo(function(err, info) {
        if (err) {
            callback(err, me);
            return;
        }

        var doc =new DOMParser().parseFromString(info.conf);
        if (!doc || !doc.childNodes || doc.childNodes.length <= 1) {
            callback(new Error('invalid Conf.xml.'), me);
            return;
        }
        var children = doc.childNodes[1].childNodes;
        if (!children || !children.length) {
            callback(new Error('invalid Conf.xml.'), me);
            return;
        }
        var cacheInfoNode;
        for (var i = children.length - 1; i >= 0; i--) {
            if (!children[i] || !children[i].nodeName) {
                continue;
            }
            if (children[i].nodeName.toLowerCase() === 'cachestorageinfo') {
                cacheInfoNode = children[i];
                break;
            }
        }
        if (!cacheInfoNode) {
            // exploded file tile cache format;
            me.filetype = filetype || 'png';
            me.tiler = new FileTiler(me.basepath, me.filetype);
            callback(null, me);
            return;
        }
        //compact format
        var format, packSize;
        var c = cacheInfoNode.childNodes;
        if (!c) {
            callback(new Error('invalid StorageFormat or PacketSize in ' + info.filename), me);
            return;
        }
        for (var i = c.length - 1; i >= 0; i--) {
            if (!c[i] || !c[i].nodeName) {
                continue;
            }
            if (c[i].nodeName.toLowerCase() === 'storageformat') {
                format = c[i].textContent;
            } else if (c[i].nodeName.toLowerCase() === 'packetsize') {
                packSize = parseInt(c[i].textContent, 10);
            }
        }
        if (!format || !packSize) {
            callback(new Error('invalid StorageFormat or PacketSize in ' + info.filename), me);
            return;
        }
        if (format.indexOf('esriMapCacheStorageModeCompact') === 0) {
            var options = query;
            options.packSize = packSize;
            options.storageFormat = format;
            me.tiler = new BundleTiler(me.basepath, options);
        } else {
            callback(new Error('unsupported StorageFormat:' + format + ' in ' + info.filename), me);
        }
        callback(null, me);
    });
};

ArcTilelive.prototype.getTile = function(z, x, y, callback) {
    var me = this;
    this.tiler.getTile(x,y,z,function(error, tile) {
        if (error) {
            callback(error);
            return;
        }
        var headers = {};
        if (!me.filetype) {
            me.filetype = tiletype.type(tile.data);
        }
        headers['Last-Modified'] = new Date(tile.lastModified).toUTCString();
        headers['ETag'] = tile.data.length + '-' + Number(tile.lastModified);
        headers['Content-Type'] = 'image/'+me.filetype
        return callback(null, tile.data, headers);
    });
};

ArcTilelive.prototype.getGrid = function(z, x, y, callback) {
    callback(null);
};

ArcTilelive.prototype.getInfo = function(callback) {
    var filename = 'Conf.xml';
    var me = this;
    fs.readFile(path.join(this.basepath, filename), function(err, data) {
        if (err) {
            filename = 'conf.xml'
            fs.readFile(path.join(me.basepath, filename), function(err, data) {
                if (err) return callback(err);

                callback(null, {
                    'filename' : filename,
                    'conf'     : data.toString('utf-8')
                });
            });
            return;
        }
        callback(null, {
            'filename'  :  filename,
            'conf'      : data.toString('utf-8')
        });
    });

};

ArcTilelive.prototype.startWriting = function(callback) {
    callback(null);
};

ArcTilelive.prototype.stopWriting = function(callback) {
    callback(null);
};

ArcTilelive.prototype.putInfo = function(info, callback) {
    callback(null);
};

ArcTilelive.prototype.putTile = function(z, x, y, tile, callback) {
    callback(null);
};

ArcTilelive.prototype.putGrid = function(z, x, y, grid, callback) {
    callback(null);
};

ArcTilelive.prototype.close = function(callback) {
    callback(null);
};


