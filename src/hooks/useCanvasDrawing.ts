import { useRef, useCallback, useState } from 'react';
import type { Point, Shape, ToolType, ViewportState, SnapState } from '@/types';
import {
  generateId,
  screenToWorld,
  snapPoint,
  smoothPoints,
  distance,
  angle,
  createRegularPolygon,
  hitTest,
} from '@/engine/canvas';

interface UseCanvasDrawingProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  tool: ToolType;
  viewport: ViewportState;
  snap: SnapState;
  shapes: Shape[];
  onAddShape: (shape: Shape) => void;
  onSelectShape: (id: string, multi?: boolean) => void;
  onClearSelection: () => void;
  onSetViewport: (viewport: Partial<ViewportState>) => void;
  onSetShapes: (shapes: Shape[]) => void;
}

// Helper to access shape properties dynamically
function ss(shape: Shape): Record<string, unknown> {
  return shape as unknown as Record<string, unknown>;
}

export function useCanvasDrawing({
  canvasRef,
  tool,
  viewport,
  snap,
  shapes,
  onAddShape,
  onSelectShape,
  onClearSelection,
  onSetViewport,
  onSetShapes,
}: UseCanvasDrawingProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [tempShape, setTempShape] = useState<Shape | null>(null);
  const [snapIndicator, setSnapIndicator] = useState<Point | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  const drawPointsRef = useRef<Point[]>([]);
  const startPointRef = useRef<Point | null>(null);
  const lastPanPointRef = useRef<Point | null>(null);
  const moveStartPointRef = useRef<Point | null>(null);
  const initialShapePositionsRef = useRef<Map<string, Point[]>>(new Map());
  const pinchStartRef = useRef<{ dist: number; scale: number } | null>(null);

  // Get pointer position relative to canvas
  const getPointerPos = useCallback(
    (e: React.PointerEvent | PointerEvent): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    [canvasRef]
  );

  // Get world position from screen position
  const getWorldPos = useCallback(
    (screenPos: Point): Point => {
      return screenToWorld(screenPos.x, screenPos.y, viewport);
    },
    [viewport]
  );

  // Handle pointer down
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.setPointerCapture(e.pointerId);

      const screenPos = getPointerPos(e);
      const worldPos = getWorldPos(screenPos);

      // Handle two-finger pinch for zoom
      if (e.pointerType === 'touch') {
        const activeTouches = (e.nativeEvent as any).touches || [];
        if (activeTouches.length >= 2) {
          const touch1 = activeTouches[0];
          const touch2 = activeTouches[1];
          const dist = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
          );
          pinchStartRef.current = { dist, scale: viewport.scale };
          return;
        }
      }

      // Pan tool or middle mouse
      if (tool === 'pan' || e.button === 1) {
        setIsPanning(true);
        lastPanPointRef.current = screenPos;
        return;
      }

      // Select tool
      if (tool === 'select') {
        // Check if clicking on a selected shape to move it
        const clickedShape = shapes.find(s => hitTest(worldPos, s, 8 / viewport.scale));

        if (clickedShape) {
          // If shape not selected, select it first
          if (!clickedShape.selected) {
            onSelectShape(clickedShape.id, e.shiftKey);
          }

          // Start moving selected shapes
          setIsMoving(true);
          moveStartPointRef.current = worldPos;

          // Store initial positions of all selected shapes
          const selected = shapes.filter(s => s.selected);
          initialShapePositionsRef.current = new Map();
          for (const shape of selected) {
            const pts = getShapePointsForMove(shape);
            initialShapePositionsRef.current.set(shape.id, JSON.parse(JSON.stringify(pts)));
          }
          return;
        } else {
          // Clicked on empty space
          if (!e.shiftKey) {
            onClearSelection();
          }
          // Start panning with drag on empty space
          setIsPanning(true);
          lastPanPointRef.current = screenPos;
          return;
        }
      }

      // Drawing tools
      if (tool === 'draw' || tool === 'line' || tool === 'rectangle' ||
          tool === 'circle' || tool === 'triangle' || tool === 'polygon' ||
          tool === 'dimension') {
        setIsDrawing(true);

        let startPos = worldPos;

        // Apply snap if enabled
        if (snap.enabled) {
          const snapped = snapPoint(worldPos, snap, shapes);
          startPos = snapped.point;
          setSnapIndicator(snapped.snapIndicator);
        }

        startPointRef.current = startPos;

        if (tool === 'draw') {
          drawPointsRef.current = [startPos];
          const newShape: Shape = {
            id: generateId(),
            type: 'draw',
            x: startPos.x,
            y: startPos.y,
            points: [startPos],
            strokeColor: '#212529',
            fillColor: 'transparent',
            strokeWidth: 2,
            opacity: 1,
            layer: 0,
            selected: false,
          } as unknown as Shape;
          setTempShape(newShape);
        }
      }
    },
    [canvasRef, tool, viewport, snap, shapes, getPointerPos, getWorldPos, onSelectShape, onClearSelection]
  );

  // Handle pointer move
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;

      const screenPos = getPointerPos(e);
      const worldPos = getWorldPos(screenPos);

      // Handle pinch zoom
      if (pinchStartRef.current && e.pointerType === 'touch') {
        const activeTouches = (e.nativeEvent as any).touches || [];
        if (activeTouches.length >= 2) {
          const touch1 = activeTouches[0];
          const touch2 = activeTouches[1];
          const dist = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
          );
          const ratio = dist / pinchStartRef.current.dist;
          const newScale = Math.max(0.1, Math.min(10, pinchStartRef.current.scale * ratio));
          onSetViewport({ scale: newScale });
          return;
        }
      }

      // Panning
      if (isPanning && lastPanPointRef.current) {
        const dx = screenPos.x - lastPanPointRef.current.x;
        const dy = screenPos.y - lastPanPointRef.current.y;
        onSetViewport({
          offsetX: viewport.offsetX + dx,
          offsetY: viewport.offsetY + dy,
        });
        lastPanPointRef.current = screenPos;
        return;
      }

      // Moving shapes
      if (isMoving && moveStartPointRef.current) {
        const dx = worldPos.x - moveStartPointRef.current.x;
        const dy = worldPos.y - moveStartPointRef.current.y;

        const newShapes = shapes.map(s => {
          if (!s.selected) return s;
          return moveShapeBy(s, dx, dy, initialShapePositionsRef.current.get(s.id));
        });

        onSetShapes(newShapes);
        return;
      }

      // Drawing
      if (isDrawing && startPointRef.current) {
        let currentPos = worldPos;

        // Apply snap
        if (snap.enabled) {
          const snapped = snapPoint(worldPos, snap, shapes);
          currentPos = snapped.point;
          setSnapIndicator(snapped.snapIndicator);
        }

        const startPos = startPointRef.current;
        const newTempShape = createTempShape(tool, startPos, currentPos);
        setTempShape(newTempShape);

        // For draw tool, accumulate points
        if (tool === 'draw') {
          drawPointsRef.current.push(currentPos);
          if (drawPointsRef.current.length > 2) {
            const smoothed = smoothPoints(drawPointsRef.current);
            setTempShape(prev => {
              if (prev && prev.type === 'draw') {
                return { ...prev, points: smoothed } as unknown as Shape;
              }
              return prev;
            });
          }
        }
      }
    },
    [canvasRef, isPanning, isMoving, isDrawing, tool, viewport, snap, shapes, getPointerPos, getWorldPos, onSetViewport, onSetShapes]
  );

  // Handle pointer up
  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Release pinch
      pinchStartRef.current = null;

      // Stop panning
      if (isPanning) {
        setIsPanning(false);
        lastPanPointRef.current = null;
        return;
      }

      // Stop moving
      if (isMoving) {
        setIsMoving(false);
        moveStartPointRef.current = null;
        initialShapePositionsRef.current = new Map();
        return;
      }

      // Finish drawing
      if (isDrawing && tempShape && startPointRef.current) {
        // Don't add if shape is too small
        const bbox = getTempShapeBounds(tempShape);
        if (bbox && (Math.abs(bbox.width) > 2 || Math.abs(bbox.height) > 2 || tempShape.type === 'draw')) {
          // Finalize the shape
          const finalShape = JSON.parse(JSON.stringify(tempShape)) as Shape;
          const fs = ss(finalShape);
          fs.selected = false;
          fs.id = generateId();

          // For draw shape, smooth the final points
          if (finalShape.type === 'draw') {
            const pts = fs.points as Point[];
            if (pts.length > 3) {
              fs.points = smoothPoints(pts, 4);
            }
          }

          onAddShape(finalShape);
        }

        setIsDrawing(false);
        setTempShape(null);
        setSnapIndicator(null);
        startPointRef.current = null;
        drawPointsRef.current = [];
        return;
      }

      // For eraser tool - tap to delete
      if (tool === 'eraser') {
        const screenPos = getPointerPos(e);
        const worldPos = getWorldPos(screenPos);
        const tolerance = 15 / viewport.scale;
        const shapeToDelete = shapes.find(s => hitTest(worldPos, s, tolerance));
        if (shapeToDelete) {
          const newShapes = shapes.filter(s => s.id !== shapeToDelete.id);
          onSetShapes(newShapes);
        }
      }
    },
    [canvasRef, isPanning, isMoving, isDrawing, tool, tempShape, viewport, shapes, getPointerPos, getWorldPos, onAddShape, onSetShapes]
  );

  // Handle touch events for pinch zoom
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[1].clientX - e.touches[0].clientX,
          e.touches[1].clientY - e.touches[0].clientY
        );
        pinchStartRef.current = { dist, scale: viewport.scale };
      }
    },
    [viewport.scale]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      if (e.touches.length === 2 && pinchStartRef.current) {
        const dist = Math.hypot(
          e.touches[1].clientX - e.touches[0].clientX,
          e.touches[1].clientY - e.touches[0].clientY
        );
        const ratio = dist / pinchStartRef.current.dist;
        const newScale = Math.max(0.1, Math.min(10, pinchStartRef.current.scale * ratio));

        // Zoom toward center of pinch
        const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const canvasCenterX = centerX - rect.left;
          const canvasCenterY = centerY - rect.top;

          const worldBefore = screenToWorld(canvasCenterX, canvasCenterY, viewport);
          const newViewport = { ...viewport, scale: newScale };
          const worldAfter = screenToWorld(canvasCenterX, canvasCenterY, newViewport);

          onSetViewport({
            offsetX: viewport.offsetX - (worldAfter.x - worldBefore.x) * newScale,
            offsetY: viewport.offsetY - (worldAfter.y - worldBefore.y) * newScale,
          });
        } else {
          onSetViewport({ scale: newScale });
        }
      }
    },
    [canvasRef, viewport, onSetViewport]
  );

  const handleTouchEnd = useCallback(() => {
    pinchStartRef.current = null;
  }, []);

  // Handle wheel for zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.1, Math.min(10, viewport.scale * zoomFactor));

      // Zoom toward mouse position
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const worldBefore = screenToWorld(mouseX, mouseY, viewport);
        const newViewport = { ...viewport, scale: newScale };
        const worldAfter = screenToWorld(mouseX, mouseY, newViewport);

        onSetViewport({
          scale: newScale,
          offsetX: viewport.offsetX - (worldAfter.x - worldBefore.x) * newScale,
          offsetY: viewport.offsetY - (worldAfter.y - worldBefore.y) * newScale,
        });
      }
    },
    [canvasRef, viewport, onSetViewport]
  );

  return {
    isDrawing,
    tempShape,
    snapIndicator,
    isPanning,
    isMoving,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleWheel,
  };
}

// Helper function to get shape points for moving
function getShapePointsForMove(shape: Shape): Point[] {
  const sh = ss(shape);
  switch (shape.type) {
    case 'line':
    case 'dimension':
      return [
        { x: sh.x as number, y: sh.y as number },
        { x: sh.x2 as number, y: sh.y2 as number },
      ];
    case 'rectangle':
      return [{ x: sh.x as number, y: sh.y as number }];
    case 'circle':
      return [{ x: sh.x as number, y: sh.y as number }];
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

// Helper function to move a shape by delta
function moveShapeBy(shape: Shape, dx: number, dy: number, initialPoints?: Point[]): Shape {
  const newShape = JSON.parse(JSON.stringify(shape)) as Shape;
  const ns = ss(newShape);

  switch (shape.type) {
    case 'line':
    case 'dimension': {
      if (initialPoints && initialPoints.length >= 2) {
        ns.x = initialPoints[0].x + dx;
        ns.y = initialPoints[0].y + dy;
        ns.x2 = initialPoints[1].x + dx;
        ns.y2 = initialPoints[1].y + dy;
      } else {
        (ns.x as number) += dx;
        (ns.y as number) += dy;
        (ns.x2 as number) += dx;
        (ns.y2 as number) += dy;
      }
      break;
    }
    case 'rectangle':
    case 'circle':
    case 'text': {
      if (initialPoints && initialPoints.length >= 1) {
        ns.x = initialPoints[0].x + dx;
        ns.y = initialPoints[0].y + dy;
      } else {
        (ns.x as number) += dx;
        (ns.y as number) += dy;
      }
      break;
    }
    case 'triangle':
    case 'polygon':
    case 'draw': {
      if (initialPoints) {
        ns.points = initialPoints.map((p: Point) => ({
          x: p.x + dx,
          y: p.y + dy,
        }));
      }
      break;
    }
    default: {
      (ns.x as number) += dx;
      (ns.y as number) += dy;
    }
  }

  return newShape;
}

// Create temporary shape while drawing
function createTempShape(tool: ToolType, start: Point, current: Point): Shape | null {
  const base: Record<string, unknown> = {
    id: 'temp',
    strokeColor: '#212529',
    fillColor: 'transparent',
    strokeWidth: 2,
    opacity: 1,
    layer: 0,
    selected: false,
    x: start.x,
    y: start.y,
  };

  switch (tool) {
    case 'line':
      return {
        ...base,
        type: 'line',
        x2: current.x,
        y2: current.y,
      } as unknown as Shape;

    case 'rectangle': {
      const width = current.x - start.x;
      const height = current.y - start.y;
      return {
        ...base,
        type: 'rectangle',
        x: width >= 0 ? start.x : current.x,
        y: height >= 0 ? start.y : current.y,
        width: Math.abs(width),
        height: Math.abs(height),
        rx: 0,
        ry: 0,
      } as unknown as Shape;
    }

    case 'circle': {
      const radius = distance(start, current);
      return {
        ...base,
        type: 'circle',
        x: start.x,
        y: start.y,
        radius,
      } as unknown as Shape;
    }

    case 'triangle': {
      const pts = createTrianglePoints(start, current);
      return {
        ...base,
        type: 'triangle',
        x: start.x,
        y: start.y,
        points: pts,
      } as unknown as Shape;
    }

    case 'polygon': {
      const dist = distance(start, current);
      const pts = createRegularPolygon(start.x, start.y, dist, 6);
      return {
        ...base,
        type: 'polygon',
        x: start.x,
        y: start.y,
        points: pts,
        sides: 6,
      } as unknown as Shape;
    }

    case 'dimension':
      return {
        ...base,
        type: 'dimension',
        x: start.x,
        y: start.y,
        x2: current.x,
        y2: current.y,
        length: distance(start, current),
        angle: angle(start, current),
      } as unknown as Shape;

    case 'draw':
      return {
        ...base,
        type: 'draw',
        x: start.x,
        y: start.y,
        points: [start, current],
      } as unknown as Shape;

    default:
      return null;
  }
}

// Create triangle points
function createTrianglePoints(start: Point, current: Point): Point[] {
  const dx = current.x - start.x;
  return [
    { x: start.x + dx / 2, y: start.y },
    { x: start.x, y: current.y },
    { x: current.x, y: current.y },
  ];
}

// Get bounds of temp shape
function getTempShapeBounds(shape: Shape | null): { width: number; height: number } | null {
  if (!shape) return null;
  const sh = ss(shape);

  switch (shape.type) {
    case 'line':
    case 'dimension': {
      return { width: (sh.x2 as number) - (sh.x as number), height: (sh.y2 as number) - (sh.y as number) };
    }
    case 'rectangle':
      return { width: sh.width as number, height: sh.height as number };
    case 'circle':
      return { width: (sh.radius as number) * 2, height: (sh.radius as number) * 2 };
    case 'draw': {
      const pts = sh.points as Point[];
      if (pts.length < 2) return { width: 0, height: 0 };
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const p of pts) {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
      }
      return { width: maxX - minX, height: maxY - minY };
    }
    default:
      return { width: 10, height: 10 };
  }
}
