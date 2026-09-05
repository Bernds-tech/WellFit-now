import assert from "node:assert/strict";
import {
  RUDI_WORLD_GEOMETRY,
  catchupGuideGeometry,
  catchupOriginY,
  catchupSurfaceScore,
  isSurfaceFullyOffscreen,
  isSurfaceJourneyReachable,
  isSurfaceSizeUsable,
  sampleSurfaceJourney,
  surfaceClimbEdgePoint,
  surfaceJourneyCandidateScore,
  surfaceJourneyDurationMs,
  surfaceJourneyLength,
  surfaceJourneyPoints,
  surfaceTopPoint,
} from "../../app/components/landing/rudiWorldGeometry.mjs";

const viewportHeight = 900;
const viewportWidth = 1440;
const rect = (left, top, width, height) => ({
  left,
  top,
  width,
  height,
  right: left + width,
  bottom: top + height,
});

const checks = [];
const check = (label, fn) => {
  fn();
  checks.push(label);
  console.log(`PASS: ${label}`);
};

check("Initial Rudi anchor is the F in WellFit", () => {
  assert.equal(RUDI_WORLD_GEOMETRY.initialAnchor, "hero-wellfit-4");
});

check("Narrow explicit letters remain usable Rudi surfaces", () => {
  assert.equal(isSurfaceSizeUsable(9, 52, "letter"), true);
});

check("Thin explicit ledges remain usable Rudi surfaces", () => {
  assert.equal(isSurfaceSizeUsable(180, 8, "ledge"), true);
  assert.equal(isSurfaceSizeUsable(120, 2, "line"), true);
});

check("Tiny generic DOM fragments are not promoted to Rudi surfaces", () => {
  assert.equal(isSurfaceSizeUsable(20, 20), false);
  assert.equal(isSurfaceSizeUsable(80, 10), false);
});

check("Surface top follows DOM scroll delta exactly and is not viewport-clamped", () => {
  const before = surfaceTopPoint(rect(300, 250, 80, 60), 0.52);
  const after = surfaceTopPoint(rect(300, -190, 80, 60), 0.52);
  assert.equal(after.y - before.y, -440);
  assert.equal(after.y, -193);
});

check("Horizontal footing remains inside the physical surface", () => {
  const box = rect(100, 200, 200, 50);
  assert.equal(surfaceTopPoint(box, -10).x, 116);
  assert.equal(surfaceTopPoint(box, 10).x, 284);
});

check("Partially visible surface does not trigger catch-up", () => {
  assert.equal(isSurfaceFullyOffscreen(rect(20, -70, 120, 50), viewportHeight), false);
  assert.equal(isSurfaceFullyOffscreen(rect(20, 880, 120, 50), viewportHeight), false);
});

check("Catch-up begins only after the whole surface clears the margin", () => {
  assert.equal(isSurfaceFullyOffscreen(rect(20, -90, 120, 50), viewportHeight), true);
  assert.equal(isSurfaceFullyOffscreen(rect(20, 940, 120, 50), viewportHeight), true);
});

check("Scroll-down catch-up origin is above the viewport", () => {
  assert.ok(catchupOriginY(1, viewportHeight) < 0);
});

check("Scroll-up catch-up origin is below the viewport", () => {
  assert.ok(catchupOriginY(-1, viewportHeight) > viewportHeight);
});

check("Climb edge stays attached to the DOM surface", () => {
  const edge = surfaceClimbEdgePoint(rect(420, 330, 100, 40));
  assert.equal(edge.x, 436);
  assert.equal(edge.y, 327);
});

check("Visible catch-up guide reaches the target surface from the top", () => {
  const guide = catchupGuideGeometry(rect(420, 330, 100, 40), 1, viewportHeight);
  assert.equal(guide.top, 0);
  assert.equal(guide.height, 327);
  assert.equal(guide.targetY, 327);
  assert.equal(guide.x, 436);
});

check("Visible catch-up guide reaches the target surface from the bottom", () => {
  const guide = catchupGuideGeometry(rect(420, 610, 100, 40), -1, viewportHeight);
  assert.equal(guide.top, 607);
  assert.equal(guide.height, 293);
  assert.equal(guide.targetY, 607);
});

check("Explicit Rudi surfaces receive deterministic catch-up preference", () => {
  const candidate = rect(0, 180, 100, 40);
  assert.ok(catchupSurfaceScore(candidate, 1, viewportHeight, true) < catchupSurfaceScore(candidate, 1, viewportHeight, false));
});

check("Catch-up scoring respects scroll direction", () => {
  const nearTop = rect(0, 190, 100, 40);
  const nearBottom = rect(0, 670, 100, 40);
  assert.ok(catchupSurfaceScore(nearTop, 1, viewportHeight, false) < catchupSurfaceScore(nearBottom, 1, viewportHeight, false));
  assert.ok(catchupSurfaceScore(nearBottom, -1, viewportHeight, false) < catchupSurfaceScore(nearTop, -1, viewportHeight, false));
});

check("Surface journey is a physical walk-climb-walk polyline", () => {
  const source = rect(100, 200, 70, 50);
  const target = rect(250, 360, 100, 60);
  const points = surfaceJourneyPoints(source, target, 0.5, 0.5);
  assert.equal(points.length, 4);
  assert.equal(points[0].y, points[1].y);
  assert.equal(points[1].x, points[2].x);
  assert.equal(points[2].y, points[3].y);
  assert.ok(surfaceJourneyLength(points) > 0);
});

check("Journey sampler reports climbing only on the vertical route segment", () => {
  const points = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 200 },
    { x: 160, y: 200 },
  ];
  assert.equal(sampleSurfaceJourney(points, 0.1).mode, "walk");
  assert.equal(sampleSurfaceJourney(points, 0.5).mode, "climb");
  assert.equal(sampleSurfaceJourney(points, 0.95).mode, "walk");
});

check("Journey duration is bounded for short and long physical routes", () => {
  assert.equal(surfaceJourneyDurationMs([{ x: 0, y: 0 }, { x: 5, y: 0 }]), RUDI_WORLD_GEOMETRY.journeyMinDurationMs);
  assert.equal(surfaceJourneyDurationMs([{ x: 0, y: 0 }, { x: 5000, y: 0 }]), RUDI_WORLD_GEOMETRY.journeyMaxDurationMs);
});

check("Nearby letters are preferred autonomous destinations", () => {
  const source = rect(100, 200, 32, 54);
  const nearLetter = rect(140, 200, 12, 54);
  const nearCard = rect(145, 205, 120, 80);
  assert.ok(
    surfaceJourneyCandidateScore(source, nearLetter, "letter", "letter")
      < surfaceJourneyCandidateScore(source, nearCard, "letter", "card"),
  );
});

check("Very long temporary bridges are rejected", () => {
  const source = rect(50, 200, 40, 50);
  const near = rect(260, 240, 80, 50);
  const far = rect(1000, 700, 80, 50);
  assert.equal(isSurfaceJourneyReachable(source, near, viewportWidth), true);
  assert.equal(isSurfaceJourneyReachable(source, far, viewportWidth), false);
});

console.log(`Rudi geometry validation passed: ${checks.length}/${checks.length}.`);
