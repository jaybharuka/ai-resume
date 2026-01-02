import { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source for pdfjs-dist v3.x
if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
}

interface UsePdfRendererProps {
  pdfUrl: string | null;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  scale: number;
  rotation?: number;
}

interface PdfRendererState {
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  numPages: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  renderTask: pdfjsLib.RenderTask | null;
}

export const usePdfRenderer = ({
  pdfUrl,
  canvasRef,
  containerRef,
  scale,
  rotation = 0
}: UsePdfRendererProps) => {
  const [state, setState] = useState<PdfRendererState>({
    pdfDoc: null,
    numPages: 0,
    currentPage: 1,
    isLoading: false,
    error: null,
    renderTask: null
  });

  // Load PDF Document
  useEffect(() => {
    if (!pdfUrl) {
      setState(prev => ({ ...prev, pdfDoc: null, numPages: 0, isLoading: false }));
      return;
    }

    const loadPdf = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdfDoc = await loadingTask.promise;
        
        setState(prev => ({
          ...prev,
          pdfDoc,
          numPages: pdfDoc.numPages,
          isLoading: false
        }));
      } catch (err: any) {
        console.error('Error loading PDF:', err);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: err.message || 'Failed to load PDF'
        }));
      }
    };

    loadPdf();
  }, [pdfUrl]);

  // Render Page
  const renderPage = useCallback(async () => {
    if (!state.pdfDoc || !canvasRef.current || !containerRef.current) return;

    try {
      // Cancel previous render task if it exists
      if (state.renderTask) {
        await state.renderTask.cancel();
      }

      const page = await state.pdfDoc.getPage(state.currentPage);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;

      // Calculate viewport
      const viewport = page.getViewport({ scale, rotation });
      
      // Handle High DPI
      const outputScale = window.devicePixelRatio || 1;
      
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      const transform = outputScale !== 1 
        ? [outputScale, 0, 0, outputScale, 0, 0] 
        : undefined;

      const renderContext = {
        canvasContext: context,
        transform,
        viewport,
      };

      const renderTask = page.render(renderContext);
      
      setState(prev => ({ ...prev, renderTask }));
      
      await renderTask.promise;
      
      setState(prev => ({ ...prev, renderTask: null }));

    } catch (err: any) {
      if (err.name !== 'RenderingCancelledException') {
        console.error('Error rendering page:', err);
      }
    }
  }, [state.pdfDoc, state.currentPage, scale, rotation, canvasRef, containerRef]);

  // Trigger render when dependencies change
  useEffect(() => {
    renderPage();
  }, [renderPage]);

  return {
    ...state,
    setCurrentPage: (page: number) => setState(prev => ({ ...prev, currentPage: page }))
  };
};
