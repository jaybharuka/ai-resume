'use client'

import React, { memo, useCallback, useState, useRef, useEffect } from 'react'
import { ResumeData, Experience, Education, Project, Certification, Award, CustomSection } from '@/types/resume'
import { ChevronDown, ChevronRight, Plus, Trash2, Sparkles, Loader2, Undo2, Check, X } from 'lucide-react'

interface VisualEditorProps {
  data: ResumeData
  onChange: (data: ResumeData) => void
}

// Maximum undo history size
const MAX_UNDO_HISTORY = 20

// Types for sub-components
interface SectionProps {
  title: string
  sectionKey: string
  hasData: boolean
  isExpanded: boolean
  onToggle: (key: string) => void
  children: React.ReactNode
}

interface SummaryEditorProps {
  summary: string
  resumeData: ResumeData
  onChange: (summary: string) => void
}

interface CertificationsEditorProps {
  certifications: Certification[]
  onChange: (certifications: Certification[]) => void
}

interface AwardsEditorProps {
  awards: (string | Award)[]
  onChange: (awards: (string | Award)[]) => void
}

interface CustomSectionsEditorProps {
  customSections: CustomSection[]
  onChange: (customSections: CustomSection[]) => void
}

// Memoized Section component - defined OUTSIDE the main component
const Section = memo<SectionProps>(({ title, sectionKey, hasData, isExpanded, onToggle, children }) => {
  const handleClick = useCallback(() => {
    onToggle(sectionKey)
  }, [onToggle, sectionKey])

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button
        type="button"
        onClick={handleClick}
        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        {hasData && (
          <span className="text-xs bg-gray-500 text-white px-2 py-0.5 rounded">
            Has Data
          </span>
        )}
      </button>
      {isExpanded && (
        <div className="p-4 bg-white space-y-3">
          {children}
        </div>
      )}
    </div>
  )
})
Section.displayName = 'Section'

// Memoized SummaryEditor component with AI preview confirmation
const SummaryEditor = memo<SummaryEditorProps>(({ summary, resumeData, onChange }) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewSummary, setPreviewSummary] = useState<string | null>(null)

  const generateAISummary = useCallback(async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData }),
      })
      
      if (response.ok) {
        const { summary: generatedSummary } = await response.json()
        // Show preview instead of directly applying
        setPreviewSummary(generatedSummary)
      }
    } catch (error) {
      console.error('Failed to generate summary:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [resumeData])

  const confirmSummary = useCallback(() => {
    if (previewSummary) {
      onChange(previewSummary)
      setPreviewSummary(null)
    }
  }, [previewSummary, onChange])

  const cancelPreview = useCallback(() => {
    setPreviewSummary(null)
  }, [])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }, [onChange])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-500">Professional Summary</label>
        <button
          type="button"
          onClick={generateAISummary}
          disabled={isGenerating || previewSummary !== null}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white text-xs rounded-md transition-colors"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3" />
              AI Generate
            </>
          )}
        </button>
      </div>
      
      {/* AI Preview Panel */}
      {previewSummary !== null && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-indigo-700">AI Generated Preview</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={confirmSummary}
                className="flex items-center gap-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded transition-colors"
              >
                <Check className="w-3 h-3" />
                Apply
              </button>
              <button
                type="button"
                onClick={cancelPreview}
                className="flex items-center gap-1 px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{previewSummary}</p>
        </div>
      )}
      
      <textarea
        value={summary || ''}
        onChange={handleChange}
        rows={4}
        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="A brief professional summary..."
      />
    </div>
  )
})
SummaryEditor.displayName = 'SummaryEditor'

// Memoized CertificationsEditor component
const CertificationsEditor = memo<CertificationsEditorProps>(({ certifications = [], onChange }) => {
  const addCertification = useCallback(() => {
    onChange([...certifications, { name: '', issuer: '', date: '' }])
  }, [certifications, onChange])

  const removeCertification = useCallback((index: number) => {
    onChange(certifications.filter((_, i) => i !== index))
  }, [certifications, onChange])

  const updateCertification = useCallback((index: number, field: keyof Certification, value: string) => {
    const updated = [...certifications]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }, [certifications, onChange])

  return (
    <div className="space-y-3">
      {certifications.map((cert, index) => (
        <div key={index} className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Certification {index + 1}</span>
            <button
              type="button"
              onClick={() => removeCertification(index)}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            value={cert.name || ''}
            onChange={(e) => updateCertification(index, 'name', e.target.value)}
            placeholder="Certification Name"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={cert.issuer || ''}
              onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
              placeholder="Issuer"
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              value={cert.date || ''}
              onChange={(e) => updateCertification(index, 'date', e.target.value)}
              placeholder="Date"
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addCertification}
        className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
      >
        <Plus className="w-4 h-4" /> Add Certification
      </button>
    </div>
  )
})
CertificationsEditor.displayName = 'CertificationsEditor'

// Helper to get award as object
const getAwardAsObject = (award: string | Award): Award => {
  if (typeof award === 'string') {
    return { title: award }
  }
  return award
}

// Memoized AwardsEditor component
const AwardsEditor = memo<AwardsEditorProps>(({ awards = [], onChange }) => {
  const addAward = useCallback(() => {
    onChange([...awards, { title: '', issuer: '', date: '' }])
  }, [awards, onChange])

  const removeAward = useCallback((index: number) => {
    onChange(awards.filter((_, i) => i !== index))
  }, [awards, onChange])

  const updateAward = useCallback((index: number, field: keyof Award, value: string) => {
    const updated = [...awards]
    const currentAward = getAwardAsObject(updated[index])
    updated[index] = { ...currentAward, [field]: value }
    onChange(updated)
  }, [awards, onChange])

  return (
    <div className="space-y-3">
      {awards.map((award, index) => {
        const awardObj = getAwardAsObject(award)
        return (
          <div key={index} className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Award {index + 1}</span>
              <button
                type="button"
                onClick={() => removeAward(index)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              value={awardObj.title || ''}
              onChange={(e) => updateAward(index, 'title', e.target.value)}
              placeholder="Award Title"
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={awardObj.issuer || ''}
                onChange={(e) => updateAward(index, 'issuer', e.target.value)}
                placeholder="Issuer"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                value={awardObj.date || ''}
                onChange={(e) => updateAward(index, 'date', e.target.value)}
                placeholder="Date"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )
      })}
      <button
        type="button"
        onClick={addAward}
        className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
      >
        <Plus className="w-4 h-4" /> Add Award
      </button>
    </div>
  )
})
AwardsEditor.displayName = 'AwardsEditor'

// Memoized CustomSectionsEditor component
const CustomSectionsEditor = memo<CustomSectionsEditorProps>(({ customSections = [], onChange }) => {
  const addSection = useCallback(() => {
    onChange([...customSections, { title: '', content: '' }])
  }, [customSections, onChange])

  const removeSection = useCallback((index: number) => {
    onChange(customSections.filter((_, i) => i !== index))
  }, [customSections, onChange])

  const updateSection = useCallback((index: number, field: 'title' | 'content', value: string) => {
    const updated = [...customSections]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }, [customSections, onChange])

  return (
    <div className="space-y-3">
      {customSections.map((section, index) => (
        <div key={index} className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Section {index + 1}</span>
            <button
              type="button"
              onClick={() => removeSection(index)}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            value={section.title || ''}
            onChange={(e) => updateSection(index, 'title', e.target.value)}
            placeholder="Section Title"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <textarea
            value={section.content || ''}
            onChange={(e) => updateSection(index, 'content', e.target.value)}
            placeholder="Section Content"
            rows={3}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addSection}
        className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
      >
        <Plus className="w-4 h-4" /> Add Custom Section
      </button>
    </div>
  )
})
CustomSectionsEditor.displayName = 'CustomSectionsEditor'

// Main VisualEditor component
export function VisualEditor({ data, onChange }: VisualEditorProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['personalInfo', 'summary', 'experience', 'education', 'skills'])
  )
  
  // Undo history state
  const [undoHistory, setUndoHistory] = useState<ResumeData[]>([])
  const isUndoing = useRef(false)
  
  // Use ref to preserve scroll position
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollPositionRef = useRef<number>(0)

  // Save scroll position before any state update
  const saveScrollPosition = useCallback(() => {
    if (containerRef.current) {
      scrollPositionRef.current = containerRef.current.scrollTop
    }
  }, [])

  // Restore scroll position after render
  useEffect(() => {
    if (containerRef.current && scrollPositionRef.current > 0) {
      containerRef.current.scrollTop = scrollPositionRef.current
    }
  })

  // Save to undo history before making changes
  const saveToHistory = useCallback(() => {
    if (isUndoing.current || !data) return
    setUndoHistory(prev => {
      const newHistory = [...prev, JSON.parse(JSON.stringify(data))]
      // Limit history size
      if (newHistory.length > MAX_UNDO_HISTORY) {
        return newHistory.slice(-MAX_UNDO_HISTORY)
      }
      return newHistory
    })
  }, [data])

  // Undo last change
  const handleUndo = useCallback(() => {
    if (undoHistory.length === 0) return
    isUndoing.current = true
    saveScrollPosition()
    const previousState = undoHistory[undoHistory.length - 1]
    setUndoHistory(prev => prev.slice(0, -1))
    onChange(previousState)
    // Reset the undoing flag after a short delay
    setTimeout(() => {
      isUndoing.current = false
    }, 100)
  }, [undoHistory, onChange, saveScrollPosition])

  const toggleExpand = useCallback((section: string) => {
    saveScrollPosition()
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }, [saveScrollPosition])

  const handleSectionChange = useCallback(<K extends keyof ResumeData>(
    section: K,
    value: ResumeData[K]
  ) => {
    saveScrollPosition()
    saveToHistory()
    onChange({
      ...data,
      [section]: value,
    })
  }, [data, onChange, saveScrollPosition, saveToHistory])

  // Memoized handlers for nested updates
  const handlePersonalInfoChange = useCallback((field: string, value: string) => {
    saveScrollPosition()
    saveToHistory()
    onChange({
      ...data,
      personalInfo: {
        ...data.personalInfo,
        [field]: value,
      },
    })
  }, [data, onChange, saveScrollPosition, saveToHistory])

  const handleExperienceChange = useCallback((index: number, field: string, value: string | string[]) => {
    saveScrollPosition()
    saveToHistory()
    const updated = [...(data.experience || [])]
    updated[index] = { ...updated[index], [field]: value }
    onChange({ ...data, experience: updated })
  }, [data, onChange, saveScrollPosition, saveToHistory])

  const addExperience = useCallback(() => {
    saveScrollPosition()
    saveToHistory()
    onChange({
      ...data,
      experience: [
        ...(data.experience || []),
        { company: '', title: '', location: '', startDate: '', endDate: '', bullets: [] }
      ]
    })
  }, [data, onChange, saveScrollPosition, saveToHistory])

  const removeExperience = useCallback((index: number) => {
    saveScrollPosition()
    saveToHistory()
    onChange({
      ...data,
      experience: data.experience?.filter((_, i) => i !== index)
    })
  }, [data, onChange, saveScrollPosition, saveToHistory])

  const handleEducationChange = useCallback((index: number, field: string, value: string | string[]) => {
    saveScrollPosition()
    saveToHistory()
    const updated = [...(data.education || [])]
    updated[index] = { ...updated[index], [field]: value }
    onChange({ ...data, education: updated })
  }, [data, onChange, saveScrollPosition, saveToHistory])

  const addEducation = useCallback(() => {
    saveScrollPosition()
    saveToHistory()
    onChange({
      ...data,
      education: [
        ...(data.education || []),
        { institution: '', degree: '', graduationDate: '', gpa: '' }
      ]
    })
  }, [data, onChange, saveScrollPosition, saveToHistory])

  const removeEducation = useCallback((index: number) => {
    saveScrollPosition()
    saveToHistory()
    onChange({
      ...data,
      education: data.education?.filter((_, i) => i !== index)
    })
  }, [data, onChange, saveScrollPosition, saveToHistory])

  const handleProjectChange = useCallback((index: number, field: string, value: string | string[]) => {
    saveScrollPosition()
    saveToHistory()
    const updated = [...(data.projects || [])]
    updated[index] = { ...updated[index], [field]: value }
    onChange({ ...data, projects: updated })
  }, [data, onChange, saveScrollPosition, saveToHistory])

  const addProject = useCallback(() => {
    saveScrollPosition()
    saveToHistory()
    onChange({
      ...data,
      projects: [
        ...(data.projects || []),
        { name: '', description: '', technologies: [], url: '' }
      ]
    })
  }, [data, onChange, saveScrollPosition, saveToHistory])

  const removeProject = useCallback((index: number) => {
    saveScrollPosition()
    saveToHistory()
    onChange({
      ...data,
      projects: data.projects?.filter((_, i) => i !== index)
    })
  }, [data, onChange, saveScrollPosition, saveToHistory])

  // Return empty state if no resume data
  if (!data) {
    return (
      <div className="h-full overflow-y-auto bg-gray-50 p-4 flex items-center justify-center">
        <p className="text-gray-500">Upload a resume or start editing to see the visual editor.</p>
      </div>
    )
  }

  // Check if sections have data
  const hasPersonalInfoData = !!(data.personalInfo?.name || data.personalInfo?.email)
  const hasSummaryData = !!data.summary
  const hasExperienceData = (data.experience?.length || 0) > 0
  const hasEducationData = (data.education?.length || 0) > 0
  const hasSkillsData = (data.skills?.length || 0) > 0
  const hasProjectsData = (data.projects?.length || 0) > 0
  const hasCertificationsData = (data.certifications?.length || 0) > 0
  const hasAwardsData = (data.awards?.length || 0) > 0
  const hasCustomSectionsData = (data.customSections?.length || 0) > 0

  return (
    <div 
      ref={containerRef}
      className="h-full overflow-y-auto bg-gray-50 p-4 space-y-4"
    >
      {/* Undo Button - Floating at top */}
      <div className="flex justify-end sticky top-0 z-10 pb-2">
        <button
          type="button"
          onClick={handleUndo}
          disabled={undoHistory.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-700 text-xs rounded-md transition-colors shadow-sm"
          title={undoHistory.length > 0 ? `Undo (${undoHistory.length} changes)` : 'No changes to undo'}
        >
          <Undo2 className="w-3.5 h-3.5" />
          Undo {undoHistory.length > 0 && `(${undoHistory.length})`}
        </button>
      </div>

      {/* Personal Information */}
      <Section
        title="Personal Information"
        sectionKey="personalInfo"
        hasData={hasPersonalInfoData}
        isExpanded={expandedSections.has('personalInfo')}
        onToggle={toggleExpand}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-500">Full Name</label>
            <input
              type="text"
              value={data.personalInfo?.name || ''}
              onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">Email</label>
            <input
              type="email"
              value={data.personalInfo?.email || ''}
              onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">Phone</label>
            <input
              type="tel"
              value={data.personalInfo?.phone || ''}
              onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">Location</label>
            <input
              type="text"
              value={data.personalInfo?.location || ''}
              onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">LinkedIn</label>
            <input
              type="url"
              value={data.personalInfo?.linkedin || ''}
              onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">GitHub</label>
            <input
              type="url"
              value={data.personalInfo?.github || ''}
              onChange={(e) => handlePersonalInfoChange('github', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="col-span-2">
            <label className="text-sm text-gray-500">Website</label>
            <input
              type="url"
              value={data.personalInfo?.website || ''}
              onChange={(e) => handlePersonalInfoChange('website', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </Section>

      {/* Summary */}
      <Section
        title="Professional Summary"
        sectionKey="summary"
        hasData={hasSummaryData}
        isExpanded={expandedSections.has('summary')}
        onToggle={toggleExpand}
      >
        <SummaryEditor
          summary={data.summary || ''}
          resumeData={data}
          onChange={(summary) => handleSectionChange('summary', summary)}
        />
      </Section>

      {/* Experience */}
      <Section
        title="Work Experience"
        sectionKey="experience"
        hasData={hasExperienceData}
        isExpanded={expandedSections.has('experience')}
        onToggle={toggleExpand}
      >
        <div className="space-y-4">
          {data.experience?.map((exp, index) => (
            <div key={index} className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Position {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeExperience(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={exp.company || ''}
                  onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                  placeholder="Company"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={exp.title || exp.role || ''}
                  onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                  placeholder="Job Title"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={exp.location || ''}
                  onChange={(e) => handleExperienceChange(index, 'location', e.target.value)}
                  placeholder="Location"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={exp.startDate || ''}
                    onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                    placeholder="Start Date"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    value={exp.endDate || ''}
                    onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                    placeholder="End Date"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Bullet Points (one per line)</label>
                <textarea
                  value={(exp.bullets || []).join('\n')}
                  onChange={(e) => handleExperienceChange(index, 'bullets', e.target.value.split('\n').filter(h => h.trim()))}
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="• Achievement or responsibility&#10;• Another bullet point"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addExperience}
            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
          >
            <Plus className="w-4 h-4" /> Add Experience
          </button>
        </div>
      </Section>

      {/* Education */}
      <Section
        title="Education"
        sectionKey="education"
        hasData={hasEducationData}
        isExpanded={expandedSections.has('education')}
        onToggle={toggleExpand}
      >
        <div className="space-y-4">
          {data.education?.map((edu, index) => (
            <div key={index} className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Education {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={edu.institution || edu.school || ''}
                  onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                  placeholder="Institution"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={edu.degree || ''}
                  onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                  placeholder="Degree"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={edu.graduationDate || edu.year || ''}
                  onChange={(e) => handleEducationChange(index, 'graduationDate', e.target.value)}
                  placeholder="Graduation Date"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={edu.gpa || ''}
                  onChange={(e) => handleEducationChange(index, 'gpa', e.target.value)}
                  placeholder="GPA"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <input
                type="text"
                value={edu.honors || ''}
                onChange={(e) => handleEducationChange(index, 'honors', e.target.value)}
                placeholder="Honors"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addEducation}
            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
          >
            <Plus className="w-4 h-4" /> Add Education
          </button>
        </div>
      </Section>

      {/* Skills */}
      <Section
        title="Skills"
        sectionKey="skills"
        hasData={hasSkillsData}
        isExpanded={expandedSections.has('skills')}
        onToggle={toggleExpand}
      >
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-500">Skills (comma separated)</label>
            <textarea
              value={(data.skills || []).join(', ')}
              onChange={(e) => handleSectionChange('skills', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
              rows={3}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="JavaScript, Python, React, Node.js, Leadership, Communication..."
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">Languages (comma separated)</label>
            <textarea
              value={(data.languages || []).join(', ')}
              onChange={(e) => handleSectionChange('languages', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
              rows={1}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="English, Spanish, Mandarin..."
            />
          </div>
        </div>
      </Section>

      {/* Projects */}
      <Section
        title="Projects"
        sectionKey="projects"
        hasData={hasProjectsData}
        isExpanded={expandedSections.has('projects')}
        onToggle={toggleExpand}
      >
        <div className="space-y-4">
          {data.projects?.map((project, index) => (
            <div key={index} className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Project {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeProject(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={project.name || ''}
                onChange={(e) => handleProjectChange(index, 'name', e.target.value)}
                placeholder="Project Name"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <textarea
                value={project.description || ''}
                onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                placeholder="Description"
                rows={2}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                value={(project.technologies || []).join(', ')}
                onChange={(e) => handleProjectChange(index, 'technologies', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                placeholder="Technologies (comma separated)"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="url"
                value={project.url || project.link || ''}
                onChange={(e) => handleProjectChange(index, 'url', e.target.value)}
                placeholder="Project URL"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addProject}
            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
          >
            <Plus className="w-4 h-4" /> Add Project
          </button>
        </div>
      </Section>

      {/* Certifications */}
      <Section
        title="Certifications"
        sectionKey="certifications"
        hasData={hasCertificationsData}
        isExpanded={expandedSections.has('certifications')}
        onToggle={toggleExpand}
      >
        <CertificationsEditor
          certifications={data.certifications || []}
          onChange={(certifications) => handleSectionChange('certifications', certifications)}
        />
      </Section>

      {/* Awards */}
      <Section
        title="Awards & Honors"
        sectionKey="awards"
        hasData={hasAwardsData}
        isExpanded={expandedSections.has('awards')}
        onToggle={toggleExpand}
      >
        <AwardsEditor
          awards={data.awards || []}
          onChange={(awards) => handleSectionChange('awards', awards)}
        />
      </Section>

      {/* Custom Sections */}
      <Section
        title="Custom Sections"
        sectionKey="customSections"
        hasData={hasCustomSectionsData}
        isExpanded={expandedSections.has('customSections')}
        onToggle={toggleExpand}
      >
        <CustomSectionsEditor
          customSections={data.customSections || []}
          onChange={(customSections) => handleSectionChange('customSections', customSections)}
        />
      </Section>
    </div>
  )
}
