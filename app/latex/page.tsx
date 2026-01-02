'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useResumeStore } from '@/lib/stores/resumeStore';
import { ArrowLeft, Upload, FileText, Play, Download, FileCode, Settings, ChevronLeft, ChevronRight, PanelRightClose, PanelRightOpen, Code, LayoutTemplate } from 'lucide-react';
import Link from 'next/link';
import { saveAs } from 'file-saver';
import mammoth from 'mammoth';
import LatexEditor from '@/components/latex/LatexEditor';
import LatexPreview from '@/components/latex/LatexPreview';
import LatexTools from '@/components/latex/LatexTools';
import SectionPreviewModal from '@/components/latex/SectionPreviewModal';
import { VisualEditor } from '@/components/latex/visual/VisualEditor';
import { parseLatexToJSON, generateLatexFromJSON } from '@/lib/latex/latexAdapter';
import { extractSectionTitles, extractSectionByTitle, replaceSectionByTitle, latexToPlainText, TailorAction } from '@/lib/latex/sectionParser';
import { StrictnessLevel } from '@/components/latex/LatexTools';
import { ResumeData } from '@/types/resume';

export default function LatexWorkspace() {
  const { resumeData, setResumeData, generatedLatex, fromCreatePage, setFromCreatePage, setGeneratedLatex } = useResumeStore();
  const [latexCode, setLatexCode] = useState<string>('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [logs, setLogs] = useState<string>('');
  const [pageCount, setPageCount] = useState<number>(1);
  const [isToolsCollapsed, setIsToolsCollapsed] = useState(true);
  
  // Onboarding State
  const [pastedResumeText, setPastedResumeText] = useState<string>('');
  const [isPasteProcessing, setIsPasteProcessing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  
  // Section Tailoring State
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<TailorAction>('rewrite_for_jd');
  const [strictness, setStrictness] = useState<StrictnessLevel>('conservative');
  
  // Preview State
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isApplyingChanges, setIsApplyingChanges] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [originalSectionLatex, setOriginalSectionLatex] = useState<string>('');
  const [originalSectionText, setOriginalSectionText] = useState<string>('');
  const [aiPreviewText, setAiPreviewText] = useState<string>('');
  const [aiExplanations, setAiExplanations] = useState<string[]>([]);
  
  // Dual Editor State
  const [activeEditor, setActiveEditor] = useState<'code' | 'visual'>('code');
  const [visualData, setVisualData] = useState<ResumeData | null>(null);
  const [pendingCompile, setPendingCompile] = useState<string | null>(null);

  const editorRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle incoming data from Create Resume page
  useEffect(() => {
    if (fromCreatePage && resumeData && generatedLatex) {
      // Set the LaTeX code
      setLatexCode(generatedLatex);
      // Set visual data
      setVisualData(resumeData);
      // Switch to Visual Editor by default
      setActiveEditor('visual');
      // Hide onboarding
      setShowOnboarding(false);
      // Clear the flag and stored latex
      setFromCreatePage(false);
      setGeneratedLatex('');
      // Set pending compile (will be handled after compileLatex is defined)
      setPendingCompile(generatedLatex);
    }
  }, [fromCreatePage, resumeData, generatedLatex, setFromCreatePage, setGeneratedLatex]);

  // Initialize visual data when resumeData changes
  useEffect(() => {
    if (resumeData) {
      setVisualData(resumeData);
    }
  }, [resumeData]);

  // Detect sections from LaTeX code
  const detectedSections = useMemo(() => {
    return extractSectionTitles(latexCode);
  }, [latexCode]);

  // Preview Changes Handler - Now returns plain text for human review
  const handlePreviewChanges = useCallback(async () => {
    if (!selectedSection) {
      setPreviewError('Please select a section to tailor');
      return;
    }

    // Extract the selected section from LaTeX
    const sectionContent = extractSectionByTitle(latexCode, selectedSection);
    if (!sectionContent) {
      setPreviewError(`Section "${selectedSection}" not found in LaTeX`);
      return;
    }

    // Convert original LaTeX to plain text for display
    const originalPlainText = latexToPlainText(sectionContent);

    setPreviewError(null);
    setOriginalSectionLatex(sectionContent);
    setOriginalSectionText(originalPlainText);
    setAiPreviewText('');
    setAiExplanations([]);
    setIsPreviewLoading(true);
    setIsPreviewModalOpen(true);

    try {
      const response = await fetch('/api/preview-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionLatex: sectionContent,
          jobDescription: jobDescription,
          action: selectedAction,
          sectionTitle: selectedSection,
          strictness: strictness,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate preview');
      }

      const data = await response.json();
      setAiPreviewText(data.improvedText || '');
      setAiExplanations(data.explanations || []);
    } catch (error: any) {
      console.error('Preview error:', error);
      setPreviewError(error.message || 'Failed to generate preview');
      setAiPreviewText('');
    } finally {
      setIsPreviewLoading(false);
    }
  }, [latexCode, selectedSection, selectedAction, jobDescription]);

  // Regenerate Preview Handler
  const handleRegeneratePreview = useCallback(() => {
    handlePreviewChanges();
  }, [handlePreviewChanges]);

  // Close Preview Modal
  const handleClosePreview = useCallback(() => {
    setIsPreviewModalOpen(false);
    setPreviewError(null);
    setAiExplanations([]);
  }, []);

  // Apply AI Changes Handler - Two-step: Convert plain text to LaTeX, then apply
  const handleApplyChanges = useCallback(async () => {
    if (!aiPreviewText || !selectedSection || !originalSectionLatex) {
      setPreviewError('No AI changes to apply');
      return;
    }

    setIsApplyingChanges(true);
    setPreviewError(null);

    try {
      // Step 1: Convert approved plain text to LaTeX using Gemini
      const convertResponse = await fetch('/api/convert-to-latex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plainText: aiPreviewText,
          originalLatex: originalSectionLatex,
          sectionTitle: selectedSection,
        }),
      });

      if (!convertResponse.ok) {
        const errorData = await convertResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to convert to LaTeX');
      }

      const convertData = await convertResponse.json();
      const newSectionLatex = convertData.latex;

      if (!newSectionLatex) {
        throw new Error('No LaTeX generated from conversion');
      }

      // Step 2: Replace the section in the full LaTeX document
      const result = replaceSectionByTitle(latexCode, selectedSection, newSectionLatex);

      if (!result.success || !result.latex) {
        throw new Error(result.error || 'Failed to apply changes to document');
      }

      // Step 3: Update the LaTeX code in the editor
      setLatexCode(result.latex);

      // Step 4: Close the modal and clear state
      setIsPreviewModalOpen(false);
      setPreviewError(null);
      setOriginalSectionLatex('');
      setOriginalSectionText('');
      setAiPreviewText('');
      setAiExplanations([]);

      // Step 5: Trigger PDF recompilation
      compileLatex(result.latex);

    } catch (error: any) {
      console.error('Apply changes error:', error);
      setPreviewError(error.message || 'Failed to apply changes');
    } finally {
      setIsApplyingChanges(false);
    }
  }, [latexCode, selectedSection, aiPreviewText, originalSectionLatex]);

  const handleEditorSwitch = (mode: 'code' | 'visual') => {
    if (mode === activeEditor) return;

    if (mode === 'visual') {
      // Code -> Visual: Use existing visualData if available, otherwise parse LaTeX
      // This preserves data that was set from upload or previous edits
      if (!visualData && latexCode) {
        const parsed = parseLatexToJSON(latexCode);
        setVisualData(parsed);
      }
      // If visualData already exists, just switch - don't overwrite it
    } else {
      // Visual -> Code: Generate LaTeX from visual data
      if (visualData) {
        const generated = generateLatexFromJSON(visualData);
        setLatexCode(generated);
        // Auto-compile when switching back to code
        compileLatex(generated);
      }
    }
    setActiveEditor(mode);
  };

  // Track if user is actively editing in visual mode
  const [isVisualEditing, setIsVisualEditing] = useState(false);

  const handleVisualChange = (newData: ResumeData) => {
    setVisualData(newData);
    setIsVisualEditing(true); // Mark that user is actively editing
  };

  // Debounce effect for Visual Editor changes - only triggers when user actively edits
  useEffect(() => {
    if (activeEditor === 'visual' && visualData && isVisualEditing) {
      const timer = setTimeout(() => {
        const generated = generateLatexFromJSON(visualData);
        setLatexCode(generated);
        compileLatex(generated);
        setIsVisualEditing(false);
      }, 1000); // 1 second debounce

      return () => clearTimeout(timer);
    }
  }, [visualData, activeEditor, isVisualEditing]);


  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      let extractPayload = {};
      const mimeType = file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : file.name.toLowerCase().endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : '');

      if (mimeType === 'application/pdf') {
        const base64 = await fileToBase64(file);
        extractPayload = { base64, mimeType };
      } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.toLowerCase().endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractPayload = { text: result.value };
      } else {
        throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
      }

      const response = await fetch('/api/extract-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extractPayload)
      });

      if (!response.ok) throw new Error('Failed to extract data');
      
      const extractData = await response.json();
      if (extractData.success) {
        // Store in global state and local visual state
        setResumeData(extractData.data);
        setVisualData(extractData.data); // Update visual editor immediately
        generateLatex(extractData.data);
        setShowOnboarding(false); // Hide onboarding after successful upload
      } else {
        throw new Error(extractData.error || 'Extraction failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle pasted resume text from onboarding
  const handlePastedResume = async () => {
    if (!pastedResumeText.trim()) return;
    
    setIsPasteProcessing(true);
    try {
      const response = await fetch('/api/extract-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pastedResumeText })
      });

      if (!response.ok) throw new Error('Failed to extract data');
      
      const extractData = await response.json();
      if (extractData.success) {
        setResumeData(extractData.data);
        setVisualData(extractData.data);
        generateLatex(extractData.data);
        setPastedResumeText(''); // Clear after processing
        setShowOnboarding(false); // Hide onboarding after successful paste
      } else {
        throw new Error(extractData.error || 'Extraction failed');
      }
    } catch (error: any) {
      console.error('Paste processing error:', error);
      alert(error.message);
    } finally {
      setIsPasteProcessing(false);
    }
  };

  const generateLatex = async (overrideData?: any) => {
    // Handle case where function is called as event handler
    const isEvent = overrideData && (overrideData.preventDefault || overrideData.nativeEvent);
    const dataToUse = (!isEvent && overrideData) ? overrideData : resumeData;

    if (!dataToUse) return;
    setIsGenerating(true);
    try {
      // Use deterministic local generation instead of AI
      const generatedCode = generateLatexFromJSON(dataToUse);
      setLatexCode(generatedCode);
      
      // Auto-compile
      compileLatex(generatedCode);
    } catch (error) {
      console.error('Error generating LaTeX:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAiAction = async (action: string) => {
    // If action is "tailor", we use the JSON-based tailoring API
    if (action === 'tailor') {
      if (!resumeData) return;
      setIsGenerating(true);
      try {
        const response = await fetch('/api/tailor-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumeData,
            jobDescription: jobDescription || "General Software Engineering Role"
          })
        });

        if (!response.ok) throw new Error('Tailoring failed');
        const { tailoredData } = await response.json();
        
        // Update state with tailored JSON
        setResumeData(tailoredData);
        setVisualData(tailoredData);
        
        // Generate LaTeX deterministically from new JSON
        const newCode = generateLatexFromJSON(tailoredData);
        setLatexCode(newCode);
        compileLatex(newCode);
        
      } catch (error: any) {
        console.error('Tailoring Error:', error);
        alert(`Tailoring Failed: ${error.message}`);
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // Legacy AI actions (fix errors, etc) still operate on LaTeX string for now
    // But ideally should also move to JSON manipulation if possible
    if (!latexCode) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          latexCode,
          jobDescription: jobDescription || "General Software Engineering Role",
          errorLog: logs, // Send logs to AI for context
          pageCount: pageCount // Send page count for overflow fixes
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      const { latexCode: newCode } = await response.json();
      setLatexCode(newCode);
      
      // Auto-compile after AI action
      compileLatex(newCode);
    } catch (error: any) {
      console.error('AI Action Error:', error);
      const msg = error.message === 'Failed to fetch' 
        ? 'Cannot connect to server. Please ensure the backend is running.' 
        : error.message;
      alert(`AI Action Failed: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const compileLatex = async (code: string) => {
    setIsCompiling(true);
    setCompileError(null);
    setLogs("Compiling...");
    
    try {
      const response = await fetch('/api/compile-latex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          latexCode: code
        })
      });
      
      const data = await response.json();
      
      if (data.logs) {
        setLogs(data.logs);
      }

      if (!response.ok || !data.success) {
        throw new Error(data.details || data.error || 'Compilation failed');
      }

      // Convert base64 PDF to Blob URL
      const byteCharacters = atob(data.pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      
      // Estimate page count (rough estimate based on PDF size or just default to 1 for now)
      // In a real app, we'd parse the PDF to get exact page count.
      // For now, let's assume if it's > 50KB it might be > 1 page, but that's unreliable.
      // We'll leave it as 1 unless we implement PDF parsing on client.
      setPageCount(1); 

    } catch (error: any) {
      console.error('Compilation error:', error);
      setCompileError(error.message);
    } finally {
      setIsCompiling(false);
    }
  };

  // Handle pending compile from Create Resume page
  useEffect(() => {
    if (pendingCompile) {
      compileLatex(pendingCompile);
      setPendingCompile(null);
    }
  }, [pendingCompile]);

  const handleDownloadTex = () => {
    const blob = new Blob([latexCode], { type: 'application/x-tex' });
    saveAs(blob, 'resume.tex');
  };

  const handleDownloadPdf = () => {
    if (pdfUrl) {
      saveAs(pdfUrl, 'resume.pdf');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden text-gray-900">
      {/* Header */}
      <header className="h-14 border-b border-gray-200 flex items-center px-4 justify-between bg-white z-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <div className="h-4 w-px bg-gray-200"></div>
          <h1 className="font-semibold text-gray-900 flex items-center gap-2">
            LaTeX Workspace 
            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">PRO</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => compileLatex(latexCode)}
            disabled={isCompiling || isGenerating}
            className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-all shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className={`w-3 h-3 ${isCompiling ? 'animate-spin' : 'fill-current'}`} />
            {isCompiling ? 'Compiling...' : 'Compile'}
          </button>

          <div className="h-6 w-px bg-gray-200 mx-1"></div>

          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">PDF</span>
          </button>
          
          <button
            onClick={handleDownloadTex}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            title="Download .tex"
          >
            <FileCode className="w-4 h-4" />
            <span className="hidden sm:inline">.TeX</span>
          </button>

          <div className="h-6 w-px bg-gray-200 mx-1"></div>

          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileUpload}
            className="hidden"
            ref={fileInputRef}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            disabled={isUploading || isGenerating}
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload New</span>
          </button>
        </div>
      </header>

      {/* Main Workspace - 3 Column Layout */}
      <div className="flex-1 grid grid-cols-[40%_1fr_240px] overflow-hidden relative">
        
        {/* Left: Editor (Code or Visual) */}
        <div className="h-full flex flex-col border-r border-gray-200 bg-white">
          {/* Editor Toggle Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => handleEditorSwitch('code')}
              className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                activeEditor === 'code' 
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Code className="w-4 h-4" />
              Code Editor
            </button>
            <button
              onClick={() => handleEditorSwitch('visual')}
              className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                activeEditor === 'visual' 
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <LayoutTemplate className="w-4 h-4" />
              Visual Editor
            </button>
          </div>

          {/* Editor Content - Both editors mounted, visibility controlled by CSS */}
          <div className="flex-1 overflow-hidden relative">
            {/* Code Editor - always mounted */}
            <div className={`absolute inset-0 p-4 ${activeEditor === 'code' ? 'block' : 'hidden'}`}>
              <LatexEditor 
                code={latexCode} 
                onChange={(val) => setLatexCode(val || '')}
                editorRef={editorRef}
                onAutoCompile={compileLatex}
              />
            </div>
            
            {/* Visual Editor - always mounted, with overflow scroll */}
            <div className={`absolute inset-0 overflow-y-auto ${activeEditor === 'visual' ? 'block' : 'hidden'}`}>
              {visualData ? (
                <VisualEditor 
                  data={visualData} 
                  onChange={handleVisualChange} 
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Upload a resume to see the Visual Editor</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center: Preview */}
        <div className="h-full flex flex-col relative bg-gray-50 overflow-hidden p-4">
           <LatexPreview 
             pdfUrl={pdfUrl} 
             isLoading={isCompiling} 
             error={compileError} 
           />
        </div>
        
        {/* Right: Tools (hidden when Claude is open) */}
        <div className="h-full border-l border-gray-200 bg-white flex flex-col overflow-hidden">
          <LatexTools 
            onRecompile={() => compileLatex(latexCode)}
            onDownloadPdf={handleDownloadPdf}
            onDownloadTex={handleDownloadTex}
            onRegenerate={() => generateLatex()}
            onAiAction={handleAiAction}
            isCompiling={isCompiling}
            isGenerating={isGenerating}
            pageCount={pageCount}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            logs={logs}
            detectedSections={detectedSections}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
            selectedAction={selectedAction}
            setSelectedAction={setSelectedAction}
            onPreviewChanges={handlePreviewChanges}
            isPreviewLoading={isPreviewLoading}
            previewError={previewError}
            strictness={strictness}
            setStrictness={setStrictness}
          />
        </div>
      </div>

      {/* Section Preview Modal */}
      <SectionPreviewModal
        isOpen={isPreviewModalOpen}
        isLoading={isPreviewLoading}
        isApplying={isApplyingChanges}
        sectionTitle={selectedSection}
        originalText={originalSectionText}
        aiPreviewText={aiPreviewText}
        explanations={aiExplanations}
        onRegenerate={handleRegeneratePreview}
        onApply={handleApplyChanges}
        onClose={handleClosePreview}
      />

      {/* Onboarding Overlay */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100/80 backdrop-blur-sm">
          <div className="w-full max-w-lg mx-4">
            {/* Loading State */}
            {(isUploading || isPasteProcessing) ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-indigo-600 mx-auto mb-4"></div>
                <h2 className="text-lg font-semibold text-gray-800">Analyzing your resume...</h2>
                <p className="text-gray-500 text-sm mt-1">Extracting information and preparing LaTeX environment</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-7 h-7 text-indigo-600" />
                  </div>
                  <h1 className="text-2xl font-semibold text-gray-900 mb-2">Start Your Resume</h1>
                  <p className="text-gray-500 text-sm">Upload an existing resume or paste your content to get started</p>
                </div>

                {/* Options Container */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                  
                  {/* Option A: Upload Resume */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
                      Upload Resume
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="upload-resume-onboarding"
                      />
                      <label
                        htmlFor="upload-resume-onboarding"
                        className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-200 text-sm font-medium rounded-lg text-gray-600 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 cursor-pointer"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload PDF or DOCX
                      </label>
                    </div>
                  </div>

                  {/* OR Divider */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-xs font-medium text-gray-400 uppercase">or</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>

                  {/* Option B: Paste Resume Text */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
                      Paste Resume Text
                    </label>
                    <textarea
                      value={pastedResumeText}
                      onChange={(e) => setPastedResumeText(e.target.value)}
                      placeholder="Paste your resume content here..."
                      rows={8}
                      className="w-full px-3 py-3 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    />
                    <button
                      onClick={handlePastedResume}
                      disabled={!pastedResumeText.trim()}
                      className="w-full mt-3 flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue
                    </button>
                  </div>
                </div>

                {/* Back Link */}
                <div className="text-center mt-6">
                  <Link 
                    href="/"
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    ← Go back to Builder
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
