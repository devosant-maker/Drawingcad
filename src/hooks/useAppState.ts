import { useState, useCallback } from 'react';
import type { AppState, ToolType, Shape, Layer } from '@/types';

const defaultLayers: Layer[] = [
  { id: 'layer_1', name: 'Layer 1', visible: true, locked: false, color: '#212529' },
];

const initialState: AppState = {
  tool: 'select',
  shapes: [],
  viewport: { scale: 1, offsetX: 0, offsetY: 0 },
  snap: {
    enabled: true,
    snapToGrid: true,
    snapToPoint: false,
    snapDistance: 10,
    gridSize: 20,
  },
  layers: defaultLayers,
  activeLayer: 'layer_1',
  selectedShapeIds: [],
  history: [[]],
  historyIndex: 0,
  showGrid: true,
  showSidebar: false,
  showProperties: false,
  showLayers: false,
  darkMode: false,
};

export function useAppState() {
  const [state, setState] = useState<AppState>(initialState);

  // Set tool
  const setTool = useCallback((tool: ToolType) => {
    setState(prev => ({
      ...prev,
      tool,
      selectedShapeIds: tool === 'select' ? prev.selectedShapeIds : [],
      shapes: prev.shapes.map(s => ({ ...s, selected: false })),
    }));
  }, []);

  // Add shape
  const addShape = useCallback((shape: Shape) => {
    setState(prev => {
      const newShapes: Shape[] = [...prev.shapes, shape];
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(newShapes);
      return {
        ...prev,
        shapes: newShapes,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  // Update shape
  const updateShape = useCallback((id: string, updates: Partial<Shape>) => {
    setState(prev => ({
      ...prev,
      shapes: prev.shapes.map(s => s.id === id ? { ...s, ...updates } as Shape : s),
    }));
  }, []);

  // Delete selected shapes
  const deleteSelected = useCallback(() => {
    setState(prev => {
      const newShapes = prev.shapes.filter(s => !s.selected);
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(newShapes);
      return {
        ...prev,
        shapes: newShapes,
        selectedShapeIds: [],
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  // Select shape
  const selectShape = useCallback((id: string, multi: boolean = false) => {
    setState(prev => {
      if (multi) {
        const isSelected = prev.selectedShapeIds.includes(id);
        const newSelected = isSelected
          ? prev.selectedShapeIds.filter(sid => sid !== id)
          : [...prev.selectedShapeIds, id];
        return {
          ...prev,
          selectedShapeIds: newSelected,
          shapes: prev.shapes.map(s => ({
            ...s,
            selected: newSelected.includes(s.id),
          })),
        };
      } else {
        return {
          ...prev,
          selectedShapeIds: [id],
          shapes: prev.shapes.map(s => ({
            ...s,
            selected: s.id === id,
          })),
        };
      }
    });
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedShapeIds: [],
      shapes: prev.shapes.map(s => ({ ...s, selected: false })),
    }));
  }, []);

  // Undo
  const undo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex <= 0) return prev;
      const newIndex = prev.historyIndex - 1;
      return {
        ...prev,
        shapes: prev.history[newIndex],
        historyIndex: newIndex,
        selectedShapeIds: [],
      };
    });
  }, []);

  // Redo
  const redo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex >= prev.history.length - 1) return prev;
      const newIndex = prev.historyIndex + 1;
      return {
        ...prev,
        shapes: prev.history[newIndex],
        historyIndex: newIndex,
        selectedShapeIds: [],
      };
    });
  }, []);

  // Update viewport
  const setViewport = useCallback((viewport: Partial<AppState['viewport']>) => {
    setState(prev => ({
      ...prev,
      viewport: { ...prev.viewport, ...viewport },
    }));
  }, []);

  // Toggle grid
  const toggleGrid = useCallback(() => {
    setState(prev => ({ ...prev, showGrid: !prev.showGrid }));
  }, []);

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setState(prev => ({ ...prev, showSidebar: !prev.showSidebar }));
  }, []);

  // Toggle properties
  const toggleProperties = useCallback(() => {
    setState(prev => ({ ...prev, showProperties: !prev.showProperties }));
  }, []);

  // Toggle layers
  const toggleLayers = useCallback(() => {
    setState(prev => ({ ...prev, showLayers: !prev.showLayers }));
  }, []);

  // Toggle snap
  const toggleSnap = useCallback(() => {
    setState(prev => ({
      ...prev,
      snap: { ...prev.snap, enabled: !prev.snap.enabled, snapToGrid: !prev.snap.snapToGrid },
    }));
  }, []);

  // Set all shapes at once (for history)
  const setShapes = useCallback((shapes: Shape[]) => {
    setState(prev => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(shapes);
      return {
        ...prev,
        shapes,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        selectedShapeIds: [],
      };
    });
  }, []);

  // Get selected shapes
  const selectedShapes = state.shapes.filter(s => s.selected);

  return {
    state,
    setState,
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
  };
}
