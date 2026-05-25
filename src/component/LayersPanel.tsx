import { X, Eye, EyeOff, Lock, Unlock, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import type { Layer } from '@/types';

interface LayersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  layers: Layer[];
  activeLayer: string;
  onSetActiveLayer: (id: string) => void;
  onToggleLayerVisibility: (id: string) => void;
  onToggleLayerLock: (id: string) => void;
  onAddLayer: () => void;
  onDeleteLayer: (id: string) => void;
  onMoveLayerUp: (id: string) => void;
  onMoveLayerDown: (id: string) => void;
}

export function LayersPanel({
  isOpen,
  onClose,
  layers,
  activeLayer,
  onSetActiveLayer,
  onToggleLayerVisibility,
  onToggleLayerLock,
  onAddLayer,
  onDeleteLayer,
  onMoveLayerUp,
  onMoveLayerDown,
}: LayersPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 z-50" onClick={onClose} />

      {/* Bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl z-50 max-h-[60vh] flex flex-col"
        style={{ animation: 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Layers</h3>
          <div className="flex items-center gap-1">
            <button
              onClick={onAddLayer}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              title="Add Layer"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Layer list */}
        <div className="flex-1 overflow-y-auto py-2">
          {layers.map((layer, index) => (
            <div
              key={layer.id}
              onClick={() => onSetActiveLayer(layer.id)}
              className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer transition-colors ${
                activeLayer === layer.id ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              {/* Color indicator */}
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: layer.color }}
              />

              {/* Layer name */}
              <span className={`flex-1 text-sm truncate ${
                activeLayer === layer.id ? 'font-medium text-blue-700' : 'text-gray-700'
              }`}>
                {layer.name}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLayerVisibility(layer.id);
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-200 transition-colors"
                >
                  {layer.visible ? (
                    <Eye className="w-3.5 h-3.5 text-gray-500" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLayerLock(layer.id);
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-200 transition-colors"
                >
                  {layer.locked ? (
                    <Lock className="w-3.5 h-3.5 text-gray-500" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveLayerUp(layer.id);
                  }}
                  disabled={index === 0}
                  className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-200 transition-colors disabled:opacity-30"
                >
                  <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveLayerDown(layer.id);
                  }}
                  disabled={index === layers.length - 1}
                  className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-200 transition-colors disabled:opacity-30"
                >
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>
                {layers.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteLayer(layer.id);
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                )}
              </div>
            </div>
          ))}
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
