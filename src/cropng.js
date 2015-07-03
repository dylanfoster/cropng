"use strict";

import { ok as Assert } from "assert";

class Cropng {
  constructor(image) {
    Assert(image, "Missing required image");
    Assert(Buffer.isBuffer(image) || typeof image === "string", "Image must be a string or buffer");
  }
}

export default Cropng;
