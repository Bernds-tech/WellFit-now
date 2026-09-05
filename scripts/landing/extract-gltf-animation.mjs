#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error("Usage: node extract-gltf-animation.mjs <input.glb> <output.glb>");
  process.exit(1);
}

const source = fs.readFileSync(inputPath);
if (source.toString("ascii", 0, 4) !== "glTF") throw new Error("Input is not a GLB file.");

const jsonLength = source.readUInt32LE(12);
const jsonType = source.toString("ascii", 16, 20);
if (jsonType !== "JSON") throw new Error("GLB JSON chunk is missing.");

const gltf = JSON.parse(source.toString("utf8", 20, 20 + jsonLength).replace(/\0+$/u, ""));
const binHeaderOffset = 20 + jsonLength;
const binLength = source.readUInt32LE(binHeaderOffset);
const binType = source.toString("ascii", binHeaderOffset + 4, binHeaderOffset + 8);
if (binType !== "BIN\0") throw new Error("GLB BIN chunk is missing.");
const bin = source.subarray(binHeaderOffset + 8, binHeaderOffset + 8 + binLength);

const animationAccessorIds = new Set();
for (const animation of gltf.animations ?? []) {
  for (const sampler of animation.samplers ?? []) {
    animationAccessorIds.add(sampler.input);
    animationAccessorIds.add(sampler.output);
  }
}
if (animationAccessorIds.size === 0) throw new Error("No animation accessors found.");

const accessorMap = new Map();
const bufferViewMap = new Map();
const newAccessors = [];
const newBufferViews = [];
const binaryParts = [];
let binaryLength = 0;

const align4 = (value) => (value + 3) & ~3;

for (const oldAccessorId of [...animationAccessorIds].sort((a, b) => a - b)) {
  const accessor = structuredClone(gltf.accessors[oldAccessorId]);
  const oldViewId = accessor.bufferView;
  if (oldViewId === undefined) throw new Error(`Sparse accessor ${oldAccessorId} is not supported.`);

  if (!bufferViewMap.has(oldViewId)) {
    const oldView = gltf.bufferViews[oldViewId];
    const start = oldView.byteOffset ?? 0;
    const end = start + oldView.byteLength;
    const alignedOffset = align4(binaryLength);
    if (alignedOffset > binaryLength) binaryParts.push(Buffer.alloc(alignedOffset - binaryLength));
    const bytes = bin.subarray(start, end);
    binaryParts.push(bytes);
    const newViewId = newBufferViews.length;
    bufferViewMap.set(oldViewId, newViewId);
    newBufferViews.push({
      buffer: 0,
      byteOffset: alignedOffset,
      byteLength: bytes.length,
      ...(oldView.byteStride ? { byteStride: oldView.byteStride } : {}),
    });
    binaryLength = alignedOffset + bytes.length;
  }

  accessor.bufferView = bufferViewMap.get(oldViewId);
  accessorMap.set(oldAccessorId, newAccessors.length);
  newAccessors.push(accessor);
}

const animations = structuredClone(gltf.animations);
for (const animation of animations) {
  for (const sampler of animation.samplers) {
    sampler.input = accessorMap.get(sampler.input);
    sampler.output = accessorMap.get(sampler.output);
  }
}

const nodes = (gltf.nodes ?? []).map((node) => {
  const { mesh, skin, camera, weights, ...animationNode } = node;
  void mesh; void skin; void camera; void weights;
  return animationNode;
});

const outputJson = {
  asset: gltf.asset,
  scene: gltf.scene ?? 0,
  scenes: gltf.scenes ?? [{ nodes: [0] }],
  nodes,
  animations,
  accessors: newAccessors,
  bufferViews: newBufferViews,
  buffers: [{ byteLength: align4(binaryLength) }],
};

const jsonBytes = Buffer.from(JSON.stringify(outputJson));
const paddedJsonLength = align4(jsonBytes.length);
const jsonChunk = Buffer.alloc(paddedJsonLength, 0x20);
jsonBytes.copy(jsonChunk);

const joinedBin = Buffer.concat(binaryParts);
const paddedBinLength = align4(joinedBin.length);
const binChunk = Buffer.alloc(paddedBinLength);
joinedBin.copy(binChunk);

const output = Buffer.alloc(12 + 8 + jsonChunk.length + 8 + binChunk.length);
output.write("glTF", 0, "ascii");
output.writeUInt32LE(2, 4);
output.writeUInt32LE(output.length, 8);
output.writeUInt32LE(jsonChunk.length, 12);
output.write("JSON", 16, "ascii");
jsonChunk.copy(output, 20);
const outputBinOffset = 20 + jsonChunk.length;
output.writeUInt32LE(binChunk.length, outputBinOffset);
output.write("BIN\0", outputBinOffset + 4, "ascii");
binChunk.copy(output, outputBinOffset + 8);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, output);
console.log(`${path.basename(inputPath)} -> ${path.basename(outputPath)} (${output.length} bytes)`);
