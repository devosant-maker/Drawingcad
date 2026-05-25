import type { Point, Shape, ViewportState, SnapState } from '@/types';

// Helper to access shape properties dynamically
function s(shape: Shape): Record<string, unknown> {
  return shape as unknown as Record<string, unknown>;
}

// Generate unique ID
export function generateId(): string {
  return 'shape_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

// Convert screen coordinates to canvas world coordinates
export function screenToWorld(
  screenX: number,
  screenY: number,
  viewport: ViewportState
): Point {
  return {
    x: (screenX - viewport.offsetX) / viewport.scale,
    y: (screenY - viewport.offsetY) / viewport.scale,
  };
}

// Convert world coordinates to screen coordinates
export function worldToScreen(
  worldX: number,
  worldY: number,
  viewport: ViewportState
): Point {
  return {
    x: worldX * viewport.scale + viewport.offsetX,
    y: worldY * viewport.scale + viewport.offsetY,
  };
}

// Snap a point to grid
export function snapToGrid(point: Point, gridSize: number): Point {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
}

// Find nearest snap point from existing shapes
export function snapToNearestPoint(
  point: Point,
  shapes: Shape[],
  snapDistance: number
): Point | null {
  let nearest: Point | null = null;
  let minDist = snapDistance;

  for (const shape of shapes) {
    const points = getShapePoints(shape);
    for (const p of points) {
      const dist = Math.hypot(p.x - point.x, p.y - point.y);
      if (dist < minDist) {
        minDist = dist;
        nearest = p;
      }
    }
  }

  return nearest;
}

// Get all corner/control points of a shape
export function getShapePoints(shape: Shape): Point[] {
  const sh = s(shape);
  switch (shape.type) {
    case 'line':
    case 'dimension':
      return [
        { x: sh.x as number, y: sh.y as number },
        { x: sh.x2 as number, y: sh.y2 as number },
      ];
    case 'rectangle': {
      const sx = sh.x as number;
      const sy = sh.y as number;
      const w = sh.width as number;
      const h = sh.height as number;
      return [
        { x: sx, y: sy },
        { x: sx + w, y: sy },
        { x: sx + w, y: sy + h },
        { x: sx, y: sy + h },
      ];
    }
    case 'circle': {
      const cx = sh.x as number;
      const cy = sh.y as number;
      const r = sh.radius as number;
      return [
        { x: cx - r, y: cy },
        { x: cx + r, y: cy },
        { x: cx, y: cy - r },
        { x: cx, y: cy + r },
      ];
    }
    case 'triangle':
    case 'polygon':
    case 'draw':
      return sh.points as Point[];
    case 'text':
      return [{ x: sh.x as number, y: sh.y as number }];
    default:
      return [{ x: sh.x as number, y: sh.y as number }];
  }
}

// Get bounding box of a shape
export function getBoundingBox(shape: Shape): { minX: number; minY: number; maxX: number; maxY: number } | null {
  const sh = s(shape);
  const x = sh.x as number;
  const y = sh.y as number;

  switch (shape.type) {
    case 'line':
    case 'dimension': {
      const x2 = sh.x2 as number;
      const y2 = sh.y2 as number;
      return { minX: Math.min(x, x2), minY: Math.min(y, y2), maxX: Math.max(x, x2), maxY: Math.max(y, y2) };
    }
    case 'rectangle': {
      const w = sh.width as number;
      const h = sh.height as number;
      return { minX: x, minY: y, maxX: x + w, maxY: y + h };
    }
    case 'circle': {
      const r = sh.radius as number;
      return { minX: x - r, minY: y - r, maxX: x + r, maxY: y + r };
    }
    case 'triangle':
    case 'polygon':
    case 'draw': {
      const pts = sh.points as Point[];
      if (pts.length === 0) return null;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const p of pts) {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      }
      return { minX, minY, maxX, maxY };
    }
    case 'text': {
      const fontSize = (sh.fontSize as number) || 16;
      const text = (sh.text as string) || '';
      const textWidth = text.length * fontSize * 0.6;
      return { minX: x, minY: y - fontSize, maxX: x + textWidth, maxY: y };
    }
    default:
      return { minX: x, minY: y, maxX: x, maxY: y };
  }
}

// Check if point is inside/near a shape (for selection)
export function hitTest(point: Point, shape: Shape, tolerance: number = 5): boolean {
  const bbox = getBoundingBox(shape);
  if (!bbox) return false;

  // Quick bbox check
  if (point.x < bbox.minX - tolerance || point.x > bbox.maxX + tolerance ||
      point.y < bbox.minY - tolerance || point.y > bbox.maxY + tolerance) {
    return false;
  }

  const sh = s(shape);

  switch (shape.type) {
    case 'line':
    case 'dimension': {
      return pointToLineDistance(point, { x: sh.x as number, y: sh.y as number }, { x: sh.x2 as number, y: sh.y2 as number }) <= tolerance;
    }
    case 'rectangle': {
      return point.x >= bbox.minX && point.x <= bbox.maxX &&
             point.y >= bbox.minY && point.y <= bbox.maxY;
    }
    case 'circle': {
      const dist = Math.hypot(point.x - (sh.x as number), point.y - (sh.y as number));
      return dist <= (sh.radius as number) + tolerance;
    }
    case 'text': {
      const fontSize = (sh.fontSize as number) || 16;
      const text = (sh.text as string) || '';
      const textWidth = text.length * fontSize * 0.6;
      return point.x >= (sh.x as number) && point.x <= (sh.x as number) + textWidth &&
             point.y >= (sh.y as number) - fontSize && point.y <= (sh.y as number);
    }
    case 'draw': {
      const pts = sh.points as Point[];
      for (let i = 1; i < pts.length; i++) {
        if (pointToLineDistance(point, pts[i - 1], pts[i]) <= tolerance) return true;
      }
      return false;
    }
    case 'triangle':
    case 'polygon': {
      return isPointInPolygon(point, sh.points as Point[]);
    }
    default:
      return Math.hypot(point.x - (sh.x as number), point.y - (sh.y as number)) <= tolerance;
  }
}

// Calculate distance from point to line segment
function pointToLineDistance(p: Point, v: Point, w: Point): number {
  const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
}

// Check if point is inside polygon
function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = ((yi > point.y) !== (yj > point.y)) &&
      (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Calculate distance between two points
export function distance(p1: Point, p2: Point): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

// Calculate angle between two points (in degrees)
export function angle(p1: Point, p2: Point): number {
  return (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
}

// Create regular polygon points
export function createRegularPolygon(
  centerX: number,
  centerY: number,
  radius: number,
  sides: number
): Point[] {
  const points: Point[] = [];
  const angleStep = (2 * Math.PI) / sides;
  for (let i = 0; i < sides; i++) {
    points.push({
      x: centerX + radius * Math.cos(i * angleStep - Math.PI / 2),
      y: centerY + radius * Math.sin(i * angleStep - Math.PI / 2),
    });
  }
  return points;
}

// Smooth freehand drawing points using moving average
export function smoothPoints(points: Point[], windowSize: number = 3): Point[] {
  if (points.length < 3) return points;
  const smoothed: Point[] = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    let sumX = 0, sumY = 0;
    const start = Math.max(0, i - windowSize);
    const end = Math.min(points.length - 1, i + windowSize);
    for (let j = start; j <= end; j++) {
      sumX += points[j].x;
      sumY += points[j].y;
    }
    smoothed.push({
      x: sumX / (end - start + 1),
      y: sumY / (end - start + 1),
    });
  }
  smoothed.push(points[points.length - 1]);
  return smoothed;
}

// Snap a point with all snap modes
export function snapPoint(
  point: Point,
  snap: SnapState,
  shapes: Shape[]
): { point: Point; snapIndicator: Point | null } {
  let snapped = { ...point };
  let indicator: Point | null = null;

  if (snap.snapToGrid) {
    snapped = snapToGrid(snapped, snap.gridSize);
    indicator = { ...snapped };
  }

  if (snap.snapToPoint) {
    const nearest = snapToNearestPoint(point, shapes, snap.snapDistance);
    if (nearest) {
      snapped = nearest;
      indicator = { ...nearest };
    }
  }

  return { point: snapped, snapIndicator: indicator };
}

// Get dimension text
export function getDimensionText(length: number): string {
  if (length < 1) return (length * 1000).toFixed(0) + ' mm';
  if (length < 1000) return length.toFixed(1) + ' m';
  return (length / 1000).toFixed(2) + ' km';
}

// Duplicate a shape
export function duplicateShape(shape: Shape): Shape {
  const newShape = JSON.parse(JSON.stringify(shape)) as Shape;
  const sh = s(newShape);
  sh.id = generateId();
  sh.selected = false;

  // Offset slightly
  (sh.x as number) += 20;
  (sh.y as number) += 20;

  if (newShape.type === 'line' || newShape.type === 'dimension') {
    (sh.x2 as number) += 20;
    (sh.y2 as number) += 20;
  }

  if (newShape.type === 'triangle' || newShape.type === 'polygon' || newShape.type === 'draw') {
    sh.points = (sh.points as Point[]).map((p: Point) => ({
      x: p.x + 20,
      y: p.y + 20,
    }));
  }

  return newShape;
}
