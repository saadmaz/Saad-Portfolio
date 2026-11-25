/**
 * scripts/write-headers.mjs
 * Writes dist/_headers (Cloudflare Pages static-file headers) from the single
 * definition in src/lib/security-headers.js.
 */

import { writeFileSync } from "fs";
import { headersFile } from "../src/lib/security-headers.js";

writeFileSync("dist/_headers", headersFile(), "utf-8");
console.log("✅ _headers written");
