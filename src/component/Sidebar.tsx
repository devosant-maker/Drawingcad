import { X, FilePlus, FolderOpen, Save, Download, Settings, HelpCircle, Info } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewFile: () => void;
  onExport: () => void;
}

export function Sidebar({ isOpen, onClose, onNewFile, onExport }: SidebarProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sidebar drawer */}
      <div className="fixed left-0 top-0 bottom-0 w-[280px] bg-white z-50 shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo.png"
              alt="Orion Sketch"
              className="w-8 h-8 rounded-lg"
            />
            <div>
              <h2 className="font-semibold text-gray-800 text-sm">Orion Sketch</h2>
              <p className="text-xs text-gray-400">v1.0.0</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Menu items */}
        <div className="flex-1 overflow-y-auto py-2">
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 mb-1">
              File
            </p>
            <button
              onClick={() => {
                onNewFile();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FilePlus className="w-4.5 h-4.5 text-gray-500" />
              New Drawing
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <FolderOpen className="w-4.5 h-4.5 text-gray-500" />
              Open
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <Save className="w-4.5 h-4.5 text-gray-500" />
              Save
            </button>
            <button
              onClick={() => {
                onExport();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4.5 h-4.5 text-gray-500" />
              Export
            </button>
          </div>

          <div className="border-t border-gray-100 my-2" />

          <div className="px-3 py-2">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 mb-1">
              Preferences
            </p>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <Settings className="w-4.5 h-4.5 text-gray-500" />
              Settings
            </button>
          </div>

          <div className="border-t border-gray-100 my-2" />

          <div className="px-3 py-2">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 mb-1">
              Help
            </p>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <HelpCircle className="w-4.5 h-4.5 text-gray-500" />
              Tutorial
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <Info className="w-4.5 h-4.5 text-gray-500" />
              About
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            Precision Drawing for Mobile
          </p>
        </div>
      </div>
    </>
  );
}
