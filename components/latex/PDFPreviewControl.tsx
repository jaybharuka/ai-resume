import React from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Minimize, 
  Expand
} from 'lucide-react';

interface PDFPreviewControlProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitWidth: () => void;
  onFitPage: () => void;
  onReset: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  currentPage: number;
  numPages: number;
  onPageChange: (page: number) => void;
}

export default function PDFPreviewControl({
  scale,
  onZoomIn,
  onZoomOut,
  onFitWidth,
  onFitPage,
  onReset,
  isFullscreen,
  onToggleFullscreen,
  currentPage,
  numPages,
  onPageChange
}: PDFPreviewControlProps) {
  return (
    <div className={`${isFullscreen ? 'fixed bottom-8 left-1/2 -translate-x-1/2 z-50 shadow-xl rounded-full px-6 py-3 bg-slate-900/90 backdrop-blur border border-slate-700 text-white' : 'h-12 bg-white border-b border-gray-200 px-4'} flex items-center justify-between transition-all duration-300 gap-4`}>
      
      {!isFullscreen && (
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <span>Page {currentPage} of {numPages || '--'}</span>
        </div>
      )}

      <div className="flex items-center gap-1 mx-auto">
        <button 
          onClick={onZoomOut}
          className={`p-1.5 rounded-md transition-colors ${isFullscreen ? 'hover:bg-white/20 text-gray-200' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        
        <span className={`text-xs font-mono w-12 text-center select-none ${isFullscreen ? 'text-gray-200' : 'text-gray-500'}`}>
          {Math.round(scale * 100)}%
        </span>
        
        <button 
          onClick={onZoomIn}
          className={`p-1.5 rounded-md transition-colors ${isFullscreen ? 'hover:bg-white/20 text-gray-200' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className={`w-px h-4 mx-2 ${isFullscreen ? 'bg-gray-600' : 'bg-gray-200'}`} />

        <button 
          onClick={onToggleFullscreen}
          className={`p-1.5 rounded-md transition-colors ${isFullscreen ? 'hover:bg-white/20 text-gray-200' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
          title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
        </button>
      </div>

      {!isFullscreen && <div className="w-20" />} {/* Spacer for balance */}
    </div>
  );
}
