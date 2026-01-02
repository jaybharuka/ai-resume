'use client';

import { useState } from 'react';
import { Sparkles, X, ChevronDown, ChevronRight, Loader2, PanelRightClose } from 'lucide-react';

const DEFAULT_LATEX_PROMPT = `Generate a one pager ATS friendly resume that showcases all my experiences, achievements and skillsets to land me a job interview at Google. Write the LaTeX code to generate this resume.

CRITICAL REQUIREMENTS:
- Produce ONLY valid LaTeX code, no explanations or markdown.
- Must fit on ONE PAGE (use compact formatting, small margins, tight spacing).
- ATS-friendly: Use standard section headings, no fancy graphics, no tables for layout.
- Escape all LaTeX special characters (& % _ # $ { } ~ ^ \\).
- Use ONLY these standard packages: geometry, enumitem, hyperref, fontenc, inputenc.
- Sections: Professional Summary, Experience, Projects, Skills, Education, Certifications.
- Optimize bullet points for impact: Start with action verbs, include metrics and achievements.
- Tailor content to highlight technical excellence, leadership, and problem-solving.
- Use \\textbf{} for emphasis, not custom fonts or colors.
- Format: Clean, professional, easy to scan.

Begin generating the complete LaTeX document now.`;

interface ClaudeAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeText: string;
  jdText: string;
  onGenerate: (prompt: string) => Promise<void>;
  isGenerating?: boolean;
}

export default function ClaudeAgentModal({ 
  isOpen, 
  onClose, 
  resumeText, 
  jdText, 
  onGenerate,
  isGenerating = false
}: ClaudeAgentModalProps) {
  const [prompt, setPrompt] = useState(DEFAULT_LATEX_PROMPT);
  const [showResume, setShowResume] = useState(false);
  const [showJD, setShowJD] = useState(false);

  const handleGenerate = async () => {
    await onGenerate(prompt);
  };

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sliding Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-[420px] bg-[#0d1117] border-l border-white/10 shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0d1117]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Claude Agent</h2>
              <p className="text-[10px] text-gray-500">Claude Sonnet 3.5</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={isGenerating}
            className="text-gray-400 hover:text-gray-200 transition-colors p-1.5 hover:bg-white/5 rounded-md disabled:opacity-50"
            title="Close sidebar"
          >
            <PanelRightClose className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-800">
          
          {/* System Prompt */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
              System Prompt
            </label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              className="w-full h-32 p-2.5 bg-[#161b22] text-gray-200 rounded-lg border border-white/10 
                       focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 
                       outline-none transition-all resize-none font-mono text-[11px] leading-relaxed
                       disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter system prompt..."
            />
          </div>

          {/* Context Sections */}
          <div className="space-y-2">
            
            {/* Resume Preview */}
            <div className="border border-white/10 rounded-lg overflow-hidden bg-[#161b22]">
              <button
                onClick={() => setShowResume(!showResume)}
                className="w-full flex items-center justify-between p-2.5 hover:bg-[#0d1117] transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  {showResume ? (
                    <ChevronDown className="w-3.5 h-3.5 text-purple-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
                  )}
                  <span className="text-xs font-medium text-purple-400">Resume Context</span>
                  <span className="text-[10px] text-gray-500">
                    ({resumeText ? `${resumeText.length} chars` : 'empty'})
                  </span>
                </div>
              </button>
              {showResume && (
                <pre className="p-3 bg-[#0d1117] text-gray-300 text-[10px] leading-relaxed max-h-40 overflow-auto border-t border-white/10 font-mono">
                  {resumeText || 'No resume loaded'}
                </pre>
              )}
            </div>

            {/* JD Preview */}
            <div className="border border-white/10 rounded-lg overflow-hidden bg-[#161b22]">
              <button
                onClick={() => setShowJD(!showJD)}
                className="w-full flex items-center justify-between p-2.5 hover:bg-[#0d1117] transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  {showJD ? (
                    <ChevronDown className="w-3.5 h-3.5 text-pink-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-pink-400" />
                  )}
                  <span className="text-xs font-medium text-pink-400">Job Description</span>
                  <span className="text-[10px] text-gray-500">
                    ({jdText ? `${jdText.length} chars` : 'optional'})
                  </span>
                </div>
              </button>
              {showJD && (
                <pre className="p-3 bg-[#0d1117] text-gray-300 text-[10px] leading-relaxed max-h-40 overflow-auto border-t border-white/10 font-mono">
                  {jdText || 'No job description provided'}
                </pre>
              )}
            </div>

          </div>

          {/* Generation Status */}
          {isGenerating && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-purple-300">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-medium">Generating LaTeX code...</span>
              </div>
              <p className="text-[10px] text-purple-400/70 mt-1">
                Watch your editor for real-time updates
              </p>
            </div>
          )}

        </div>

        {/* Footer - Fixed at bottom */}
        <div className="p-4 border-t border-white/10 bg-[#0d1117]">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !resumeText}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 
                     text-white font-medium rounded-lg py-2.5 px-4 transition-all shadow-lg shadow-purple-900/30
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                     flex items-center justify-center gap-2 text-sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate LaTeX
              </>
            )}
          </button>
          
          {!resumeText && (
            <p className="text-[10px] text-amber-400 mt-2 text-center">
              ⚠️ Upload a resume first
            </p>
          )}
        </div>

      </div>
    </>
  );
}
