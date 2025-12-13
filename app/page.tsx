'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import mammoth from 'mammoth';
import { saveAs } from 'file-saver';
import PizZip from 'pizzip';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import 'react-quill/dist/quill.snow.css';
import './editor.css';

import ATSScoreCard from '@/components/ATSScoreCard';
import ExportModal from '@/components/ExportModal';
import ResumePreview from '@/components/ResumePreview';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import TemplateSelector from '@/components/TemplateSelector';
import PrintableResume from '@/components/PrintableResume';
import { TemplateName } from '@/components/templates';
import { ResumeData } from '@/types/resume';
import { Layout, Save, Palette } from 'lucide-react';
import { saveResume } from '@/lib/actions/resume';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { useResumeStore } from '@/lib/stores/resumeStore';
import { useReactToPrint } from 'react-to-print';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function VisualEditorPage() {
  const [editorContent, setEditorContent] = useState<string>('');
  const [tailoredContent, setTailoredContent] = useState<string | null>(null);
  const [originalDocBuffer, setOriginalDocBuffer] = useState<ArrayBuffer | null>(null);
  const [originalFileType, setOriginalFileType] = useState<string>('');
  const [viewMode, setViewMode] = useState<'edit' | 'review'>('edit');
  const [showJdPanel, setShowJdPanel] = useState(true);
  const [activeTab, setActiveTab] = useState<'editor' | 'dashboard' | 'templates' | 'settings'>('editor');
  const [rightPanelTab, setRightPanelTab] = useState<'jd' | 'analysis'>('jd');
  const [isSaving, setIsSaving] = useState(false);
  const [jobDescription, setJobDescription] = useState<string>(`Job Title: Senior Full Stack Engineer (React/Node.js) Company: TechNova Solutions Location: Remote / Hybrid (San Francisco, CA)

About the Role: We are looking for a highly skilled Full Stack Engineer to join our product team. You will be responsible for building scalable web applications and optimizing our current infrastructure. The ideal candidate is passionate about clean code, UI/UX design, and cloud technologies.

Key Responsibilities:

Design and develop high-performance user interfaces using React.js and Next.js.

Build and maintain robust backend APIs using Node.js and Express.

Collaborate with cross-functional teams to define, design, and ship new features.

Ensure the technical feasibility of UI/UX designs.

Optimize applications for maximum speed and scalability.

Implement security best practices and data protection measures.

Technical Requirements (Hard Skills):

Frontend: Expert proficiency in JavaScript (ES6+), TypeScript, React, Redux, and Tailwind CSS.

Backend: Strong experience with Node.js, Python, or Go.

Database: Experience with MongoDB (NoSQL) and PostgreSQL.

DevOps & Tools: Familiarity with AWS (EC2, S3, Lambda), Docker, Kubernetes, and CI/CD pipelines (GitHub Actions).

Testing: Experience with testing frameworks like Jest or Cypress.

Soft Skills & Qualifications:

Strong problem-solving skills and attention to detail.

Excellent communication skills and ability to work in an Agile environment.

Proven track record of leadership or mentoring junior developers.

Ability to manage multiple project timelines effectively.

Bachelor’s degree in Computer Science or relevant field.`);
  const [isLoading, setIsLoading] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [atsAnalysis, setAtsAnalysis] = useState<any>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [generatedBullet, setGeneratedBullet] = useState<string | null>(null);
  const [isGeneratingBullet, setIsGeneratingBullet] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [extractApiStatus, setExtractApiStatus] = useState<string | null>(null);
  const [parsePdfStatus, setParsePdfStatus] = useState<string | null>(null);
  const [extractPreview, setExtractPreview] = useState<any>(null);
  
  // New State for Template Builder
  const [activeTemplate, setActiveTemplate] = useState<TemplateName>('modern');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [builderMode, setBuilderMode] = useState(false); // Toggle between Editor and Builder
  const [accentColor, setAccentColor] = useState('#3b82f6');

  // Resume Store
  const { resumeData, setResumeData, updateResumeData } = useResumeStore();

  // Print functionality
  const printRef = React.useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Resume',
    pageStyle: `
      @page {
        margin: 1in;
        size: A4;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          color-adjust: exact;
        }
      }
    `,
  });

  // Auto-scale logic for Resume Builder
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  React.useEffect(() => {
    const calculateScale = () => {
      if (containerRef.current && builderMode) {
        const containerWidth = containerRef.current.offsetWidth;
        const resumeWidth = 794; // 210mm in px at 96 DPI
        const padding = 64; // p-8 = 32px * 2
        const availableWidth = containerWidth - padding;
        
        if (availableWidth < resumeWidth) {
          setScale(Math.max(0.5, availableWidth / resumeWidth)); // Min scale 0.5
        } else {
          setScale(1);
        }
      }
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    // Recalculate after layout transition
    const timeout = setTimeout(calculateScale, 600); 

    return () => {
      window.removeEventListener('resize', calculateScale);
      clearTimeout(timeout);
    };
  }, [builderMode, showJdPanel]);

  // Auto-hide JD panel when entering review mode
  React.useEffect(() => {
    if (viewMode === 'review') {
      setShowJdPanel(false);
    } else {
      setShowJdPanel(true);
    }
  }, [viewMode]);

  const CustomToolbar = () => (
    <div id="toolbar" className="sticky top-4 z-50 mx-auto max-w-3xl bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl px-4 py-2 shadow-lg mb-6 transition-all">
      <span className="ql-formats">
        <select className="ql-header" defaultValue="">
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="">Normal</option>
        </select>
      </span>
      <span className="ql-formats">
        <button className="ql-bold" />
        <button className="ql-italic" />
        <button className="ql-underline" />
        <button className="ql-strike" />
      </span>
      <span className="ql-formats">
        <button className="ql-list" value="ordered" />
        <button className="ql-list" value="bullet" />
      </span>
      <span className="ql-formats">
        <select className="ql-color" />
        <select className="ql-background" />
      </span>
      <span className="ql-formats">
        <button className="ql-clean" />
      </span>
    </div>
  );

  const modules = {
    toolbar: {
      container: '#toolbar',
    },
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    console.log('handleFileUpload: file selected', file.name, file.type);
    setUploadedFileName(file.name);
    setExtractApiStatus(null);
    setParsePdfStatus(null);
    setExtractPreview(null);

    setIsLoading(true);
    setOriginalFileType(file.type);
    
    try {
      // 1. Extract Data for Template Builder
      let extractPayload = {};
      // Sometimes browsers may not provide a mimeType for .docx files; attempt to fallback to file extension
      const mimeType = file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : file.name.toLowerCase().endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : '');

      if (mimeType === 'application/pdf') {
        const base64 = await fileToBase64(file);
        extractPayload = { base64, mimeType };
      } else {
        const arrayBuffer = await file.arrayBuffer();
        setOriginalDocBuffer(arrayBuffer);
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractPayload = { text: result.value };
        
        // Also get HTML for the old editor (legacy support)
        const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
        setEditorContent(htmlResult.value);
      }

      // Call Extraction API
      setExtractApiStatus('sending');
      const extractResponse = await fetch('/api/extract-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extractPayload)
      });
      setExtractApiStatus(String(extractResponse.status));
      if (!extractResponse.ok) {
        const err = await extractResponse.text();
        throw new Error(`Extract API error ${extractResponse.status}: ${err}`);
      }
      
      const extractData = await extractResponse.json();
      if (extractData.success) {
        setResumeData(extractData.data);
        setBuilderMode(true); // Switch to Builder Mode automatically
        setExtractPreview(extractData.data);
      }

      // Legacy PDF handling for Editor Mode
      if (mimeType.includes('pdf') || file.name.toLowerCase().endsWith('.pdf')) {
         const base64 = await fileToBase64(file);
         const response = await fetch('/api/parse-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64, mimeType }),
        });
        setParsePdfStatus(String(response.status));
        if (!response.ok) {
            const err = await response.text();
            throw new Error(`parse-pdf API error ${response.status}: ${err}`);
        }
        const data = await response.json();
        if (data.success) setEditorContent(data.html);
      }

    } catch (error) {
      console.error('Error processing file:', error);
      const message = error instanceof Error ? error.message : String(error);
      alert('Error processing file: ' + message);
      setUploadedFileName(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTailor = async () => {
    if (!jobDescription.trim()) {
      alert('Please enter a job description');
      return;
    }
    
    if (!editorContent) {
      alert('Please upload a resume first');
      return;
    }

    setIsTailoring(true);
    try {
      const response = await fetch('/api/tailor-html', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: editorContent,
          jobDescription: jobDescription,
        }),
      });

      const data = await response.json();

      if (data.success && data.tailoredHtml) {
        setTailoredContent(data.tailoredHtml);
        setViewMode('review');
      } else {
        throw new Error(data.error || 'Failed to tailor resume');
      }
    } catch (error) {
      console.error('Error tailoring resume:', error);
      alert('Error tailoring resume. Please try again.');
    } finally {
      setIsTailoring(false);
    }
  };

  const cleanHtml = (html: string) => {
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const highlights = tempDiv.querySelectorAll('span[style*="background-color: #dcfce7"]');
      highlights.forEach(span => {
        const parent = span.parentNode;
        if (parent) {
          while (span.firstChild) {
            parent.insertBefore(span.firstChild, span);
          }
          parent.removeChild(span);
        }
      });
      return tempDiv.innerHTML;
    } catch (e) {
      console.error('Error cleaning HTML:', e);
      return html;
    }
  };

  const handleAnalyze = async () => {
    // Determine content to analyze (Tailored vs Original)
    let contentToAnalyze = editorContent;
    if (viewMode === 'review' && tailoredContent) {
      contentToAnalyze = cleanHtml(tailoredContent);
    }

    if (!contentToAnalyze) {
      alert('Please upload a resume first');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-ats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: contentToAnalyze,
          jobDescription: jobDescription,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAtsAnalysis(data.analysis);
      } else {
        throw new Error(data.error || 'Failed to analyze resume');
      }
    } catch (error) {
      console.error('Error analyzing resume:', error);
      alert('Error analyzing resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeywordClick = async (keyword: string) => {
    setIsGeneratingBullet(true);
    try {
      const response = await fetch('/api/generate-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword }),
      });
      const data = await response.json();
      if (data.success) {
        setGeneratedBullet(data.bulletPoint);
      } else {
        alert('Failed to generate bullet point');
      }
    } catch (error) {
      console.error('Error generating bullet:', error);
      alert('Error generating bullet point');
    } finally {
      setIsGeneratingBullet(false);
    }
  };

  const acceptChanges = () => {
    if (tailoredContent) {
      setEditorContent(cleanHtml(tailoredContent));
      setTailoredContent(null);
      setViewMode('edit');
    }
  };

  const discardChanges = () => {
    setTailoredContent(null);
    setViewMode('edit');
  };

  const handleSyncFromEditor = async () => {
    if (!editorContent) {
        alert("No content to sync from editor.");
        return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/extract-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: editorContent })
      });
      const data = await response.json();
      if (data.success) {
        setResumeData(data.data);
        alert('Synced successfully from Editor!');
      } else {
        alert('Sync failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Sync failed');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBuilderMode = async (targetMode: boolean) => {
    if (targetMode === builderMode) return;

    if (targetMode) {
      // Switching to Builder Mode (Editor -> Builder)
      setIsLoading(true);
      try {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = editorContent;
        const text = tempDiv.innerText || tempDiv.textContent || "";

        if (!text.trim()) {
            setBuilderMode(true);
            setIsLoading(false);
            return;
        }

        const response = await fetch('/api/extract-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        if (data.success) {
          setResumeData(data.data);
          setBuilderMode(true);
        } else {
          throw new Error(data.error || 'Failed to sync changes to builder');
        }
      } catch (error) {
        console.error('Sync error:', error);
        alert(`Error syncing to builder: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Switching to Editor Mode (Builder -> Editor)
      setBuilderMode(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!resumeData) {
      alert('No resume data available. Please create or load a resume first.');
      return;
    }

    setIsExporting(true);
    try {
      // Use react-to-print for perfect PDF export
      handlePrint();
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF');
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
    }
  };

  const handleSave = async () => {
    if (!resumeData) return;
    setIsSaving(true);
    try {
        await saveResume(resumeData, "My Resume");
        alert("Resume saved successfully!");
    } catch (error) {
        console.error("Failed to save resume:", error);
        alert("Failed to save resume. Please try again.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleExportDOCX = async () => {
    if (!resumeData) {
      alert('No resume data available. Please create or load a resume first.');
      return;
    }

    setIsExporting(true);
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeData,
          templateName: activeTemplate
        })
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      saveAs(blob, 'resume.docx');
    } catch (error) {
      console.error('Export DOCX failed:', error);
      alert('Failed to export DOCX');
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
    }
  };

  return (
    <>
      <TemplateSelector 
        isOpen={showTemplateSelector} 
        onClose={() => setShowTemplateSelector(false)} 
        currentTemplate={activeTemplate}
        onSelect={setActiveTemplate}
      />
      <ExportModal 
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExportPDF={handleDownloadPDF}
        onExportDOCX={handleExportDOCX}
        isExporting={isExporting}
      />
      <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
        <Sidebar activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as any)} />
        
        <main className="flex-1 flex flex-col h-screen overflow-hidden relative transition-all duration-300">
            {/* Top Navigation / Header */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-slate-800">
                        {activeTab === 'editor' ? 'Resume Editor' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </h2>
                    {/* Builder/Editor Toggle */}
                    {resumeData && activeTab === 'editor' && (
                        <div className="flex bg-slate-100 rounded-lg p-1 text-xs font-medium">
                            <button
                                onClick={() => toggleBuilderMode(false)}
                                className={`px-3 py-1.5 rounded-md transition-all ${!builderMode ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Editor
                            </button>
                            <button
                                onClick={() => toggleBuilderMode(true)}
                                className={`px-3 py-1.5 rounded-md transition-all ${builderMode ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Builder
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {builderMode && activeTab === 'editor' && (
                        <>
                            <div className="flex items-center gap-2 mr-2">
                                <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-200 shadow-sm cursor-pointer relative group">
                                    <input 
                                        type="color" 
                                        value={accentColor}
                                        onChange={(e) => setAccentColor(e.target.value)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        title="Accent Color"
                                    />
                                    <div className="w-full h-full" style={{ backgroundColor: accentColor }} />
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowTemplateSelector(true)}
                                className="px-3 py-1.5 border border-slate-200 rounded-md text-sm bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                            >
                                <Palette size={14} />
                                <span className="capitalize">{activeTemplate}</span>
                            </button>
                            <button 
                                onClick={handleSyncFromEditor}
                                disabled={isLoading}
                                className="px-3 py-1.5 border border-slate-200 rounded-md text-sm bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                                title="Sync content from the Legacy Editor to the Builder"
                            >
                                <span className="text-xs font-medium">Sync from Editor</span>
                            </button>
                        </>
                    )}
                    {activeTab === 'editor' && (
                        <>
                            <button 
                                onClick={handleSave}
                                disabled={isSaving || !resumeData}
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md text-sm font-medium flex items-center gap-2 disabled:opacity-50 shadow-sm transition-all"
                            >
                                {isSaving ? (
                                    <span className="animate-spin">⟳</span>
                                ) : (
                                    <Save size={16} />
                                )}
                                Save
                            </button>
                            <button 
                                onClick={() => setShowExportModal(true)}
                                disabled={isExporting}
                                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-sm font-medium flex items-center gap-2 disabled:opacity-50 shadow-sm transition-all"
                            >
                                {isExporting ? (
                                    <>
                                        <span className="animate-spin">⟳</span>
                                        <span>Exporting...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Export PDF</span>
                                    </>
                                )}
                            </button>
                        </>
                    )}
                    
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="text-slate-600 hover:text-slate-900 font-medium text-sm px-3 py-2">
                                Sign In
                            </button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                            <button className="bg-indigo-600 text-white rounded-md font-medium text-sm px-4 py-2 hover:bg-indigo-700 transition-colors">
                                Sign Up
                            </button>
                        </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                </div>
            </header>
        
            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">
                {/* Center Stage */}
                <div className="flex-1 bg-slate-100/50 relative flex flex-col overflow-hidden">
                    {/* Content */}
                    {activeTab === 'editor' ? (
                        builderMode && resumeData ? (
                            <div ref={containerRef} className="w-full h-full flex justify-center items-start py-8 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                                <ResumePreview 
                                    id="resume-preview-container" 
                                    data={resumeData} 
                                    templateName={activeTemplate} 
                                    colorAccent={accentColor}
                                    isEditing={!isExporting}
                                    onUpdate={(updatedData) => {
                                      setResumeData(updatedData);
                                      updateResumeData(updatedData);
                                    }}
                                    scale={scale}
                                />
                            </div>
                        ) : (
                            /* Legacy Editor */
                            <div className="flex-1 flex flex-col relative h-full overflow-hidden">
                                {/* Editor Toolbar Area */}
                                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent p-8 flex flex-col items-center">
                                    {isLoading ? (
                                        <div className="flex items-center justify-center h-full text-slate-500">
                                            <div className="animate-pulse flex flex-col items-center">
                                                <div className="h-8 w-8 bg-indigo-200 rounded-full mb-2"></div>
                                                Converting document...
                                            </div>
                                        </div>
                                    ) : viewMode === 'review' && tailoredContent ? (
                                        <div className="w-full max-w-6xl flex gap-6 h-full">
                                            {/* Side-by-Side Comparison */}
                                            <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                                <div className="p-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider border-b bg-slate-50">Original</div>
                                                <div className="flex-1 overflow-y-auto p-4 opacity-75 grayscale-[30%]">
                                                    <ReactQuill 
                                                        theme="snow" 
                                                        value={editorContent} 
                                                        readOnly={true}
                                                        modules={{ toolbar: false }}
                                                        className="h-full"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1 flex flex-col bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden relative ring-1 ring-indigo-500/20">
                                                <div className="p-3 text-center text-xs font-bold text-emerald-600 uppercase tracking-wider border-b bg-emerald-50">Tailored Result</div>
                                                <div className="flex-1 overflow-y-auto p-4">
                                                    <ReactQuill 
                                                        theme="snow" 
                                                        value={tailoredContent} 
                                                        readOnly={true}
                                                        modules={{ toolbar: false }}
                                                        className="h-full"
                                                    />
                                                </div>
                                                
                                                {/* Floating Action Bar */}
                                                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 bg-white p-1.5 rounded-full shadow-xl border border-slate-200 z-10">
                                                    <button 
                                                        onClick={discardChanges}
                                                        className="px-5 py-2 text-red-600 hover:bg-red-50 rounded-full text-sm font-medium transition-colors"
                                                    >
                                                        Discard
                                                    </button>
                                                    <button 
                                                        onClick={acceptChanges}
                                                        className="px-5 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-full text-sm font-medium shadow-md transition-all hover:scale-105"
                                                    >
                                                        Accept Changes
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <CustomToolbar />
                                            <div className="a4-paper shadow-xl transition-all duration-300">
                                                <ReactQuill 
                                                    theme="snow" 
                                                    value={editorContent} 
                                                    onChange={setEditorContent} 
                                                    modules={modules}
                                                    className="h-full"
                                                    preserveWhitespace
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )
                    ) : activeTab === 'dashboard' ? (
                        <Dashboard 
                            onEdit={(id) => setActiveTab('editor')}
                            onCreate={() => setActiveTab('editor')}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-400">
                            <div className="text-center">
                                <Layout size={48} className="mx-auto mb-4 opacity-50" />
                                <p>This section is under construction.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel: Job Description & Tools */}
                <div className={`bg-white border-l border-slate-200 flex flex-col transition-all duration-300 ease-in-out ${(showJdPanel && activeTab === 'editor') ? 'w-[400px]' : 'w-0 overflow-hidden border-none'}`}>
                    {/* Tabs */}
                    <div className="flex border-b border-slate-200">
                        <button
                            onClick={() => setRightPanelTab('jd')}
                            className={`flex-1 py-4 text-sm font-medium text-center transition-colors relative ${
                                rightPanelTab === 'jd' 
                                    ? 'text-indigo-600 bg-indigo-50/50' 
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            Job Description
                            {rightPanelTab === 'jd' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></div>}
                        </button>
                        <button
                            onClick={() => setRightPanelTab('analysis')}
                            className={`flex-1 py-4 text-sm font-medium text-center transition-colors relative ${
                                rightPanelTab === 'analysis' 
                                    ? 'text-indigo-600 bg-indigo-50/50' 
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            ATS Analysis
                            {rightPanelTab === 'analysis' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></div>}
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200">
                        {rightPanelTab === 'jd' ? (
                            <div className="flex flex-col h-full">
                                <div className="mb-6">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Role</label>
                                    <textarea
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        placeholder="Paste the job description here..."
                                        className="w-full h-64 p-4 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                                
                                <div className="mb-6">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Upload Resume</label>
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-indigo-50 rounded-lg border border-dashed border-indigo-200 group-hover:border-indigo-400 transition-colors pointer-events-none"></div>
                                        <input 
                                            type="file" 
                                            accept=".docx,.pdf" 
                                            onChange={handleFileUpload}
                                            className="relative z-10 w-full p-8 opacity-0 cursor-pointer"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span className="text-sm font-medium text-indigo-600">Click to upload or drag file</span>
                                        </div>
                                    </div>
                                </div>
                                    {uploadedFileName && (
                                      <div className="mt-2 text-xs text-slate-600">Selected file: <span className="font-medium">{uploadedFileName}</span></div>
                                    )}
                                    <div className="mt-2 text-xs text-slate-400">
                                        <div className="mb-1">Upload Diagnostics</div>
                                        <div>isLoading: <span className="font-mono">{String(isLoading)}</span></div>
                                        <div>Extract API: <span className="font-mono">{extractApiStatus || 'idle'}</span></div>
                                        <div>Parse PDF: <span className="font-mono">{parsePdfStatus || 'idle'}</span></div>
                                    </div>
                                    {extractPreview && (
                                      <div className="mt-3 bg-gray-50 rounded p-2 border border-slate-200 text-xs overflow-auto max-h-40">
                                        <strong className="text-slate-700">Extract Preview (JSON):</strong>
                                        <pre className="text-xs mt-2 p-2">{JSON.stringify(extractPreview, null, 2)}</pre>
                                      </div>
                                    )}

                                <button
                                    onClick={handleTailor}
                                    disabled={isTailoring || !editorContent}
                                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 transition-all transform active:scale-[0.98]"
                                >
                                    {isTailoring ? (
                                        <>
                                            <span className="animate-spin">⟳</span> Scanning...
                                        </>
                                    ) : (
                                        'Scan for Match'
                                    )}
                                </button>
                            </div>
                        ) : (
                            <ATSScoreCard 
                                analysis={atsAnalysis} 
                                isLoading={isAnalyzing} 
                                onAnalyze={handleAnalyze} 
                                onKeywordClick={handleKeywordClick}
                            />
                        )}
                    </div>
                </div>
            </div>
      </main>
      </div>

      {/* Print Template - Hidden on screen, visible on print */}
      <div className="print-only">
        <div className="ql-container ql-snow" style={{ border: 'none' }}>
          <div 
            className="ql-editor" 
            dangerouslySetInnerHTML={{ 
              __html: viewMode === 'review' && tailoredContent 
                ? cleanHtml(tailoredContent) // Print clean version of tailored content
                : editorContent 
            }}
          >
          </div>
        </div>
      </div>
      {/* Generated Bullet Modal */}
      {generatedBullet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Suggested Bullet Point
              </h3>
              <button 
                onClick={() => setGeneratedBullet(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-6">
              <p className="text-gray-800 font-medium leading-relaxed">
                {generatedBullet}
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedBullet);
                  // Optional: Show toast
                }}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => setGeneratedBullet(null)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay for Bullet Generation */}
      {isGeneratingBullet && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm font-medium text-gray-700">Generating suggestion...</span>
          </div>
        </div>
      )}

      {/* Hidden Printable Resume for PDF Export */}
      {resumeData && (
        <div className="hidden">
          <PrintableResume
            ref={printRef}
            data={resumeData}
            templateName={activeTemplate}
            colorAccent={accentColor}
          />
        </div>
      )}
    </>
  );
}
