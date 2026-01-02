import React, { useEffect, useState, useRef, useCallback } from 'react';
import { FileText, MoreVertical, Edit, Trash2, Plus, Upload, PenLine, Sparkles, Download, ExternalLink, X, ChevronRight } from 'lucide-react';
import { getUserResumes } from '@/lib/actions/resume';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useUIStore } from '@/lib/stores/uiStore';

const TOUR_DISMISSED_KEY = 'resumex-tour-dismissed';

// Tour step configuration
const TOUR_STEPS = [
  {
    step: 1,
    title: 'Start Your Resume',
    body: 'Upload an existing resume or create one from scratch. This is where every resume begins.',
  },
  {
    step: 2,
    title: 'Edit & Tailor with AI',
    body: 'Open a resume to edit it in the LaTeX workspace or tailor specific sections using AI.',
  },
  {
    step: 3,
    title: 'Export a Professional Resume',
    body: 'Preview your resume, make final edits, and export an ATS-ready PDF.',
  },
] as const;

interface ResumeSummary {
  id: string;
  filename: string;
  updatedAt: Date;
  source: 'pdf' | 'docx' | 'scratch';
}

// Helper function to get relative time
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return `${mins} min${mins > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  return date.toLocaleDateString();
}

// Source badge component
function SourceBadge({ source }: { source: ResumeSummary['source'] }) {
  const config = {
    pdf: { label: 'Imported PDF', className: 'bg-slate-100 text-slate-600' },
    docx: { label: 'Imported DOCX', className: 'bg-slate-100 text-slate-600' },
    scratch: { label: 'Created from Scratch', className: 'bg-slate-100 text-slate-600' },
  };
  
  const { label, className } = config[source];
  
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${className}`}>
      {label}
    </span>
  );
}

interface DashboardProps {
  onEdit: (id: string) => void;
  onCreate: () => void;
}

export default function Dashboard({ onEdit, onCreate }: DashboardProps) {
  const { user } = useUser();
  const { tourStep, setTourStep } = useUIStore();
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTourBanner, setShowTourBanner] = useState(false);
  
  // Refs for scrolling
  const gettingStartedRef = useRef<HTMLElement>(null);
  const recentResumesRef = useRef<HTMLElement>(null);
  const exportCardRef = useRef<HTMLAnchorElement>(null);

  // Check if tour banner should be shown
  useEffect(() => {
    const isDismissed = localStorage.getItem(TOUR_DISMISSED_KEY) === 'true';
    if (!isDismissed && !isLoading) {
      setShowTourBanner(true);
    }
  }, [isLoading]);

  // Complete and dismiss tour
  const completeTour = useCallback(() => {
    localStorage.setItem(TOUR_DISMISSED_KEY, 'true');
    setShowTourBanner(false);
    setTourStep(null);
  }, [setTourStep]);

  // Exit tour without completing
  const exitTour = useCallback(() => {
    setTourStep(null);
  }, [setTourStep]);

  // Start the tour
  const startTour = useCallback(() => {
    setTourStep(1);
    gettingStartedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [setTourStep]);

  // Go to next step
  const nextStep = useCallback(() => {
    if (tourStep === 1) {
      setTourStep(2);
      recentResumesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (tourStep === 2) {
      setTourStep(3);
      // Scroll to show the export card or stay in view
      exportCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (tourStep === 3) {
      completeTour();
    }
  }, [tourStep, setTourStep, completeTour]);

  // Handle Escape key to exit tour
  useEffect(() => {
    if (!tourStep) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        exitTour();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [tourStep, exitTour]);

  // Get current tour step info
  const currentStepInfo = tourStep ? TOUR_STEPS.find(s => s.step === tourStep) : null;

  useEffect(() => {
    async function fetchResumes() {
      try {
        const data = await getUserResumes();
        const formatted = data.map((r: any) => ({
            id: r.id,
            filename: r.title,
            updatedAt: new Date(r.updatedAt),
            source: r.source || 'scratch', // Default to scratch if not specified
        }));
        setResumes(formatted);
      } catch (error) {
        console.error("Failed to fetch resumes", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchResumes();
  }, []);

  return (
    <>
      {/* Light overlay when tour is active */}
      {tourStep && (
        <div className="fixed inset-0 bg-slate-900/10 pointer-events-none z-40" />
      )}

      {/* Floating Tour Guide Panel - rendered at root level for proper fixed positioning */}
      {tourStep && currentStepInfo && (
        <div className="fixed bottom-6 right-6 z-[100] w-80 bg-white rounded-xl shadow-2xl border border-slate-200">
          {/* Progress indicator */}
          <div className="h-1 bg-slate-100 rounded-t-xl overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${(tourStep / 3) * 100}%` }}
            />
          </div>
          
          <div className="p-4">
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                {tourStep}
              </span>
              <span className="text-xs text-slate-500 font-medium">Step {tourStep} of 3</span>
            </div>
            
            {/* Content */}
            <h3 className="text-base font-semibold text-slate-900 mb-1">{currentStepInfo.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{currentStepInfo.body}</p>
            
            {/* Buttons */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={exitTour}
                className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
              >
                Exit Tour
              </button>
              <button
                onClick={nextStep}
                className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {tourStep === 3 ? 'Finish' : 'Next'}
                {tourStep !== 3 && <ChevronRight size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500 mt-1">Welcome back, {user?.firstName || 'User'}</p>
            </div>
            <button 
                onClick={onCreate}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
            >
                <Plus size={18} /> New Resume
            </button>
        </div>

        {/* Quick Tour Banner */}
        {showTourBanner && !tourStep && (
          <div className="mb-6 flex items-center justify-between gap-4 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} className="text-indigo-600" />
              </div>
              <p className="text-sm text-slate-700">
                <span className="font-medium">New here?</span> Build, tailor, and export your resume in under a minute.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={startTour}
                className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-md transition-colors"
              >
                Take a Quick Tour
              </button>
              <button
                onClick={completeTour}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                aria-label="Dismiss tour banner"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Getting Started Section */}
        <section 
          ref={gettingStartedRef}
          className={`mb-8 transition-all duration-300 rounded-lg relative ${tourStep === 1 ? 'bg-indigo-50/80 ring-2 ring-indigo-400 p-4 z-50' : ''}`}
        >
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Getting Started</h2>
            <p className="text-sm text-slate-500 mt-0.5">Quick ways to use Resumex</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Upload Resume */}
            <Link 
              href="/latex"
              className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Upload size={18} className="text-slate-600" />
              </div>
              <div className="min-w-0">
                <h3 className="font-medium text-slate-900 text-sm">Upload Resume</h3>
                <p className="text-xs text-slate-500 mt-0.5">Import PDF or DOCX and edit in LaTeX</p>
              </div>
            </Link>

            {/* Create from Scratch */}
            <Link 
              href="/create-resume"
              className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <PenLine size={18} className="text-slate-600" />
              </div>
              <div className="min-w-0">
                <h3 className="font-medium text-slate-900 text-sm">Create from Scratch</h3>
                <p className="text-xs text-slate-500 mt-0.5">Build a resume step by step</p>
              </div>
            </Link>

            {/* Tailor to Job Description */}
            <Link 
              href="/latex"
              className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Sparkles size={18} className="text-slate-600" />
              </div>
              <div className="min-w-0">
                <h3 className="font-medium text-slate-900 text-sm">Tailor to Job Description</h3>
                <p className="text-xs text-slate-500 mt-0.5">Optimize sections using AI</p>
              </div>
            </Link>

            {/* Export Resume */}
            <Link 
              ref={exportCardRef}
              href="/latex"
              className={`flex items-start gap-3 p-4 bg-white border rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer ${tourStep === 3 ? 'border-indigo-400 ring-2 ring-indigo-400 z-50 relative' : 'border-slate-200'}`}
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Download size={18} className="text-slate-600" />
              </div>
              <div className="min-w-0">
                <h3 className="font-medium text-slate-900 text-sm">Export Resume</h3>
                <p className="text-xs text-slate-500 mt-0.5">Download ATS-ready PDF</p>
              </div>
            </Link>
          </div>
        </section>
        
        {/* Recent Resumes Section */}
        <section
          ref={recentResumesRef}
          className={`transition-all duration-300 rounded-lg relative ${tourStep === 2 ? 'bg-indigo-50/80 ring-2 ring-indigo-400 p-4 z-50' : ''}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Recent Resumes</h2>
            {resumes.length > 0 && (
              <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View All</button>
            )}
          </div>
          
          {isLoading ? (
             <div className="flex items-center justify-center h-64 text-slate-400">Loading resumes...</div>
          ) : resumes.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-slate-200 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <FileText size={24} className="text-slate-400" />
              </div>
              <h3 className="text-base font-medium text-slate-900 mb-1">No resumes yet</h3>
              <p className="text-sm text-slate-500 mb-6 text-center">Get started by uploading an existing resume or creating one from scratch.</p>
              <div className="flex items-center gap-3">
                <Link
                  href="/latex"
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  <Upload size={16} /> Upload Resume
                </Link>
                <Link
                  href="/create-resume"
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <PenLine size={16} /> Create Resume
                </Link>
              </div>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.map((resume) => (
              <div key={resume.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col">
                {/* Card Content */}
                <div className="p-4 flex flex-col gap-3">
                  {/* Header with title and source badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 
                        className="font-medium text-slate-900 text-sm truncate cursor-pointer hover:text-indigo-600 transition-colors" 
                        onClick={() => onEdit(resume.id)} 
                        title={resume.filename}
                      >
                        {resume.filename}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">Edited {getRelativeTime(resume.updatedAt)}</p>
                    </div>
                    <SourceBadge source={resume.source} />
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button 
                      onClick={() => onEdit(resume.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-md hover:bg-slate-50 hover:border-slate-300 transition-colors"
                    >
                      <ExternalLink size={12} /> Open
                    </button>
                    <button 
                      onClick={() => onEdit(resume.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-md hover:bg-slate-50 hover:border-slate-300 transition-colors"
                    >
                      <Download size={12} /> Export PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </section>
      </div>
    </div>
    </>
  );
}
