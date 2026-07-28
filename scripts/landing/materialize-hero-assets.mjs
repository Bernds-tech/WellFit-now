import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const sourceDir = path.join(projectRoot, "assets/landing/hero-composite-v12");
const outputFile = path.join(projectRoot, "public/landing/hero-composite-v12.webp");
const expectedBytes = 21936;
const expectedSha256 = "b24ac57ea55bd9010bd2380bab1a5b2cdfb04083ce971bd795e844622893dfcf";

const chunks = fs
  .readdirSync(sourceDir)
  .filter((name) => /^chunk-\d+\.txt$/.test(name))
  .sort();

if (chunks.length !== 4) {
  throw new Error(`Expected 4 hero asset chunks, found ${chunks.length}`);
}

const encoded = chunks
  .map((name) => fs.readFileSync(path.join(sourceDir, name), "utf8").trim())
  .join("");
const image = Buffer.from(encoded, "base64");
const sha256 = crypto.createHash("sha256").update(image).digest("hex");

if (image.length !== expectedBytes) {
  throw new Error(`Hero image size mismatch: expected ${expectedBytes}, received ${image.length}`);
}
if (sha256 !== expectedSha256) {
  throw new Error(`Hero image checksum mismatch: expected ${expectedSha256}, received ${sha256}`);
}
if (image.subarray(0, 4).toString("ascii") !== "RIFF") {
  throw new Error("Hero image does not begin with a RIFF header");
}
if (image.subarray(8, 12).toString("ascii") !== "WEBP") {
  throw new Error("Hero image is not a WebP container");
}

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, image);
console.log(`Materialized ${path.relative(projectRoot, outputFile)} (${image.length} bytes, ${sha256})`);
