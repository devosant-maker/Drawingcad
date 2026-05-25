import type { Shape, ViewportState, SnapState, Point } from '@/types';
import { getBoundingBox } from './canvas';

// Helper to access shape properties dynamically
function sr(shape: Shape): Record<string, unknown> {
  return shape as unknown as Record<string, unknown>;
}

// Main render function
export function renderCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  shapes: Shape[],
  viewport: ViewportState,
  showGrid: boolean,
  snap: SnapState,
  snapIndicator: Point | null,
  tempShape: Shape | null
): void {
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(0, 0, width, height);

  ctx.save();

  // Apply viewport transform
  ctx.translate(viewport.offsetX, viewport.offsetY);
  ctx.scale(viewport.scale, viewport.scale);

  // Draw grid
  if (showGrid) {
    drawGrid(ctx, width, height, viewport, snap.gridSize);
  }

  // Draw all shapes
  for (const shape of shapes) {
    drawShape(ctx, shape);
  }

  // Draw temp shape (while drawing)
  if (tempShape) {
    ctx.globalAlpha = 0.6;
    drawShape(ctx, tempShape);
    ctx.globalAlpha = 1;
  }

  // Draw snap indicator
  if (snapIndicator) {
    drawSnapIndicator(ctx, snapIndicator);
  }

  // Draw selection handles for selected shapes
  for (const shape of shapes.filter(s => s.selected)) {
    drawSelectionHandles(ctx, shape);
  }

  ctx.restore();
}

// Draw grid
function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  viewport: ViewportState,
  gridSize: number
): void {
  // Calculate visible area in world coordinates
  const startX = -viewport.offsetX / viewport.scale;
  const startY = -viewport.offsetY / viewport.scale;
  const endX = startX + width / viewport.scale;
  const endY = startY + height / viewport.scale;

  // Adjust grid size based on zoom
  let actualGridSize = gridSize;
  const zoomLevel = viewport.scale;

  if (zoomLevel < 0.3) actualGridSize = gridSize * 4;
  else if (zoomLevel < 0.6) actualGridSize = gridSize * 2;
  else if (zoomLevel > 2) actualGridSize = gridSize / 2;
  else if (zoomLevel > 4) actualGridSize = gridSize / 4;

  // Draw dots
  ctx.fillStyle = '#d0d5db';
  const startGridX = Math.floor(startX / actualGridSize) * actualGridSize;
  const startGridY = Math.floor(startY / actualGridSize) * actualGridSize;

  for (let x = startGridX; x < endX; x += actualGridSize) {
    for (let y = startGridY; y < endY; y += actualGridSize) {
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw major grid lines every 5 grid units
  ctx.strokeStyle = '#e2e6ea';
  ctx.lineWidth = 0.5;
  const majorGridSize = actualGridSize * 5;
  const startMajorX = Math.floor(startX / majorGridSize) * majorGridSize;
  const startMajorY = Math.floor(startY / majorGridSize) * majorGridSize;

  ctx.beginPath();
  for (let x = startMajorX; x < endX; x += majorGridSize) {
    ctx.moveTo(x, startY);
    ctx.lineTo(x, endY);
  }
  for (let y = startMajorY; y < endY; y += majorGridSize) {
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
  }
  ctx.stroke();
}

// Draw a single shape
function drawShape(ctx: CanvasRenderingContext2D, shape: Shape): void {
  if (shape.opacity <= 0) return;
  const sh = sr(shape);

  ctx.save();
  ctx.globalAlpha = shape.opacity;
  ctx.strokeStyle = shape.strokeColor;
  ctx.fillStyle = shape.fillColor;
  ctx.lineWidth = shape.strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (shape.type) {
    case 'line':
    case 'dimension': {
      ctx.beginPath();
      ctx.moveTo(sh.x as number, sh.y as number);
      ctx.lineTo(sh.x2 as number, sh.y2 as number);
      ctx.stroke();

      // For dimension, draw arrowheads and text
      if (shape.type === 'dimension') {
        drawArrowheads(ctx, sh.x as number, sh.y as number, sh.x2 as number, sh.y2 as number);
        // Draw dimension text
        const midX = ((sh.x as number) + (sh.x2 as number)) / 2;
        const midY = ((sh.y as number) + (sh.y2 as number)) / 2;
        const len = Math.hypot((sh.x2 as number) - (sh.x as number), (sh.y2 as number) - (sh.y as number));
        ctx.save();
        ctx.fillStyle = '#212529';
        ctx.font = '12px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(len.toFixed(0) + ' px', midX, midY - 4);
        ctx.restore();
      }
      break;
    }

    case 'rectangle': {
      ctx.beginPath();
      if ((sh.rx as number) > 0 || (sh.ry as number) > 0) {
        ctx.roundRect(sh.x as number, sh.y as number, sh.width as number, sh.height as number, sh.rx as number);
      } else {
        ctx.rect(sh.x as number, sh.y as number, sh.width as number, sh.height as number);
      }
      if (shape.fillColor && shape.fillColor !== 'transparent') {
        ctx.fill();
      }
      ctx.stroke();
      break;
    }

    case 'circle': {
      ctx.beginPath();
      ctx.arc(sh.x as number, sh.y as number, sh.radius as number, 0, Math.PI * 2);
      if (shape.fillColor && shape.fillColor !== 'transparent') {
        ctx.fill();
      }
      ctx.stroke();
      break;
    }

    case 'triangle': {
      const triPts = sh.points as Point[];
      if (triPts.length >= 3) {
        ctx.beginPath();
        ctx.moveTo(triPts[0].x, triPts[0].y);
        ctx.lineTo(triPts[1].x, triPts[1].y);
        ctx.lineTo(triPts[2].x, triPts[2].y);
        ctx.closePath();
        if (shape.fillColor && shape.fillColor !== 'transparent') {
          ctx.fill();
        }
        ctx.stroke();
      }
      break;
    }

    case 'polygon': {
      const polyPts = sh.points as Point[];
      if (polyPts.length >= 3) {
        ctx.beginPath();
        ctx.moveTo(polyPts[0].x, polyPts[0].y);
        for (let i = 1; i < polyPts.length; i++) {
          ctx.lineTo(polyPts[i].x, polyPts[i].y);
        }
        ctx.closePath();
        if (shape.fillColor && shape.fillColor !== 'transparent') {
          ctx.fill();
        }
        ctx.stroke();
      }
      break;
    }

    case 'draw': {
      const drawPts = sh.points as Point[];
      if (drawPts.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(drawPts[0].x, drawPts[0].y);
        for (let i = 1; i < drawPts.length; i++) {
          // Use quadratic curves for smoother lines
          if (i < drawPts.length - 1) {
            const midX = (drawPts[i].x + drawPts[i + 1].x) / 2;
            const midY = (drawPts[i].y + drawPts[i + 1].y) / 2;
            ctx.quadraticCurveTo(drawPts[i].x, drawPts[i].y, midX, midY);
          } else {
            ctx.lineTo(drawPts[i].x, drawPts[i].y);
          }
        }
        ctx.stroke();
      }
      break;
    }

    case 'text': {
      ctx.save();
      ctx.fillStyle = shape.strokeColor;
      ctx.font = `${sh.fontWeight} ${sh.fontSize as number}px ${sh.fontFamily as string}`;
      ctx.textAlign = (sh.textAlign as CanvasTextAlign) || 'left';
      ctx.textBaseline = 'top';
      ctx.fillText((sh.text as string) || '', sh.x as number, sh.y as number);
      ctx.restore();
      break;
    }
  }

  ctx.restore();
}

// Draw arrowheads for dimension lines
function drawArrowheads(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number
): void {
  const arrowSize = 8;
  const ang = Math.atan2(y2 - y1, x2 - x1);

  ctx.save();
  ctx.fillStyle = ctx.strokeStyle;

  // Arrow at start
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(
    x1 + arrowSize * Math.cos(ang + Math.PI / 6),
    y1 + arrowSize * Math.sin(ang + Math.PI / 6)
  );
  ctx.lineTo(
    x1 + arrowSize * Math.cos(ang - Math.PI / 6),
    y1 + arrowSize * Math.sin(ang - Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();

  // Arrow at end
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - arrowSize * Math.cos(ang + Math.PI / 6),
    y2 - arrowSize * Math.sin(ang + Math.PI / 6)
  );
  ctx.lineTo(
    x2 - arrowSize * Math.cos(ang - Math.PI / 6),
    y2 - arrowSize * Math.sin(ang - Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// Draw snap indicator
function drawSnapIndicator(ctx: CanvasRenderingContext2D, point: Point): void {
  ctx.save();
  ctx.strokeStyle = '#4a6fa5';
  ctx.fillStyle = 'rgba(74, 111, 165, 0.3)';
  ctx.lineWidth = 1.5;

  // Draw crosshair
  const size = 10;
  ctx.beginPath();
  ctx.moveTo(point.x - size, point.y);
  ctx.lineTo(point.x + size, point.y);
  ctx.moveTo(point.x, point.y - size);
  ctx.lineTo(point.x, point.y + size);
  ctx.stroke();

  // Draw circle
  ctx.beginPath();
  ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// Draw selection handles around a shape
function drawSelectionHandles(ctx: CanvasRenderingContext2D, shape: Shape): void {
  const bbox = getBoundingBox(shape);
  if (!bbox) return;

  const padding = 4;
  const handleSize = 6;

  ctx.save();

  // Draw bounding box
  ctx.strokeStyle = '#4a6fa5';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(
    bbox.minX - padding,
    bbox.minY - padding,
    bbox.maxX - bbox.minX + padding * 2,
    bbox.maxY - bbox.minY + padding * 2
  );
  ctx.setLineDash([]);

  // Draw handles
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#4a6fa5';
  ctx.lineWidth = 1.5;

  const handles = [
    { x: bbox.minX - padding, y: bbox.minY - padding },
    { x: (bbox.minX + bbox.maxX) / 2, y: bbox.minY - padding },
    { x: bbox.maxX + padding, y: bbox.minY - padding },
    { x: bbox.maxX + padding, y: (bbox.minY + bbox.maxY) / 2 },
    { x: bbox.maxX + padding, y: bbox.maxY + padding },
    { x: (bbox.minX + bbox.maxX) / 2, y: bbox.maxY + padding },
    { x: bbox.minX - padding, y: bbox.maxY + padding },
    { x: bbox.minX - padding, y: (bbox.minY + bbox.maxY) / 2 },
  ];

  for (const h of handles) {
    ctx.beginPath();
    ctx.rect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}
