'use client';

import React from 'react';
import { X, RefreshCw, Loader2, Check, Lightbulb } from 'lucide-react';

interface SectionPreviewModalProps {
  isOpen: boolean;
  isLoading: boolean;
  isApplying: boolean;
  sectionTitle: string;
  originalText: string;
  aiPreviewText: string;
  explanations: string[];
  onRegenerate: () => void;
  onApply: () => void;
  onClose: () => void;
}

export default function SectionPreviewModal({
  isOpen,
  isLoading,
  isApplying,
  sectionTitle,
  originalText,
  aiPreviewText,
  explanations,
  onRegenerate,
  onApply,
  onClose,
}: SectionPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal - Light Theme */}
      <div className="relative w-full max-w-5xl max-h-[90vh] mx-4 bg-white border border-gray-200 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Preview Changes</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Section: <span className="text-indigo-600 font-medium">{sectionTitle}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isApplying}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-gray-500">Generating AI suggestion...</p>
            </div>
          ) : isApplying ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-gray-500">Converting to LaTeX and applying changes...</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Side-by-side comparison */}
              <div className="grid grid-cols-2 gap-6">
                {/* Original Section */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Original
                    </h3>
                  </div>
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-auto max-h-[40vh]">
                    <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {originalText || 'No content'}
                    </div>
                  </div>
                </div>

                {/* AI Suggestion */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-indigo-500" />
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      AI Suggestion
                    </h3>
                  </div>
                  <div className="flex-1 bg-indigo-50 border border-indigo-200 rounded-lg p-4 overflow-auto max-h-[40vh]">
                    <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {aiPreviewText || 'No suggestion generated'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Why These Changes Section */}
              {explanations && explanations.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-semibold text-amber-800 uppercase tracking-wider">
                      Why These Changes?
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {explanations.map((explanation, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-amber-900">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{explanation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onRegenerate}
            disabled={isLoading || isApplying}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Regenerate
          </button>
          <button
            onClick={onClose}
            disabled={isApplying}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onApply}
            disabled={isLoading || isApplying || !aiPreviewText}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {isApplying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Apply Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
