import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { usePdfRenderer } from '@/hooks/usePdfRenderer';
import PDFPreviewControl from './PDFPreviewControl';
import * as pdfjsLib from 'pdfjs-dist';

interface PDFPreviewProps {
  pdfUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

type ZoomMode = 'manual' | 'fit-width' | 'fit-page';

export default function PDFPreview({ pdfUrl, isLoading, error }: PDFPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const [scale, setScale] = useState(1.0);
  const [zoomMode, setZoomMode] = useState<ZoomMode>('fit-width');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { 
    pdfDoc, 
    numPages, 
    currentPage, 
    isLoading: isPdfLoading, 
    error: pdfError,
    setCurrentPage 
  } = usePdfRenderer({
    pdfUrl,
    canvasRef,
    containerRef,
    scale
  });

  // Handle Fullscreen changes
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Calculate Scale based on mode
  const calculateScale = useCallback(async () => {
    if (!pdfDoc || !containerRef.current) return;

    try {
      const page = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale: 1.0 });
      const containerWidth = containerRef.current.clientWidth - 64; // 32px padding on each side
      const containerHeight = containerRef.current.clientHeight - 64;

      let newScale = 1.0;

      if (zoomMode === 'fit-width') {
        newScale = containerWidth / viewport.width;
      } else if (zoomMode === 'fit-page') {
        const widthScale = containerWidth / viewport.width;
        const heightScale = containerHeight / viewport.height;
        newScale = Math.min(widthScale, heightScale);
      } else {
        return; // Manual mode, don't recalculate
      }

      setScale(newScale);
    } catch (err) {
      console.error('Error calculating scale:', err);
    }
  }, [pdfDoc, currentPage, zoomMode]);

  // Recalculate scale on resize or mode change
  useEffect(() => {
    calculateScale();
    
    const resizeObserver = new ResizeObserver(() => {
      calculateScale();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [calculateScale]);

  // Zoom Handlers
  const handleZoomIn = () => {
    setZoomMode('manual');
    setScale(prev => Math.min(prev + 0.1, 3.0));
  };

  const handleZoomOut = () => {
    setZoomMode('manual');
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleFitWidth = () => {
    setZoomMode('fit-width');
  };

  const handleFitPage = () => {
    setZoomMode('fit-page');
  };

  const handleReset = () => {
    setZoomMode('fit-width');
  };

  return (
    <div ref={wrapperRef} className="h-full w-full bg-white flex flex-col rounded-xl border border-gray-200 overflow-hidden relative group">
      <PDFPreviewControl 
        scale={scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitWidth={handleFitWidth}
        onFitPage={handleFitPage}
        onReset={handleReset}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullScreen}
        currentPage={currentPage}
        numPages={numPages}
        onPageChange={setCurrentPage}
      />

      <div 
        ref={containerRef} 
        className={`flex-1 relative bg-gray-100 overflow-auto flex items-start justify-center p-8 ${isFullscreen ? 'h-screen' : ''}`}
      >
        {(isLoading || isPdfLoading) && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Rendering PDF...</p>
          </div>
        )}

        {(error || pdfError) ? (
          <div className="m-auto p-8 max-w-md text-center bg-white rounded-xl border border-red-200 shadow-2xl">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">!</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Preview Failed</h3>
            <pre className="text-left bg-red-50 p-4 rounded-lg text-red-600 text-xs overflow-auto max-h-60 border border-red-200 font-mono scrollbar-thin scrollbar-thumb-red-200">
              {error || pdfError}
            </pre>
          </div>
        ) : pdfUrl ? (
          <div className="relative shadow-2xl shadow-black/10 transition-all duration-200 ease-out bg-white">
            <canvas ref={canvasRef} className="block rounded-lg bg-white" />
          </div>
        ) : (
          <div className="text-gray-400 flex flex-col items-center m-auto">
            <div className="w-16 h-16 border-2 border-gray-300 border-dashed rounded-xl mb-4 flex items-center justify-center">
              <div className="w-8 h-8 bg-gray-200 rounded-md" />
            </div>
            <p className="text-sm">No PDF generated yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
