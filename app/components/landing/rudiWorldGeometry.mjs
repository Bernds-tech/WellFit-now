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
});

/**
 * @typedef {{left:number, top:number, right:number, bottom:number, width:number, height:number}} RudiRect
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
