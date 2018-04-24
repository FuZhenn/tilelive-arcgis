# tilelive-arcgis
A tilelive.js adapter for reading from tile storage cache of ArcGIS

[![Circle CI](https://circleci.com/gh/fuzhenn/tilelive-arcgis.svg?style=svg)](https://circleci.com/gh/fuzhenn/tilelive-arcgis)

## Introduction
This is a [tilelive](http://github.com/mapbox/tilelive) adapter from tile storage cache of ESRI ArcGIS.

It is readonly currently and can't be used to generate ArcGIS tile caches.

### ArcGIS Tile Formats

There are 3 types of ArcGIS Tile Formats:
* Exploded Tile: The only format of ArcGIS 9.3.1 and before

* [Compact Tile](https://server.arcgis.com/zh-cn/server/latest/publish-services/windows/inside-the-compact-cache-storage-format.htm) is a tile format since ArcGIS version 10. It bundles exploded tile files into a .bundlx and a .bundle file and really reduces number of tile files.

* Improved Compact Tile: a new improved compact format introduced in ArcGIS 10.3.

## Install

```bash
npm install tilelive-arcgis
```

##Tilelive Protocol

```javascript
// filetype is an optional parameter, default is 'png'.
// It is only useful for exploded tiles in other formats besides png 
var url = 'arcgis://path/to/tiles?filetype=jpg'
```

## Usage

```javascript
var fs = require('fs');
var Arcgis = require('tileive-arcgis');

//root folder of the tiles, where the Conf.xml stands
new Arcgis('arcgis://./test/sample/bundle', function(err, source) {
    if (err) throw err;
    source.getTile(2, 0xd50, 0x971, function(err, tile, headers) {
        if (err) throw err;
        console.log(headers);
        //tile is the buffer.
        fs.writeFileSync(tile);        
    });
    source.getInfo(function(error, info){
        if (err) throw err;
        console.log(info);
    });
});
```
