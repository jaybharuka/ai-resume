import React from 'react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportPDF: () => void;
  onExportDOCX: () => void;
  isExporting: boolean;
}

export default function ExportModal({ isOpen, onClose, onExportPDF, onExportDOCX, isExporting }: ExportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          disabled={isExporting}
        >
          ✕
        </button>
        
        <h2 className="text-xl font-bold text-gray-800 mb-2">Export Resume</h2>
        <p className="text-gray-500 mb-6">Choose your preferred format to download.</p>
        
        <div className="grid grid-cols-1 gap-4">
          {/* PDF Option */}
          <button
            onClick={onExportPDF}
            disabled={isExporting}
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group text-left"
          >
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Print / Save as PDF</h3>
              <p className="text-sm text-gray-500">Best for sharing and printing</p>
            </div>
            {isExporting && <div className="ml-auto animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>}
          </button>

          {/* DOCX Option */}
          <button
            onClick={onExportDOCX}
            disabled={isExporting}
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group text-left"
          >
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Download as DOCX</h3>
              <p className="text-sm text-gray-500">Best for editing in Word</p>
            </div>
            {isExporting && <div className="ml-auto animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>}
          </button>
        </div>
      </div>
    </div>
  );
}
