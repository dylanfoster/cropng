"use strict";

import { expect } from "chai";

import PngCrop = from "../src/croppng";

describe("croppng", function () {
  it("exists", function (done) {
    expect(!PngCrop).to.equal(false);
    done();
  });
});
