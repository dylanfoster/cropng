"use strict";

import fs from "fs";
import path from "path";

import { expect } from "chai";

import PNG from "../src/cropng";

describe("Croppng", function () {
  it("requires an image", function () {
    expect(function () {
      new PNG();
    }).to.throw("Missing required image");
  });

  it("requires image to be a string or buffer", function () {
    expect(function () {
      new PNG({});
    }).to.throw("Image must be a string or buffer");
  });

  it("returns an error if image is not found", function () {
    let _path = "/foo/bar/baz.png";

    expect(function () {
      new PNG(_path);
    }).to.throw("Image could not be found: /foo/bar/baz");
  });

  it("returns an error if image file is not image/png", function () {
    let image = path.resolve(__dirname, "fixtures/mario.jpeg");

    expect(function () {
      new PNG(image);
    }).to.throw("Invalid MIME type: image/jpeg");
  });

  it("returns an error if image buffer is not image/png", function () {
    let imagePath = path.resolve(__dirname, "fixtures/mario.jpeg");
    let buff = fs.readFileSync(imagePath);

    expect(function () {
      new PNG(buff);
    }).to.throw("Invalid MIME type: image/jpeg");
  });

  describe("#crop", function () {
    it("crops an image from a path", function (done) {
      let image = path.resolve(__dirname, "fixtures/mario.png");

      let png = new PNG(image);
      png.crop({ x: 0, y: 0, height: 50, width: 50 }, function (err, cropped) {
        expect(err).to.eql(null);
        expect(cropped.height).to.eql(50);
        expect(cropped.width).to.eql(50);
        let fileType = require("file-type");
        expect(fileType(cropped.data).mime).to.eql("image/png");
        done();
      });
    });
  });
});
