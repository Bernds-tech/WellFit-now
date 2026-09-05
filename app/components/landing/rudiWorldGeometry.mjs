export const RUDI_WORLD_GEOMETRY = Object.freeze({
  initialAnchor: "hero-wellfit-4",
  surfaceTopOffsetPx: 3,
  offscreenMarginPx: 32,
  catchupOverscanPx: 150,
  catchupExplicitSurfaceBonusPx: 45,
  catchupPreferredInsetPx: 210,
  genericMinWidthPx: 34,
  genericMinHeightPx: 18,
  explicitMinWidthPx: 14,
  letterMinWidthPx: 7,
  thinSurfaceMinHeightPx: 2,
  journeyMaxDistancePx: 430,
  journeyMinDurationMs: 2200,
  journeyMaxDurationMs: 5200,
});

/**
 * @typedef {{left:number, top:number, right:number, bottom:number, width:number, height:number}} RudiRect
 * @typedef {{x:number, y:number}} RudiPoint
 */

/**
 * Explicit Rudi surfaces intentionally include narrow letters and thin ledges/lines.
 * Generic inferred surfaces stay larger so random tiny DOM fragments do not become walkable.
 * @param {number} width
 * @param {number} height
 * @param {string | undefined} kind
 */
export function isSurfaceSizeUsable(width, height, kind) {
  const explicit = Boolean(kind);
  const minWidth = kind === "letter"
    ? RUDI_WORLD_GEOMETRY.letterMinWidthPx
    : explicit
      ? RUDI_WORLD_GEOMETRY.explicitMinWidthPx
      : RUDI_WORLD_GEOMETRY.genericMinWidthPx;
  const thin = kind === "line" || kind === "ledge";
  const minHeight = thin
    ? RUDI_WORLD_GEOMETRY.thinSurfaceMinHeightPx
    : RUDI_WORLD_GEOMETRY.genericMinHeightPx;
  return width >= minWidth && height >= minHeight;
}

/**
 * Keep Rudi horizontally on the physical surface while never clamping the surface itself to the viewport.
 * @param {RudiRect} rect
 * @param {number} fraction
 */
export function surfaceTopPoint(rect, fraction) {
  const boundedFraction = Math.min(0.92, Math.max(0.08, fraction));
  return {
    x: rect.left + rect.width * boundedFraction,
    y: rect.top - RUDI_WORLD_GEOMETRY.surfaceTopOffsetPx,
  };
}

/**
 * Side edge used for visible climbing. This is bound to the DOM element, not to viewport-safe coordinates.
 * @param {RudiRect} rect
 */
export function surfaceClimbEdgePoint(rect) {
  const inset = Math.min(Math.max(rect.width * 0.16, 7), 18);
  return {
    x: rect.left + inset,
    y: rect.top - RUDI_WORLD_GEOMETRY.surfaceTopOffsetPx,
  };
}

/**
 * A surface is considered gone only after the whole element has cleared the viewport plus a small margin.
 * Partial visibility deliberately keeps Rudi attached to that same surface.
 * @param {RudiRect} rect
 * @param {number} viewportHeight
 */
export function isSurfaceFullyOffscreen(rect, viewportHeight) {
  const margin = RUDI_WORLD_GEOMETRY.offscreenMarginPx;
  return rect.bottom < -margin || rect.top > viewportHeight + margin;
}

/**
 * Scroll-down means the old content left through the top, therefore Rudi returns from above.
 * Scroll-up means he returns from below.
 * @param {1|-1} direction
 * @param {number} viewportHeight
 */
export function catchupOriginY(direction, viewportHeight) {
  return direction > 0
    ? -RUDI_WORLD_GEOMETRY.catchupOverscanPx
    : viewportHeight + RUDI_WORLD_GEOMETRY.catchupOverscanPx;
}

/**
 * Score a candidate surface without moving it. Lower is better.
 * Explicit data-rudi-surface elements are preferred, but vertical proximity remains relevant.
 * @param {RudiRect} rect
 * @param {1|-1} direction
 * @param {number} viewportHeight
 * @param {boolean} explicitSurface
 */
export function catchupSurfaceScore(rect, direction, viewportHeight, explicitSurface) {
  const inset = RUDI_WORLD_GEOMETRY.catchupPreferredInsetPx;
  const preferredY = direction > 0
    ? Math.min(inset, viewportHeight * 0.3)
    : Math.max(viewportHeight - inset, viewportHeight * 0.7);
  const candidateY = direction > 0 ? rect.top : rect.bottom;
  const explicitBonus = explicitSurface ? RUDI_WORLD_GEOMETRY.catchupExplicitSurfaceBonusPx : 0;
  return Math.abs(candidateY - preferredY) - explicitBonus;
}

/**
 * Visible La-Linea-style connector from viewport edge to the next DOM surface.
 * @param {RudiRect} rect
 * @param {1|-1} direction
 * @param {number} viewportHeight
 */
export function catchupGuideGeometry(rect, direction, viewportHeight) {
  const edge = surfaceClimbEdgePoint(rect);
  const fromTop = direction > 0;
  const targetY = edge.y;
  const top = fromTop ? 0 : Math.max(0, Math.min(targetY, viewportHeight));
  const height = fromTop
    ? Math.max(0, Math.min(targetY, viewportHeight))
    : Math.max(0, viewportHeight - top);

  return {
    x: edge.x,
    targetY,
    top,
    height,
    capX: edge.x - 7,
    capY: Math.max(0, Math.min(targetY - 1, viewportHeight - 2)),
  };
}

/**
 * A visible page-to-page-surface journey always follows an L-shaped physical route:
 * 1) walk horizontally from the current platform,
 * 2) climb the target edge,
 * 3) walk onto the target platform.
 * No segment is invented in world space without a matching visible guide line.
 * @param {RudiRect} sourceRect
 * @param {RudiRect} targetRect
 * @param {number} sourceFraction
 * @param {number} targetFraction
 * @returns {RudiPoint[]}
 */
export function surfaceJourneyPoints(sourceRect, targetRect, sourceFraction, targetFraction) {
  const start = surfaceTopPoint(sourceRect, sourceFraction);
  const targetEdge = surfaceClimbEdgePoint(targetRect);
  const targetTop = surfaceTopPoint(targetRect, targetFraction);
  return [
    start,
    { x: targetEdge.x, y: start.y },
    targetEdge,
    targetTop,
  ];
}

/** @param {RudiPoint} a @param {RudiPoint} b */
function pointDistance(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** @param {RudiPoint[]} points */
export function surfaceJourneyLength(points) {
  let total = 0;
  for (let index = 0; index < points.length - 1; index += 1) {
    total += pointDistance(points[index], points[index + 1]);
  }
  return total;
}

/**
 * Sample the same polyline used by the visible route guide.
 * The returned mode lets the runtime switch from walking to climbing on vertical segments.
 * @param {RudiPoint[]} points
 * @param {number} progress
 */
export function sampleSurfaceJourney(points, progress) {
  const bounded = Math.min(1, Math.max(0, progress));
  const segmentLengths = [];
  let total = 0;
  for (let index = 0; index < points.length - 1; index += 1) {
    const length = pointDistance(points[index], points[index + 1]);
    segmentLengths.push(length);
    total += length;
  }

  if (total <= 0.001) {
    return { ...points[points.length - 1], segment: points.length - 2, mode: "walk" };
  }

  let remaining = total * bounded;
  for (let index = 0; index < segmentLengths.length; index += 1) {
    const length = segmentLengths[index];
    if (length <= 0.001) continue;
    if (remaining <= length || index === segmentLengths.length - 1) {
      const a = points[index];
      const b = points[index + 1];
      const t = Math.min(1, remaining / length);
      return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        segment: index,
        mode: Math.abs(b.y - a.y) > Math.abs(b.x - a.x) ? "climb" : "walk",
      };
    }
    remaining -= length;
  }

  return { ...points[points.length - 1], segment: segmentLengths.length - 1, mode: "walk" };
}

/**
 * Deterministic journey duration from physical route length.
 * @param {RudiPoint[]} points
 */
export function surfaceJourneyDurationMs(points) {
  const raw = 1800 + surfaceJourneyLength(points) * 5.5;
  return Math.round(Math.min(
    RUDI_WORLD_GEOMETRY.journeyMaxDurationMs,
    Math.max(RUDI_WORLD_GEOMETRY.journeyMinDurationMs, raw),
  ));
}

/**
 * Lower score is a better autonomous next surface. Nearby explicit elements win;
 * letter-to-letter travel is additionally preferred so Rudi actually explores the word he started on.
 * @param {RudiRect} sourceRect
 * @param {RudiRect} targetRect
 * @param {string | undefined} sourceKind
 * @param {string | undefined} targetKind
 */
export function surfaceJourneyCandidateScore(sourceRect, targetRect, sourceKind, targetKind) {
  const points = surfaceJourneyPoints(sourceRect, targetRect, 0.5, 0.5);
  const distance = surfaceJourneyLength(points);
  const explicitBonus = targetKind ? 55 : 0;
  const letterBonus = sourceKind === "letter" && targetKind === "letter" ? 120 : 0;
  return distance - explicitBonus - letterBonus;
}

/**
 * Reject journeys so large that the temporary physical bridge would dominate the page.
 * @param {RudiRect} sourceRect
 * @param {RudiRect} targetRect
 * @param {number} viewportWidth
 */
export function isSurfaceJourneyReachable(sourceRect, targetRect, viewportWidth) {
  const limit = Math.min(RUDI_WORLD_GEOMETRY.journeyMaxDistancePx, viewportWidth * 0.42);
  return surfaceJourneyLength(surfaceJourneyPoints(sourceRect, targetRect, 0.5, 0.5)) <= limit;
}
