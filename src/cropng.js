"use strict";

import { ok as Assert } from "assert";
import fs from "fs";
import path from "path";

import existsSync from "exists-sync";
import fileType from "file-type";
import { PNG } from "node-png";
import readChunk from "read-chunk";

class Cropng {
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

    this.image = image;
  }

  /**
   * crop
   *
   * @param { x: x
   * @param y: y
   * @param height: height
   * @param width: width }
   * @param callback
   * @return {undefined}
   */
  crop({ x: x, y: y, height: height, width: width }, callback) {
    let png = new PNG();
    let parsable = this._bufferizeImage();

    png.parse(parsable, (err, parsed) => {
      if (err) { return callback(err); }

      this.bitmap = {
        data: new Buffer(parsed.data),
        height: parsed.height,
        width: parsed.width
      };

      x = Math.round(x);
      y = Math.round(y);
      height = Math.round(height);
      width = Math.round(width);

      let bitmap = new Buffer(this.bitmap.data.length);
      let offset = 0;

      this.scan(x, y, height, width, function (x, y, idx) {
        let data = this.bitmap.data.readUInt32BE(idx, true);
        bitmap.writeUInt32BE(data, offset, true);
        offset += 4;
      });

      let image = {};
      image.data = new Buffer(bitmap);
      image.height = height;
      image.width = width;
      callback(null, image);
    });
  }

  _bufferizeImage() {
    if (!Buffer.isBuffer(this.image)) {
      return fs.readFileSync(this.image);
    }
    return this.image;
  }

  _getMimeFromPath(filePath) {
    let buffer = readChunk.sync(filePath, 0, 262);
    if (fileType(buffer)) { return fileType(buffer).mime; }
    return null;
  }

  _getMimeFromBuffer(buffer) {
    if (fileType(buffer)) { return fileType(buffer).mime; }
    return null;
  }

  scan(x, y, h, w, iter) {
    [x, y, h, w].forEach(m => {
      m = Math.round(m);
    });

    for (let _y = y; _y < (y + h); _y++) {
      for (let _x = x; _x < (x + w); _x++) {
        let idx = (this.bitmap.width * _y + _x) << 2;
        iter.call(this, _x, _y, idx);
      }
    }
  }
}

export default Cropng;
