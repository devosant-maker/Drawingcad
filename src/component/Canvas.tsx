import { useRef, useEffect, useCallback } from 'react';
import type { Shape, ViewportState, SnapState, ToolType } from '@/types';
import { renderCanvas } from '@/engine/renderer';
import { useCanvasDrawing } from '@/hooks/useCanvasDrawing';

interface CanvasProps {
  shapes: Shape[];
  viewport: ViewportState;
  snap: SnapState;
  tool: ToolType;
  showGrid: boolean;
  onAddShape: (shape: Shape) => void;
  onSelectShape: (id: string, multi?: boolean) => void;
  onClearSelection: () => void;
  onSetViewport: (viewport: Partial<ViewportState>) => void;
  onSetShapes: (shapes: Shape[]) => void;
}

export function Canvas({
  shapes,
  viewport,
  snap,
  tool,
  showGrid,
  onAddShape,
  onSelectShape,
  onClearSelection,
  onSetViewport,
  onSetShapes,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);

  const {
    tempShape,
    snapIndicator,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleWheel,
  } = useCanvasDrawing({
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
  });

  // Resize canvas to container
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Set actual canvas size (with DPR for sharp rendering)
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    // Set display size
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Scale context
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    return { width, height };
  }, []);

  // Render loop
  useEffect(() => {
    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Reset transform and clear
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const dpr = window.devicePixelRatio || 1;
      ctx.scale(dpr, dpr);

      // Render everything
      renderCanvas(
        ctx,
        width,
        height,
        shapes,
        viewport,
        showGrid,
        snap,
        snapIndicator,
        tempShape
      );

      animationRef.current = requestAnimationFrame(render);
    };

    resizeCanvas();
    animationRef.current = requestAnimationFrame(render);

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [shapes, viewport, showGrid, snap, snapIndicator, tempShape, resizeCanvas]);

  // Center canvas initially
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    onSetViewport({
      offsetX: rect.width / 2 - 400,
      offsetY: rect.height / 2 - 300,
    });
  }, [onSetViewport]);

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden"
      style={{ touchAction: 'none', userSelect: 'none' }}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-crosshair"
        style={{ touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      />

      {/* Zoom indicator */}
      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm border border-gray-200">
        {Math.round(viewport.scale * 100)}%
      </div>

      {/* Snap indicator */}
      {snap.enabled && (
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm border border-gray-200 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          Snap On
        </div>
      )}
    </div>
  );
}
