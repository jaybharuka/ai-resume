'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sliders, FileText, Code2, Shield, Scale, Zap, File, Files, Download, FileCode, RotateCcw, Trash2, AlertTriangle } from 'lucide-react';
import { useSettingsStore, AIStrictness, ResumeLength, DefaultEditor, ExportFormat } from '@/lib/stores/settingsStore';
import { useResumeStore } from '@/lib/stores/resumeStore';

const TOUR_DISMISSED_KEY = 'resumex-tour-dismissed';

// Radio option component for cleaner code
interface RadioOptionProps {
  id: string;
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  icon: React.ReactNode;
  label: string;
  description: string;
}

function RadioOption({ id, name, value, checked, onChange, icon, label, description }: RadioOptionProps) {
  return (
    <label
      htmlFor={id}
      className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
        checked
          ? 'border-indigo-300 bg-indigo-50 ring-1 ring-indigo-200'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
        checked ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'
      }`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${checked ? 'text-indigo-900' : 'text-slate-900'}`}>
          {label}
        </div>
        <div className={`text-xs mt-0.5 ${checked ? 'text-indigo-600' : 'text-slate-500'}`}>
          {description}
        </div>
      </div>
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
        checked ? 'border-indigo-600' : 'border-slate-300'
      }`}>
        {checked && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
      </div>
    </label>
  );
}

// Section component
interface SectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function Section({ title, description, children }: SectionProps) {
  return (
    <section className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{description}</p>
      </div>
      <div className="p-6">
        {children}
      </div>
    </section>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const {
    defaultAIStrictness,
    setDefaultAIStrictness,
    resumeLength,
    setResumeLength,
    defaultEditor,
    setDefaultEditor,
    defaultExportFormat,
    setDefaultExportFormat,
  } = useSettingsStore();
  
  const resetResumeData = useResumeStore((state) => state.resetResumeData);

  // Restart Quick Tour
  const handleRestartTour = () => {
    localStorage.removeItem(TOUR_DISMISSED_KEY);
    router.push('/');
  };

  // Clear all resume data
  const handleClearAllData = () => {
    // Clear Zustand store
    resetResumeData();
    
    // Clear related localStorage entries
    localStorage.removeItem('resume-storage');
    
    // Close dialog and redirect
    setShowDeleteConfirm(false);
    router.push('/');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Sliders size={20} className="text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          </div>
          <p className="text-slate-500">Customize how Resumex works for you.</p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* AI Preferences */}
          <Section
            title="AI Preferences"
            description="Control how AI suggestions modify your resume content."
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 block mb-3">
                Default AI Strictness
              </label>
              <div className="space-y-2">
                <RadioOption
                  id="ai-conservative"
                  name="ai-strictness"
                  value="conservative"
                  checked={defaultAIStrictness === 'conservative'}
                  onChange={() => setDefaultAIStrictness('conservative')}
                  icon={<Shield size={18} />}
                  label="Conservative"
                  description="Minimal changes, preserves your original wording"
                />
                <RadioOption
                  id="ai-balanced"
                  name="ai-strictness"
                  value="balanced"
                  checked={defaultAIStrictness === 'balanced'}
                  onChange={() => setDefaultAIStrictness('balanced')}
                  icon={<Scale size={18} />}
                  label="Balanced"
                  description="Moderate improvements while keeping your voice"
                />
                <RadioOption
                  id="ai-aggressive"
                  name="ai-strictness"
                  value="aggressive"
                  checked={defaultAIStrictness === 'aggressive'}
                  onChange={() => setDefaultAIStrictness('aggressive')}
                  icon={<Zap size={18} />}
                  label="Aggressive"
                  description="Significant rewrites for maximum impact"
                />
              </div>
            </div>
          </Section>

          {/* Resume Layout */}
          <Section
            title="Resume Layout"
            description="Set default page length preferences for your resumes."
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 block mb-3">
                Resume Length
              </label>
              <div className="space-y-2">
                <RadioOption
                  id="length-single"
                  name="resume-length"
                  value="single-page"
                  checked={resumeLength === 'single-page'}
                  onChange={() => setResumeLength('single-page')}
                  icon={<File size={18} />}
                  label="Single Page"
                  description="Enforce a one-page resume format"
                />
                <RadioOption
                  id="length-multi"
                  name="resume-length"
                  value="multi-page"
                  checked={resumeLength === 'multi-page'}
                  onChange={() => setResumeLength('multi-page')}
                  icon={<Files size={18} />}
                  label="Multiple Pages"
                  description="Allow resume to extend beyond one page"
                />
              </div>
            </div>
          </Section>

          {/* Editor Preferences */}
          <Section
            title="Editor Preferences"
            description="Choose your preferred editing experience."
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 block mb-3">
                Default Editor
              </label>
              <div className="space-y-2">
                <RadioOption
                  id="editor-visual"
                  name="default-editor"
                  value="visual"
                  checked={defaultEditor === 'visual'}
                  onChange={() => setDefaultEditor('visual')}
                  icon={<FileText size={18} />}
                  label="Visual Editor"
                  description="Form-based editing with live preview"
                />
                <RadioOption
                  id="editor-code"
                  name="default-editor"
                  value="code"
                  checked={defaultEditor === 'code'}
                  onChange={() => setDefaultEditor('code')}
                  icon={<Code2 size={18} />}
                  label="Code Editor"
                  description="Direct LaTeX editing with syntax highlighting"
                />
              </div>
            </div>
          </Section>

          {/* Export Settings */}
          <Section
            title="Export Settings"
            description="Set your default export preferences."
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 block mb-3">
                Default Export Format
              </label>
              <div className="space-y-2">
                <RadioOption
                  id="export-pdf"
                  name="export-format"
                  value="pdf"
                  checked={defaultExportFormat === 'pdf'}
                  onChange={() => setDefaultExportFormat('pdf')}
                  icon={<Download size={18} />}
                  label="PDF"
                  description="Ready-to-share document format"
                />
                <RadioOption
                  id="export-latex"
                  name="export-format"
                  value="latex"
                  checked={defaultExportFormat === 'latex'}
                  onChange={() => setDefaultExportFormat('latex')}
                  icon={<FileCode size={18} />}
                  label="LaTeX (.tex)"
                  description="Source file for further customization"
                />
              </div>
            </div>
          </Section>

          {/* Help Section */}
          <Section
            title="Help"
            description="Get started or learn about features."
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Quick Tour</p>
                <p className="text-xs text-slate-500 mt-0.5">Re-watch the product walkthrough</p>
              </div>
              <button
                onClick={handleRestartTour}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <RotateCcw size={16} />
                Restart Quick Tour
              </button>
            </div>
          </Section>

          {/* Danger Zone */}
          <section className="bg-white rounded-lg border border-red-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-red-100 bg-red-50">
              <h2 className="text-base font-semibold text-red-900">Danger Zone</h2>
              <p className="text-sm text-red-600 mt-0.5">Irreversible actions that affect your data.</p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">Clear All Resume Data</p>
                  <p className="text-xs text-slate-500 mt-0.5">Remove all resumes and start fresh</p>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                  Clear All Data
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-slate-900/50"
              onClick={() => setShowDeleteConfirm(false)}
            />
            
            {/* Dialog */}
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={20} className="text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Clear All Data?</h3>
                    <p className="text-sm text-slate-500">This action cannot be undone.</p>
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 mb-6">
                  This will permanently delete all your resume data from this browser. 
                  You'll need to start over from scratch.
                </p>
                
                <div className="flex items-center gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearAllData}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Yes, Clear All Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer note */}
        <p className="text-xs text-slate-400 text-center mt-8">
          Settings are saved automatically and persist across sessions.
        </p>
      </div>
    </div>
  );
}
