import {
  MousePointer2,
  Pencil,
  Minus,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Type,
  Eraser,
  Ruler,
  Hand,
  Layers,
  Settings,
  Palette,
} from 'lucide-react';
import type { ToolType } from '@/types';

interface BottomBarProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  onToggleLayers: () => void;
  onToggleProperties: () => void;
  selectedCount: number;
  onDeleteSelected: () => void;
}

const tools: { type: ToolType; icon: React.ElementType; label: string }[] = [
  { type: 'select', icon: MousePointer2, label: 'Select' },
  { type: 'draw', icon: Pencil, label: 'Draw' },
  { type: 'line', icon: Minus, label: 'Line' },
  { type: 'rectangle', icon: Square, label: 'Rect' },
  { type: 'circle', icon: Circle, label: 'Circle' },
  { type: 'triangle', icon: Triangle, label: 'Triangle' },
  { type: 'polygon', icon: Hexagon, label: 'Polygon' },
  { type: 'text', icon: Type, label: 'Text' },
  { type: 'eraser', icon: Eraser, label: 'Eraser' },
  { type: 'dimension', icon: Ruler, label: 'Dim' },
  { type: 'pan', icon: Hand, label: 'Pan' },
];

export function BottomBar({
  activeTool,
  onToolChange,
  onToggleLayers,
  onToggleProperties,
  selectedCount,
  onDeleteSelected,
}: BottomBarProps) {
  return (
    <div className="bg-white border-t border-gray-200 z-50">
      {/* Context toolbar - shown when shapes are selected */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-800 mx-3 mt-2 rounded-full">
          <span className="text-white text-xs font-medium mr-1">
            {selectedCount} selected
          </span>
          <div className="w-px h-4 bg-gray-600 mx-1" />
          <button
            onClick={onToggleProperties}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-700 transition-colors"
            aria-label="Properties"
          >
            <Palette className="w-3.5 h-3.5 text-white" />
          </button>
          <button
            onClick={onDeleteSelected}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-600 transition-colors"
            aria-label="Delete"
          >
            <Eraser className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      )}

      {/* Main tool bar */}
      <div className="flex items-center justify-center gap-1 px-2 py-2 overflow-x-auto scrollbar-hide">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.type;

          return (
            <button
              key={tool.type}
              onClick={() => onToolChange(tool.type)}
              className={`relative flex flex-col items-center justify-center min-w-[52px] h-14 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-[#4a6fa5] text-white shadow-md scale-105'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
              title={tool.label}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
              <span className={`text-[10px] mt-0.5 font-medium ${isActive ? 'text-white' : ''}`}>
                {tool.label}
              </span>
            </button>
          );
        })}

        <div className="w-px h-8 bg-gray-200 mx-1" />

        <button
          onClick={onToggleLayers}
          className="flex flex-col items-center justify-center min-w-[52px] h-14 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all"
          title="Layers"
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Layers</span>
        </button>

        <button
          onClick={onToggleProperties}
          className="flex flex-col items-center justify-center min-w-[52px] h-14 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all"
          title="Properties"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Props</span>
        </button>
      </div>
    </div>
  );
}
