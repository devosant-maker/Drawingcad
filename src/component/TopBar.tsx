import {
  Menu,
  Undo2,
  Redo2,
  Share2,
  Grid3x3,
  Magnet,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import type { ViewportState } from '@/types';
import { useState } from 'react';

interface TopBarProps {
  onToggleSidebar: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onToggleGrid: () => void;
  onToggleSnap: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onExport: () => void;
  canUndo: boolean;
  canRedo: boolean;
  showGrid: boolean;
  snapEnabled: boolean;
  viewport: ViewportState;
}

export function TopBar({
  onToggleSidebar,
  onUndo,
  onRedo,
  onToggleGrid,
  onToggleSnap,
  onZoomIn,
  onZoomOut,
  onResetView,
  onExport,
  canUndo,
  canRedo,
  showGrid,
  snapEnabled,
}: TopBarProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-3 z-50 relative shadow-sm">
      {/* Left section */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>

        <div className="flex items-center gap-2 ml-1">
          <img
            src="/images/logo.png"
            alt="Orion Sketch"
            className="w-7 h-7 rounded-md"
          />
          <span className="font-semibold text-sm text-gray-800 hidden sm:block">
            Orion Sketch
          </span>
        </div>
      </div>

      {/* Center section - Tools */}
      <div className="flex items-center gap-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Undo"
        >
          <Undo2 className="w-4.5 h-4.5 text-gray-600" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Redo"
        >
          <Redo2 className="w-4.5 h-4.5 text-gray-600" />
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <button
          onClick={onToggleGrid}
          className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
            showGrid ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
          }`}
          aria-label="Toggle Grid"
        >
          <Grid3x3 className="w-4.5 h-4.5" />
        </button>
        <button
          onClick={onToggleSnap}
          className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
            snapEnabled ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
          }`}
          aria-label="Toggle Snap"
        >
          <Magnet className="w-4.5 h-4.5" />
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <button
          onClick={onZoomOut}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Zoom Out"
        >
          <ZoomOut className="w-4.5 h-4.5 text-gray-600" />
        </button>
        <button
          onClick={onZoomIn}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Zoom In"
        >
          <ZoomIn className="w-4.5 h-4.5 text-gray-600" />
        </button>
        <button
          onClick={onResetView}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Reset View"
        >
          <RotateCcw className="w-4.5 h-4.5 text-gray-600" />
        </button>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1 relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Share"
        >
          <Share2 className="w-4.5 h-4.5 text-gray-600" />
        </button>

        {/* Share/Export dropdown */}
        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
              <button
                onClick={() => {
                  onExport();
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Export as PNG
              </button>
              <button
                onClick={() => {
                  onExport();
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Export as JPG
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={() => setShowMenu(false)}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Share Link
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
