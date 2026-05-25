import { useState, useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';

interface TextInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string, fontSize: number) => void;
  defaultPosition?: { x: number; y: number };
}

export function TextInputModal({ isOpen, onClose, onSubmit }: TextInputModalProps) {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setText('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text.trim(), fontSize);
      setText('');
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm"
          style={{ animation: 'scaleIn 0.2s ease' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h3 className="font-semibold text-gray-800">Add Text</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Text area */}
          <div className="px-4 py-2">
            <textarea
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your text..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none min-h-[80px]"
              rows={3}
            />
          </div>

          {/* Font size */}
          <div className="px-4 py-2">
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Font Size: {fontSize}px
            </label>
            <input
              type="range"
              min={10}
              max={100}
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>10px</span>
              <span>100px</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 px-4 py-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!text.trim()}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-[#4a6fa5] hover:bg-[#3d5f8f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}
