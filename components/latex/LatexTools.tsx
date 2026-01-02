import React, { useState } from 'react';
import { 
  RefreshCw, Download, FileText, Wand2, AlertCircle, Terminal, 
  CheckCircle, AlertTriangle, Scissors, Sparkles, Rocket, 
  ChevronDown, ChevronRight, LayoutTemplate, Settings,
  Zap, PenTool, Target, Code, AlignLeft, Minimize2,
  CheckCircle2, AlertOctagon, Eye, Loader2
} from 'lucide-react';
import { TailorAction, TAILOR_ACTIONS } from '@/lib/latex/sectionParser';

export type StrictnessLevel = 'conservative' | 'balanced' | 'aggressive';

interface LatexToolsProps {
  onRecompile: () => void;
  onDownloadPdf: () => void;
  onDownloadTex: () => void;
  onRegenerate: () => void;
  onAiAction: (action: string) => void;
  isCompiling: boolean;
  isGenerating: boolean;
  pageCount?: number;
  jobDescription: string;
  setJobDescription: (jd: string) => void;
  logs: string;
  // New props for section tailoring
  detectedSections: string[];
  selectedSection: string;
  setSelectedSection: (section: string) => void;
  selectedAction: TailorAction;
  setSelectedAction: (action: TailorAction) => void;
  // Preview props
  onPreviewChanges: () => void;
  isPreviewLoading: boolean;
  previewError: string | null;
  // Strictness props
  strictness: StrictnessLevel;
  setStrictness: (level: StrictnessLevel) => void;
}

const ToolGroup = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mb-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full text-left text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 hover:text-gray-600 transition-colors"
      >
        {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        {title}
      </button>
      {isOpen && <div className="flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">{children}</div>}
    </div>
  );
};

interface ToolButtonProps {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  onClick: () => void;
  disabled?: boolean;
  badge?: string;
  variant?: 'default' | 'primary' | 'success';
}

const ToolButton = ({ icon: Icon, title, subtitle, onClick, disabled, badge, variant = 'default' }: ToolButtonProps) => {
  const baseClasses = "w-full group flex items-start gap-3 p-3 rounded-xl border transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    default: "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300",
    primary: "bg-slate-900 border-slate-800 text-white hover:bg-slate-800 hover:shadow-lg shadow-md",
    success: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-900"
  };

  const iconColors = {
    default: "text-gray-500 group-hover:text-indigo-600",
    primary: "text-indigo-300 group-hover:text-white",
    success: "text-emerald-600"
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseClasses} ${variants[variant]}`}>
      <div className={`mt-0.5 transition-colors ${iconColors[variant]}`}>
        <Icon size={18} strokeWidth={1.5} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium tracking-tight ${variant === 'primary' ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </span>
          {badge && (
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
              variant === 'success' 
                ? 'bg-emerald-200/50 border-emerald-300 text-emerald-800' 
                : 'bg-gray-100 border-gray-200 text-gray-600'
            }`}>
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className={`text-xs mt-0.5 font-medium ${variant === 'primary' ? 'text-slate-400' : 'text-gray-500'}`}>
            {subtitle}
          </p>
        )}
      </div>
    </button>
  );
};

export default function LatexTools({ 
  onRecompile, 
  onDownloadPdf, 
  onDownloadTex, 
  onRegenerate,
  onAiAction,
  isCompiling,
  isGenerating,
  pageCount = 1,
  jobDescription,
  setJobDescription,
  logs,
  detectedSections,
  selectedSection,
  setSelectedSection,
  selectedAction,
  setSelectedAction,
  onPreviewChanges,
  isPreviewLoading,
  previewError,
  strictness,
  setStrictness,
}: LatexToolsProps) {
  
  // Preview button is disabled if no section selected or (JD empty and action requires JD)
  const isPreviewDisabled = !selectedSection || isPreviewLoading || (selectedAction === 'rewrite_for_jd' && !jobDescription.trim());
  
  return (
    <div className="h-full w-full bg-white border-l border-gray-200 flex flex-col overflow-hidden font-sans">
      <div className="px-5 py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 tracking-tight">
          <Settings className="w-4 h-4 text-gray-500" />
          Resume Tools
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        
        {/* Section Tailoring - Primary Group */}
        <div className="p-5 space-y-5">
          
          {/* Job Description */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here to tailor your resume..."
              rows={4}
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Section to Tailor */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Section to Tailor
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
            >
              <option value="">Select a section...</option>
              {detectedSections.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
            {detectedSections.length === 0 && (
              <p className="text-xs text-gray-400">No sections detected in LaTeX</p>
            )}
          </div>

          {/* Action */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Action
            </label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value as TailorAction)}
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
            >
              {TAILOR_ACTIONS.map((action) => (
                <option key={action.value} value={action.value}>
                  {action.label}
                </option>
              ))}
            </select>
          </div>

          {/* AI Strictness */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              AI Strictness
            </label>
            <div className="flex flex-col rounded-lg border border-gray-200 bg-gray-50 p-1 gap-1">
              {(['conservative', 'balanced', 'aggressive'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setStrictness(level)}
                  className={`w-full px-3 py-2 text-xs font-medium rounded-md text-left capitalize ${
                    strictness === level
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Primary CTA - Preview Changes */}
          <div className="pt-2">
            <button
              onClick={onPreviewChanges}
              disabled={isPreviewDisabled}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPreviewLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Preview...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Preview Changes
                </>
              )}
            </button>
          </div>
          
          {/* Preview Error Message */}
          {previewError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-700">{previewError}</p>
            </div>
          )}
          
          {/* Helper text */}
          {!selectedSection && !previewError && (
            <p className="text-xs text-gray-400 text-center">Select a section to preview changes</p>
          )}
          {selectedAction === 'rewrite_for_jd' && !jobDescription.trim() && selectedSection && !previewError && (
            <p className="text-xs text-amber-600 text-center">Add a job description to use "Rewrite for JD"</p>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 mx-5"></div>

        {/* AI Enhancements */}
        <div className="p-5">
        <ToolGroup title="AI Enhancements">
          <ToolButton
            icon={Zap}
            title="Expert Overhaul"
            subtitle="Full rewrite & redesign"
            onClick={() => onAiAction('optimize_resume')}
            disabled={isGenerating}
            variant="primary"
          />

          <ToolButton
            icon={PenTool}
            title="Improve Summary"
            subtitle="Enhance professional impact"
            onClick={() => onAiAction('improve_summary')}
            disabled={isGenerating}
          />
          
          <ToolButton
            icon={Target}
            title="Optimize Keywords"
            subtitle="Target ATS requirements"
            onClick={() => onAiAction('optimize_keywords')}
            disabled={isGenerating}
          />
        </ToolGroup>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 mx-5"></div>

        {/* Smart Fixes */}
        <div className="p-5">
        <ToolGroup title="Smart Fixes">
          <ToolButton
            icon={Wand2}
            title="Fix All Errors"
            onClick={() => onAiAction('fix_all')}
            disabled={isGenerating}
            variant="success"
            badge="Auto"
          />

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onAiAction('fix_syntax')}
              disabled={isGenerating}
              className="flex flex-col items-center justify-center gap-2 p-3 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 rounded-xl transition-all"
            >
              <Code className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
              Fix Syntax
            </button>
            <button
              onClick={() => onAiAction('fix_formatting')}
              disabled={isGenerating}
              className="flex flex-col items-center justify-center gap-2 p-3 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 rounded-xl transition-all"
            >
              <AlignLeft className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
              Fix Format
            </button>
          </div>
          
          <ToolButton
            icon={Minimize2}
            title="Fix Page Overflow"
            onClick={() => onAiAction('fix_overflow')}
            disabled={isGenerating}
          />
        </ToolGroup>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 mx-5"></div>

        {/* Metadata */}
        <div className="p-5">
        <ToolGroup title="Document Info">
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 font-medium">Page Count</span>
              <span className={`font-mono font-semibold ${pageCount > 1 ? 'text-amber-600' : 'text-gray-900'}`}>
                {pageCount} / 1
              </span>
            </div>
            {pageCount > 1 && (
              <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                <span className="font-medium">Resume exceeds 1 page limit. Use "Fix Page Overflow".</span>
              </div>
            )}
          </div>
        </ToolGroup>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 mx-5"></div>

        {/* Logs */}
        <div className="p-5">
        <ToolGroup title="Compiler Logs" defaultOpen={false}>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 overflow-hidden shadow-inner">
            <div className="flex items-center gap-2 mb-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <Terminal className="w-3 h-3" />
              Console Output
            </div>
            <pre className="text-[10px] font-mono text-gray-300 whitespace-pre-wrap break-all max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
              {logs || "No logs available."}
            </pre>
          </div>
        </ToolGroup>
        </div>

      </div>
    </div>
  );
}
