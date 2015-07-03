"use strict";

import { ok as Assert } from "assert";
import fs from "fs";
import path from "path";

import existsSync from "exists-sync";
import fileType from "file-type";
import { PNG } from "node-png";
import readChunk from "read-chunk";
import toBuff from "stream-to-buffer";

class Cropng {
  /**
   * @constructor
   * @param {Object|String} image the image to crop
   */
  constructor(image) {
    Assert(image, "Missing required image");
    Assert(Buffer.isBuffer(image) || typeof image === "string", "Image must be a string or buffer");

    let mime;

    if (!Buffer.isBuffer(image)) {
      Assert(existsSync(path.resolve(image)) === true, `Image could not be found: ${image}`);
      mime = this._getMimeFromPath(image);
    } else {
      mime = this._getMimeFromBuffer(image);
    }

    Assert(mime === "image/png", `Invalid MIME type: ${mime}`);

    /**
     * our image
     * @type {Buffer|String}
     */
    this.image = image;
  }

  /**
   * crop
   *
   * @param {Object} measurements the x,y,height and width to crop
   * @param {Number} measurements.x the x coordinate to start from
   * @param {Number} measurements.y the y coordinate to start from
   * @param {Number} measurements.height the height of the crop
   * @param {Number} measurements.width the width of the crop
   * @param {function(err: Object, image: Object)} callback
   */
  crop({ x: x, y: y, height: height, width: width }, callback) {
    let png = new PNG();
    let parsable = this._bufferizeImage();

    png.parse(parsable, (err, parsed) => {
      if (err) { return callback(err); }

      /**
       * @type {Object}
       */
      this._bitmap = {
        data: new Buffer(parsed.data),
        height: parsed.height,
        width: parsed.width
      };

      x = Math.round(x);
      y = Math.round(y);
      height = Math.round(height);
      width = Math.round(width);

      let bitmap = new Buffer(this._bitmap.data.length);
      let offset = 0;

      this.scan(x, y, height, width, function (x, y, idx) {
        let data = this._bitmap.data.readUInt32BE(idx, true);
        bitmap.writeUInt32BE(data, offset, true);
        offset += 4;
      });

      let image = {};

      image.data = new Buffer(bitmap);
      image.height = height;
      image.width = width;
      this._pack(image, callback);
    });
  }

  /**
   * _bufferizeImage turn an image into a buffer
   * @return {Object} bufferized image
   */
  _bufferizeImage() {
    if (!Buffer.isBuffer(this.image)) {
      return fs.readFileSync(this.image);
    }
    return this.image;
  }

  /**
   * _getMimeFromPath find the MIME type of a file
   *
   * @param {String} filePath the path to a file
   * @return {String} the MIME type => "image/png"
   */
  _getMimeFromPath(filePath) {
    let buffer = readChunk.sync(filePath, 0, 262);
    if (fileType(buffer)) { return fileType(buffer).mime; }
    return null;
  }

  /**
   * _getMimeFromBuffer find the MIME type of a buffer
   *
   * @param {Object} buffer an image buffer
   * @return {String} the MIME type => "image/png"
   */
  _getMimeFromBuffer(buffer) {
    if (fileType(buffer)) { return fileType(buffer).mime; }
    return null;
  }

  /**
   * _pack packs the image to return the buffer to it's original format
   *
   * @param {Object} image the image to pack
   * @param {Number} image.height the height
   * @param {Number} image.width the width
   * @param {Object} image.data the image buffer
   * @param {function(err: Object, image: Object)} callback
   */
  _pack(image, callback) {
    let png = new PNG();
    png.data = new Buffer(image.data);
    png.height = image.height;
    png.width = image.width;

    toBuff(png.pack(), function (err, buffer) {
      if (err) { return callback (err); }
      callback(null, {
        data: buffer,
        height: image.height,
        width: image.width
      });
    });
  }

  /*

     image pixel scanning
     https://github.com/oliver-moran/jimp

     Copyright (c) 2014 Oliver Moran

     Permission is hereby granted, free of charge, to any person obtaining a copy
     of this software and associated documentation files (the "Software"), to deal
     in the Software without restriction, including without limitation the rights
     to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     copies of the Software, and to permit persons to whom the Software is
     furnished to do so, subject to the following conditions:

     The above copyright notice and this permission notice shall be included in all
     copies or substantial portions of the Software.

     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     SOFTWARE.
  */

  /**
   * scan scans a region of a bitmap and calls iter for each region
   *
   * @param {Number} x the x coordinate to start from
   * @param {Number} y the y coordinate to start from
   * @param {Number} h the height of the scan region
   * @param {Number} w the width of the scan region
   * @param {function(x: Number, y: Number, idx: Number)} iter a function to call on each region.
   */
  scan(x, y, h, w, iter) {
    [x, y, h, w].forEach(m => {
      m = Math.round(m);
    });

    for (let _y = y; _y < (y + h); _y++) {
      for (let _x = x; _x < (x + w); _x++) {
        let idx = (this._bitmap.width * _y + _x) << 2;
        iter.call(this, _x, _y, idx);
      }
    }
  }
}

export default Cropng;
