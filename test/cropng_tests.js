"use strict";

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
});
