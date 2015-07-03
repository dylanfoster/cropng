"use strict";

import { expect } from "chai";

import PNG from "../src/cropng";

describe("croppng", function () {
  it("exists", function (done) {
    expect(!PNG).to.equal(false);
    done();
  });
});
