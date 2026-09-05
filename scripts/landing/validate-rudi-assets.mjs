#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = path.resolve("public/landing/rudi");
const expectedClips = ["walk", "run", "idle", "alert", "point", "inspect", "celebrate", "jump", "sit", "climb"];

function readGlb(filePath) {
  const bytes = fs.readFileSync(filePath);
  if (bytes.toString("ascii", 0, 4) !== "glTF" || bytes.readUInt32LE(4) !== 2) {
    throw new Error(`${path.basename(filePath)} is not a valid GLB 2 file.`);
  }
  if (bytes.readUInt32LE(8) !== bytes.length) throw new Error(`${path.basename(filePath)} has an invalid length header.`);
  const jsonLength = bytes.readUInt32LE(12);
  return { bytes, json: JSON.parse(bytes.toString("utf8", 20, 20 + jsonLength).replace(/\0+$/u, "")) };
}

const base = readGlb(path.join(root, "rudi-rigged.glb"));
const jointCount = base.json.skins?.[0]?.joints?.length ?? 0;
if (jointCount < 24) throw new Error(`Rudi base rig has only ${jointCount} joints.`);
if (!base.json.materials?.length || !base.json.images?.length) throw new Error("Rudi base rig has no embedded textured material.");

const nodeNames = new Set((base.json.nodes ?? []).map((node) => node.name).filter(Boolean));
for (const required of ["Head", "neck", "Hips", "LeftHand", "RightHand", "LeftFoot", "RightFoot", "LeftShoulder", "RightShoulder"]) {
  if (!nodeNames.has(required)) throw new Error(`Rudi base rig is missing ${required}.`);
}

for (const name of expectedClips) {
  const filePath = path.join(root, `rudi-${name}.animation.glb`);
  const clip = readGlb(filePath);
  if (clip.bytes.length > 500_000) throw new Error(`${path.basename(filePath)} is not compact (${clip.bytes.length} bytes).`);
  if (clip.json.meshes?.length || clip.json.images?.length) throw new Error(`${path.basename(filePath)} still contains render assets.`);
  if (clip.json.animations?.length !== 1) throw new Error(`${path.basename(filePath)} must contain exactly one animation.`);
  if (!clip.json.animations[0].channels?.length) throw new Error(`${path.basename(filePath)} has no animation channels.`);
}

console.log(`Rudi assets valid: textured ${jointCount}-joint rig + ${expectedClips.length} compact animation clips.`);
