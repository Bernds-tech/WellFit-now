import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const world = read("app/components/landing/LivingRudiWorld.tsx");
const geometry = read("app/components/landing/rudiWorldGeometry.mjs");
const hero = read("app/components/landing/LandingHeroV5.tsx");
const landing = read("app/components/landing/PublicLandingV5.tsx");
const primitives = read("app/components/landing/LandingPrimitivesV5.tsx");
const legacyWorldExists = fs.existsSync(path.join(root, "app/components/landing/LivingRudi3D.tsx"));

const checks = [
  [landing.includes('import LivingRudiWorld from "./LivingRudiWorld"'), "Public landing uses the DOM-bound Rudi world controller"],
  [landing.includes("<LivingRudiWorld />"), "DOM-bound Rudi world is mounted"],
  [!legacyWorldExists, "Superseded viewport-bound Rudi controller is removed"],
  [hero.includes('data-rudi-anchor={`hero-wellfit-${index}`}'), "Hero WellFit letters expose individual Rudi anchors"],
  [hero.includes('data-rudi-surface="letter"'), "Hero letters are climbable surfaces"],
  [hero.includes("Rudi Rastlos"), "Rudi is presented as the first WellFit Buddy"],
  [!hero.includes('src="/buddy/luma.png"'), "No other Buddy is shown before Rudi in the hero"],
  [world.includes('from "./rudiWorldGeometry.mjs"'), "Runtime imports the shared Rudi world geometry authority"],
  [geometry.includes('initialAnchor: "hero-wellfit-4"'), "Shared geometry binds the initial climb to the F in WellFit"],
  [geometry.includes("isSurfaceSizeUsable"), "Shared geometry distinguishes narrow explicit surfaces from generic DOM fragments"],
  [world.includes("isSurfaceSizeUsable(rect.width, rect.height, element.dataset.rudiSurface)"), "Runtime keeps narrow letters and thin ledges in the physical surface graph"],
  [world.includes("getBoundingClientRect()"), "Rudi derives world position from real DOM geometry"],
  [world.includes("surfaceTopPoint("), "Runtime footing uses shared DOM-surface geometry"],
  [world.includes("surfaceClimbEdgePoint("), "Runtime climbing uses the shared physical surface edge"],
  [world.includes("isSurfaceFullyOffscreen("), "Catch-up waits for the shared full-offscreen rule"],
  [world.includes("catchupSurfaceScore("), "Catch-up surface selection uses deterministic shared scoring"],
  [world.includes("catchupGuideGeometry("), "Visible catch-up guide uses the same shared route geometry"],
  [geometry.includes("surfaceJourneyPoints"), "Shared geometry defines a physical surface-to-surface route"],
  [geometry.includes("sampleSurfaceJourney"), "Shared journey geometry distinguishes walking and climbing segments"],
  [world.includes('motion === "surface-journey"'), "Rudi has an autonomous surface-to-surface journey state"],
  [world.includes("chooseExplorationSurface"), "Rudi can choose nearby real page surfaces to explore"],
  [world.includes("isSurfaceJourneyReachable("), "Autonomous journeys reject implausibly long temporary bridges"],
  [world.includes('data-rudi-route-guide="surface-journey-walk"'), "Surface journeys render a visible walking bridge"],
  [world.includes('data-rudi-route-guide="surface-journey-climb"'), "Surface journeys render a visible climbing edge"],
  [world.includes('data-rudi-route-guide="surface-journey-land"'), "Surface journeys render a visible landing segment"],
  [world.includes('motion === "initial-climb"'), "Rudi has an explicit letter-climb entrance"],
  [world.includes('motion === "catchup-from-top"'), "Rudi can catch up from above after scrolling"],
  [world.includes('motion === "catchup-from-bottom"'), "Rudi can catch up from below after scrolling"],
  [world.includes('data-rudi-route-guide="catchup"'), "Visible catch-up climbing is attached to a real guide line instead of empty air"],
  [world.includes("Deliberately no viewport clamp"), "Rudi is allowed to leave the viewport with his surface"],
  [!world.includes("scrollOffsetRef"), "Legacy viewport scroll-offset simulation is not used"],
  [world.includes('data-rudi-world="dom-surface-bound"'), "World-binding mode is machine-identifiable"],
  [primitives.includes('data-rudi-surface="heading"'), "Later information-section headings are valid Rudi platforms"],
  [world.includes('(prefers-reduced-motion: reduce)'), "Reduced-motion preference is handled before WebGL motion"],
  [world.includes('setRenderMode("static")'), "Reduced-motion and unsupported WebGL use the static surface-bound fallback"],
  [!world.includes("useGLTF.preload"), "Invisible mobile/reduced-motion visitors do not eagerly preload the Rudi GLB pack"],
  [world.includes("RudiErrorBoundary"), "GLTF/Canvas failures are contained behind the static fallback"],
  [world.includes('style={{ pointerEvents: "none" }}'), "Full-screen Canvas cannot block landing controls"],
  [world.includes("currentAction.current = null"), "Strict Effects mixer cleanup clears the stopped action reference"],
  [world.includes("nextAction.isRunning()"), "Animation replay restarts stopped cached actions"],
  [world.includes("motionFinishTimerRef"), "Autonomous and catch-up completion use one cancellable timer authority"],
  [world.includes("clearMotionFinish();\n      previousSurfaceRef.current = current"), "Catch-up cancels an older autonomous completion before routing"],
  [world.includes("if (renderMode !== \"webgl\" || !modelReady || motionRef.current !== \"initial-climb\") return"), "Initial climb completion waits until the 3D model is ready"],
  [world.includes("setAttentionTarget(null);\n      window.clearTimeout(settleTimer)"), "Scrolling clears stale CTA attention before catch-up"],
  [world.includes("values[index] = hips.position.x"), "Imported root-position locomotion is flattened to the DOM route authority"],
];

const failures = checks.filter(([passed]) => !passed);
for (const [passed, label] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"}: ${label}`);
}

if (failures.length) {
  console.error(`Rudi world validation failed: ${failures.length} check(s).`);
  process.exit(1);
}

console.log(`Rudi world validation passed: ${checks.length}/${checks.length}.`);
