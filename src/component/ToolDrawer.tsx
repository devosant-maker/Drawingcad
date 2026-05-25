import { X } from 'lucide-react';
import type { ToolType } from '@/types';

interface ToolDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTool: ToolType;
}

const toolGuides: Record<string, { title: string; steps: string[] }> = {
  select: {
    title: 'Select Tool',
    steps: [
      'Tap on an object to select it',
      'Tap and drag to move selected objects',
      'Hold Shift and tap to multi-select',
      'Tap on empty space to deselect',
    ],
  },
  draw: {
    title: 'Freehand Draw',
    steps: [
      'Tap and drag to draw freehand lines',
      'Lines are automatically smoothed',
      'Use with Snap for precision',
    ],
  },
  line: {
    title: 'Line Tool',
    steps: [
      'Tap to set the starting point',
      'Drag to the end point',
      'Release to create the line',
      'Use Snap for precise angles',
    ],
  },
  rectangle: {
    title: 'Rectangle Tool',
    steps: [
      'Tap to set the corner point',
      'Drag to define size',
      'Release to create rectangle',
      'Hold for square (1:1 ratio)',
    ],
  },
  circle: {
    title: 'Circle Tool',
    steps: [
      'Tap to set the center point',
      'Drag outward to set radius',
      'Release to create circle',
    ],
  },
  triangle: {
    title: 'Triangle Tool',
    steps: [
      'Tap to set the top point',
      'Drag to define base width',
      'Release to create triangle',
    ],
  },
  polygon: {
    title: 'Polygon Tool',
    steps: [
      'Tap to set the center',
      'Drag to define size',
      'Creates a hexagon by default',
    ],
  },
  text: {
    title: 'Text Tool',
    steps: [
      'Tap where you want text',
      'Enter text in the dialog',
      'Adjust font size as needed',
    ],
  },
  eraser: {
    title: 'Eraser Tool',
    steps: [
      'Tap on an object to delete it',
      'Or select objects and tap Delete',
    ],
  },
  dimension: {
    title: 'Dimension Tool',
    steps: [
      'Tap to set start point',
      'Drag to end point',
      'Shows length with arrows',
    ],
  },
  pan: {
    title: 'Pan Tool',
    steps: [
      'Drag to move the canvas view',
      'Or use two fingers to pan',
      'Pinch to zoom in/out',
    ],
  },
};

export function ToolDrawer({ isOpen, onClose, currentTool }: ToolDrawerProps) {
  if (!isOpen) return null;

  const guide = toolGuides[currentTool] || { title: 'Tool', steps: [] };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div
        className="fixed bottom-16 left-4 right-4 bg-white rounded-2xl shadow-xl z-50 p-4"
        style={{ animation: 'slideUp 0.25s cubic-bezier(0.32, 0.72, 0, 1)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 text-sm">{guide.title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <ul className="space-y-1.5">
          {guide.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ul>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
