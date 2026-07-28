import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const sourceDir = path.join(projectRoot, "assets/landing/hero-composite-v12");
const outputFile = path.join(projectRoot, "public/landing/hero-composite-v12.webp");
const expectedBytes = 21936;
const expectedSha256 = "b24ac57ea55bd9010bd2380bab1a5b2cdfb04083ce971bd795e844622893dfcf";
const expectedChunks = new Map([
  ["chunk-00.txt", { length: 7500, sha256: "1c289a24c836d10009c0a265e3f758caed35c3a35f667115b5b6360ae91e467f" }],
  ["chunk-01.txt", { length: 7500, sha256: "b584bb946689735cebaa7933c52efe5895c083d6650986d4b5ca2c4450370f50" }],
  ["chunk-02.txt", { length: 7500, sha256: "2498f1266f8542fc674b06bcd38ebb05f82b1d338141bd3f09cfd8797f907016" }],
  ["chunk-03.txt", { length: 6748, sha256: "84e2f04da977cc72fe13411e151a287cdff899044ebd381b9ed7a66c89de1b9c" }],
]);

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizeChunk(name, rawValue, expected) {
  const value = rawValue.trim();
  if (value.length === expected.length && sha256(value) === expected.sha256) {
    return value;
  }

  // The GitHub text transport added one duplicated character to one source chunk.
  // Repair is allowed only when exactly one deletion reproduces the approved
  // character count and checksum. Any other corruption remains a hard failure.
  if (value.length === expected.length + 1) {
    let repaired = null;
    let repairedIndex = -1;
    for (let index = 0; index < value.length; index += 1) {
      const candidate = value.slice(0, index) + value.slice(index + 1);
      if (sha256(candidate) === expected.sha256) {
        if (repaired !== null) {
          throw new Error(`Hero chunk ${name} has more than one possible single-character repair`);
        }
        repaired = candidate;
        repairedIndex = index;
      }
    }
    if (repaired !== null) {
      console.log(`Normalized ${name} by removing one duplicated character at offset ${repairedIndex}`);
      return repaired;
    }
  }

  throw new Error(
    `Hero chunk mismatch for ${name}: expected length ${expected.length} and ${expected.sha256}, received length ${value.length} and ${sha256(value)}`,
  );
}

const chunks = fs
  .readdirSync(sourceDir)
  .filter((name) => /^chunk-\d+\.txt$/.test(name))
  .sort();

if (chunks.length !== expectedChunks.size) {
  throw new Error(`Expected ${expectedChunks.size} hero asset chunks, found ${chunks.length}`);
}

const encoded = chunks
  .map((name) => {
    const expected = expectedChunks.get(name);
    if (!expected) {
      throw new Error(`Unexpected hero asset chunk: ${name}`);
    }
    return normalizeChunk(name, fs.readFileSync(path.join(sourceDir, name), "utf8"), expected);
  })
  .join("");

const image = Buffer.from(encoded, "base64");
const imageSha256 = sha256(image);

if (image.length !== expectedBytes) {
  throw new Error(`Hero image size mismatch: expected ${expectedBytes}, received ${image.length}`);
}
if (imageSha256 !== expectedSha256) {
  throw new Error(`Hero image checksum mismatch: expected ${expectedSha256}, received ${imageSha256}`);
}
if (image.subarray(0, 4).toString("ascii") !== "RIFF") {
  throw new Error("Hero image does not begin with a RIFF header");
}
if (image.subarray(8, 12).toString("ascii") !== "WEBP") {
  throw new Error("Hero image is not a WebP container");
}

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, image);
console.log(`Materialized ${path.relative(projectRoot, outputFile)} (${image.length} bytes, ${imageSha256})`);
