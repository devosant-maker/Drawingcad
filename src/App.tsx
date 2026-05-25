import { useCallback, useState } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { Canvas } from '@/component/Canvas';
import { TopBar } from '@/component/TopBar';
import { BottomBar } from '@/component/BottomBar';
import { Sidebar } from '@/component/Sidebar';
import { PropertiesPanel } from '@/component/PropertiesPanel';
import { LayersPanel } from '@/component/LayersPanel';
import { TextInputModal } from '@/component/TextInputModal';
import { ToolDrawer } from '@/component/ToolDrawer';
import { generateId, duplicateShape } from '@/engine/canvas';
import type { Shape, ToolType } from '@/types';

function App() {
  const {
    state,
    setTool,
    addShape,
    updateShape,
    deleteSelected,
    selectShape,
    clearSelection,
    undo,
    redo,
    setViewport,
    toggleGrid,
    toggleSidebar,
    toggleProperties,
    toggleLayers,
    toggleSnap,
    setShapes,
    selectedShapes,
  } = useAppState();

  const [showTextModal, setShowTextModal] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [showToolGuide, setShowToolGuide] = useState(false);

  // Handle new file
  const handleNewFile = useCallback(() => {
    if (window.confirm('Start a new drawing? Unsaved changes will be lost.')) {
      setShapes([]);
      setViewport({ scale: 1, offsetX: 0, offsetY: 0 });
    }
  }, [setShapes, setViewport]);

  // Handle export
  const handleExport = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const ctx = tempCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        ctx.drawImage(canvas, 0, 0);
        const dataUrl = tempCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'orion-sketch.png';
        link.href = dataUrl;
        link.click();
      }
    }
  }, []);

  // Handle zoom in
  const handleZoomIn = useCallback(() => {
    const newScale = Math.min(10, state.viewport.scale * 1.2);
    setViewport({ scale: newScale });
  }, [state.viewport.scale, setViewport]);

  // Handle zoom out
  const handleZoomOut = useCallback(() => {
    const newScale = Math.max(0.1, state.viewport.scale / 1.2);
    setViewport({ scale: newScale });
  }, [state.viewport.scale, setViewport]);

  // Handle reset view
  const handleResetView = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      setViewport({
        scale: 1,
        offsetX: rect.width / 2 - 400,
        offsetY: rect.height / 2 - 300,
      });
    }
  }, [setViewport]);

  // Handle tool change
  const handleToolChange = useCallback((tool: ToolType) => {
    if (tool === 'text') {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const centerX = (rect.width / 2 - state.viewport.offsetX) / state.viewport.scale;
        const centerY = (rect.height / 2 - state.viewport.offsetY) / state.viewport.scale;
        setTextPosition({ x: centerX, y: centerY });
      }
      setShowTextModal(true);
    } else {
      setTool(tool);
      setShowToolGuide(true);
      setTimeout(() => setShowToolGuide(false), 4000);
    }
  }, [setTool, state.viewport]);

  // Handle text submit
  const handleTextSubmit = useCallback((text: string, fontSize: number) => {
    const textShape: Shape = {
      id: generateId(),
      type: 'text',
      x: textPosition.x,
      y: textPosition.y,
      text,
      fontSize,
      fontFamily: 'system-ui, sans-serif',
      fontWeight: 'normal',
      textAlign: 'left',
      strokeColor: '#212529',
      fillColor: 'transparent',
      strokeWidth: 1,
      opacity: 1,
      layer: 0,
      selected: false,
    };
    addShape(textShape);
  }, [textPosition, addShape]);

  // Handle duplicate selected
  const handleDuplicateSelected = useCallback(() => {
    const selected = state.shapes.filter(s => s.selected);
    if (selected.length > 0) {
      const newShapes = [...state.shapes];
      for (const shape of selected) {
        newShapes.push(duplicateShape(shape));
      }
      setShapes(newShapes);
    }
  }, [state.shapes, setShapes]);

  // Layer management - simplified
  const handleSetActiveLayer = useCallback((_id: string) => {
    // Will be implemented with full layer management
  }, []);

  const handleToggleLayerVisibility = useCallback((_id: string) => {
    // Will be implemented with full layer management
  }, []);

  const handleToggleLayerLock = useCallback((_id: string) => {
    // Will be implemented with full layer management
  }, []);

  const handleAddLayer = useCallback(() => {
    // Will be implemented with full layer management
  }, []);

  const handleDeleteLayer = useCallback((_id: string) => {
    // Will be implemented with full layer management
  }, []);

  const handleMoveLayerUp = useCallback((_id: string) => {
    // Will be implemented with full layer management
  }, []);

  const handleMoveLayerDown = useCallback((_id: string) => {
    // Will be implemented with full layer management
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-white overflow-hidden">
      {/* Top Bar */}
      <TopBar
        onToggleSidebar={toggleSidebar}
        onUndo={undo}
        onRedo={redo}
        onToggleGrid={toggleGrid}
        onToggleSnap={toggleSnap}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        onExport={handleExport}
        canUndo={state.historyIndex > 0}
        canRedo={state.historyIndex < state.history.length - 1}
        showGrid={state.showGrid}
        snapEnabled={state.snap.enabled}
        viewport={state.viewport}
      />

      {/* Main Content - Canvas */}
      <div className="flex-1 relative h-full min-h-0">
        <Canvas
          shapes={state.shapes}
          viewport={state.viewport}
          snap={state.snap}
          tool={state.tool}
          showGrid={state.showGrid}
          onAddShape={addShape}
          onSelectShape={selectShape}
          onClearSelection={clearSelection}
          onSetViewport={setViewport}
          onSetShapes={setShapes}
        />
      </div>

      {/* Bottom Bar */}
      <BottomBar
        activeTool={state.tool}
        onToolChange={handleToolChange}
        onToggleLayers={toggleLayers}
        onToggleProperties={toggleProperties}
        selectedCount={state.selectedShapeIds.length}
        onDeleteSelected={deleteSelected}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={state.showSidebar}
        onClose={toggleSidebar}
        onNewFile={handleNewFile}
        onExport={handleExport}
      />

      {/* Properties Panel */}
      <PropertiesPanel
        isOpen={state.showProperties}
        onClose={toggleProperties}
        selectedShapes={selectedShapes}
        onUpdateShape={updateShape}
        onDeleteSelected={deleteSelected}
        onDuplicateSelected={handleDuplicateSelected}
      />

      {/* Layers Panel */}
      <LayersPanel
        isOpen={state.showLayers}
        onClose={toggleLayers}
        layers={state.layers}
        activeLayer={state.activeLayer}
        onSetActiveLayer={handleSetActiveLayer}
        onToggleLayerVisibility={handleToggleLayerVisibility}
        onToggleLayerLock={handleToggleLayerLock}
        onAddLayer={handleAddLayer}
        onDeleteLayer={handleDeleteLayer}
        onMoveLayerUp={handleMoveLayerUp}
        onMoveLayerDown={handleMoveLayerDown}
      />

      {/* Text Input Modal */}
      <TextInputModal
        isOpen={showTextModal}
        onClose={() => setShowTextModal(false)}
        onSubmit={handleTextSubmit}
      />

      {/* Tool Guide Drawer */}
      <ToolDrawer
        isOpen={showToolGuide}
        onClose={() => setShowToolGuide(false)}
        currentTool={state.tool}
      />
    </div>
  );
}

export default App;
