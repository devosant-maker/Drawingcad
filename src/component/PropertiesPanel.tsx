import { X, Trash2, Copy } from 'lucide-react';
import type { Shape } from '@/types';
import { useState } from 'react';

interface PropertiesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedShapes: Shape[];
  onUpdateShape: (id: string, updates: Partial<Shape>) => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
}

const COLORS = [
  '#212529', '#dc3545', '#fd7e14', '#ffc107', '#28a745',
  '#20c997', '#17a2b8', '#4a6fa5', '#6f42c1', '#e83e8c',
  '#ffffff', '#adb5bd',
];

const STROKE_WIDTHS = [1, 2, 3, 4, 5, 8, 12];

export function PropertiesPanel({
  isOpen,
  onClose,
  selectedShapes,
  onUpdateShape,
  onDeleteSelected,
  onDuplicateSelected,
}: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState<'style' | 'transform'>('style');

  if (!isOpen || selectedShapes.length === 0) return null;

  // Get common properties from selected shapes
  const firstShape = selectedShapes[0];
  const strokeColor = firstShape?.strokeColor || '#212529';
  const fillColor = firstShape?.fillColor || 'transparent';
  const strokeWidth = firstShape?.strokeWidth || 2;
  const opacity = firstShape?.opacity ?? 1;

  const updateAllSelected = (updates: Partial<Shape>) => {
    for (const shape of selectedShapes) {
      onUpdateShape(shape.id, updates);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 z-50" onClick={onClose} />

      {/* Bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl z-50 max-h-[70vh] flex flex-col"
        style={{ animation: 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">
            Properties ({selectedShapes.length})
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={onDuplicateSelected}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              title="Duplicate"
            >
              <Copy className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={onDeleteSelected}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 pb-2">
          <button
            onClick={() => setActiveTab('style')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'style' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Style
          </button>
          <button
            onClick={() => setActiveTab('transform')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'transform' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Transform
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {activeTab === 'style' && (
            <div className="space-y-5">
              {/* Stroke Color */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
                  Stroke Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => updateAllSelected({ strokeColor: color })}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${
                        strokeColor === color ? 'border-blue-500 scale-110' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input
                    type="color"
                    value={strokeColor === 'transparent' ? '#000000' : strokeColor}
                    onChange={(e) => updateAllSelected({ strokeColor: e.target.value })}
                    className="w-8 h-8 rounded-lg border-2 border-gray-200 cursor-pointer"
                  />
                </div>
              </div>

              {/* Fill Color */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
                  Fill Color
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => updateAllSelected({ fillColor: 'transparent' })}
                    className={`w-8 h-8 rounded-lg border-2 transition-all bg-gray-100 ${
                      fillColor === 'transparent' ? 'border-blue-500 scale-110' : 'border-gray-200'
                    }`}
                    title="No Fill"
                  >
                    <span className="text-xs text-gray-400">/</span>
                  </button>
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => updateAllSelected({ fillColor: color })}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${
                        fillColor === color ? 'border-blue-500 scale-110' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input
                    type="color"
                    value={fillColor === 'transparent' ? '#ffffff' : fillColor}
                    onChange={(e) => updateAllSelected({ fillColor: e.target.value })}
                    className="w-8 h-8 rounded-lg border-2 border-gray-200 cursor-pointer"
                  />
                </div>
              </div>

              {/* Stroke Width */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
                  Stroke Width
                </label>
                <div className="flex gap-2">
                  {STROKE_WIDTHS.map((w) => (
                    <button
                      key={w}
                      onClick={() => updateAllSelected({ strokeWidth: w })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        strokeWidth === w ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <div
                          className="bg-current rounded-full"
                          style={{ width: 12, height: w }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Opacity */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
                  Opacity: {Math.round(opacity * 100)}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(opacity * 100)}
                  onChange={(e) => updateAllSelected({ opacity: parseInt(e.target.value) / 100 })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'transform' && (
            <div className="space-y-4">
              {/* Position */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">X Position</label>
                  <input
                    type="number"
                    value={Math.round(firstShape?.x || 0)}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) updateAllSelected({ x: val });
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Y Position</label>
                  <input
                    type="number"
                    value={Math.round(firstShape?.y || 0)}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) updateAllSelected({ y: val });
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              {/* Size (for rectangle) */}
              {firstShape?.type === 'rectangle' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Width</label>
                    <input
                      type="number"
                      value={Math.round((firstShape as any).width || 0)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val > 0) onUpdateShape(firstShape.id, { width: val } as any);
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Height</label>
                    <input
                      type="number"
                      value={Math.round((firstShape as any).height || 0)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val > 0) onUpdateShape(firstShape.id, { height: val } as any);
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>
              )}

              {/* Radius (for circle) */}
              {firstShape?.type === 'circle' && (
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Radius</label>
                  <input
                    type="number"
                    value={Math.round((firstShape as any).radius || 0)}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val > 0) onUpdateShape(firstShape.id, { radius: val } as any);
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              )}

              {/* Text properties */}
              {firstShape?.type === 'text' && (
                <>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Text Content</label>
                    <textarea
                      value={(firstShape as any).text || ''}
                      onChange={(e) => onUpdateShape(firstShape.id, { text: e.target.value } as any)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Font Size</label>
                    <input
                      type="number"
                      value={(firstShape as any).fontSize || 16}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val > 0) onUpdateShape(firstShape.id, { fontSize: val } as any);
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
