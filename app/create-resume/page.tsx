'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronDown, ChevronRight, Plus, Trash2, FileText } from 'lucide-react';
import { ResumeData, Experience, Education, Project, Certification, Award } from '@/types/resume';
import { useResumeStore } from '@/lib/stores/resumeStore';
import { generateLatexFromJSON } from '@/lib/latex/latexAdapter';

// Empty initial state
const getEmptyResumeData = (): ResumeData => ({
  personalInfo: {
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    website: '',
    location: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  awards: [],
});

// Collapsible Section Component
interface SectionCardProps {
  title: string;
  sectionKey: string;
  isExpanded: boolean;
  onToggle: (key: string) => void;
  children: React.ReactNode;
}

function SectionCard({ title, sectionKey, isExpanded, onToggle, children }: SectionCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => onToggle(sectionKey)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
          <span className="font-medium text-gray-900">{title}</span>
        </div>
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}

// Input Field Component
interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}

function InputField({ label, value, onChange, placeholder, type = 'text' }: InputFieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
    </div>
  );
}

// Text Area Component
interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

function TextAreaField({ label, value, onChange, placeholder, rows = 3 }: TextAreaFieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
      />
    </div>
  );
}

export default function CreateResumePage() {
  const router = useRouter();
  const { setResumeData: setStoreResumeData, setOriginalData, setGeneratedLatex, setFromCreatePage } = useResumeStore();
  
  const [resumeData, setResumeData] = useState<ResumeData>(getEmptyResumeData());
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personalInfo: true,
    summary: false,
    education: false,
    experience: false,
    projects: false,
    skills: false,
    certifications: false,
  });

  // Toggle section expand/collapse
  const toggleSection = useCallback((key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Update personal info
  const updatePersonalInfo = useCallback((field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  }, []);

  // Update summary
  const updateSummary = useCallback((value: string) => {
    setResumeData((prev) => ({ ...prev, summary: value }));
  }, []);

  // Experience handlers
  const addExperience = useCallback(() => {
    setResumeData((prev) => ({
      ...prev,
      experience: [...(prev.experience || []), { company: '', title: '', startDate: '', endDate: '', location: '', bullets: [''] }],
    }));
  }, []);

  const removeExperience = useCallback((index: number) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience?.filter((_, i) => i !== index) || [],
    }));
  }, []);

  const updateExperience = useCallback((index: number, field: keyof Experience, value: string | string[]) => {
    setResumeData((prev) => {
      const updated = [...(prev.experience || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experience: updated };
    });
  }, []);

  const addBullet = useCallback((expIndex: number) => {
    setResumeData((prev) => {
      const updated = [...(prev.experience || [])];
      updated[expIndex] = { ...updated[expIndex], bullets: [...updated[expIndex].bullets, ''] };
      return { ...prev, experience: updated };
    });
  }, []);

  const updateBullet = useCallback((expIndex: number, bulletIndex: number, value: string) => {
    setResumeData((prev) => {
      const updated = [...(prev.experience || [])];
      const bullets = [...updated[expIndex].bullets];
      bullets[bulletIndex] = value;
      updated[expIndex] = { ...updated[expIndex], bullets };
      return { ...prev, experience: updated };
    });
  }, []);

  const removeBullet = useCallback((expIndex: number, bulletIndex: number) => {
    setResumeData((prev) => {
      const updated = [...(prev.experience || [])];
      updated[expIndex] = { ...updated[expIndex], bullets: updated[expIndex].bullets.filter((_, i) => i !== bulletIndex) };
      return { ...prev, experience: updated };
    });
  }, []);

  // Education handlers
  const addEducation = useCallback(() => {
    setResumeData((prev) => ({
      ...prev,
      education: [...(prev.education || []), { institution: '', degree: '', graduationDate: '', gpa: '', honors: '' }],
    }));
  }, []);

  const removeEducation = useCallback((index: number) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education?.filter((_, i) => i !== index) || [],
    }));
  }, []);

  const updateEducation = useCallback((index: number, field: keyof Education, value: string) => {
    setResumeData((prev) => {
      const updated = [...(prev.education || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, education: updated };
    });
  }, []);

  // Projects handlers
  const addProject = useCallback(() => {
    setResumeData((prev) => ({
      ...prev,
      projects: [...(prev.projects || []), { name: '', description: '', technologies: [], url: '' }],
    }));
  }, []);

  const removeProject = useCallback((index: number) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects?.filter((_, i) => i !== index) || [],
    }));
  }, []);

  const updateProject = useCallback((index: number, field: keyof Project, value: string | string[]) => {
    setResumeData((prev) => {
      const updated = [...(prev.projects || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, projects: updated };
    });
  }, []);

  // Skills handlers
  const updateSkills = useCallback((value: string) => {
    const skillsArray = value.split(',').map((s) => s.trim()).filter(Boolean);
    setResumeData((prev) => ({ ...prev, skills: skillsArray }));
  }, []);

  // Certifications handlers
  const addCertification = useCallback(() => {
    setResumeData((prev) => ({
      ...prev,
      certifications: [...(prev.certifications || []), { name: '', issuer: '', date: '' }],
    }));
  }, []);

  const removeCertification = useCallback((index: number) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: prev.certifications?.filter((_, i) => i !== index) || [],
    }));
  }, []);

  const updateCertification = useCallback((index: number, field: keyof Certification, value: string) => {
    setResumeData((prev) => {
      const updated = [...(prev.certifications || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, certifications: updated };
    });
  }, []);

  // Check if resume has any data
  const hasData = useMemo(() => {
    const { personalInfo, summary, experience, education, skills, projects, certifications, awards } = resumeData;
    return (
      personalInfo.name.trim() !== '' ||
      personalInfo.email.trim() !== '' ||
      (summary && summary.trim() !== '') ||
      (experience && experience.length > 0) ||
      (education && education.length > 0) ||
      (skills && skills.length > 0) ||
      (projects && projects.length > 0) ||
      (certifications && certifications.length > 0) ||
      (awards && awards.length > 0)
    );
  }, [resumeData]);

  // Check if resume has at least one section with meaningful data
  const hasSectionData = useMemo(() => {
    const { summary, experience, education, skills, projects, certifications, awards } = resumeData;
    return (
      (summary && summary.trim() !== '') ||
      (experience && experience.some(e => e.company.trim() !== '' || e.title?.trim() !== '')) ||
      (education && education.some(e => e.degree.trim() !== '' || e.institution?.trim() !== '')) ||
      (skills && skills.length > 0) ||
      (projects && projects.some(p => p.name.trim() !== '')) ||
      (certifications && certifications.some(c => c.name.trim() !== '')) ||
      (awards && awards.some(a => typeof a === 'string' ? a.trim() !== '' : a.title.trim() !== ''))
    );
  }, [resumeData]);

  // Handle Generate Resume
  const handleGenerateResume = useCallback(() => {
    setValidationError(null);

    // Validation 1: Name is required
    if (!resumeData.personalInfo.name.trim()) {
      setValidationError('Please enter your name to generate the resume.');
      return;
    }

    // Validation 2: At least one section must have data
    if (!hasSectionData) {
      setValidationError('Please fill in at least one resume section (Summary, Experience, Education, Skills, Projects, or Certifications).');
      return;
    }

    setIsGenerating(true);

    try {
      // Generate LaTeX from the resume data
      const generatedLatex = generateLatexFromJSON(resumeData);

      // Store both ResumeData and generated LaTeX in Zustand
      setStoreResumeData(resumeData);
      setOriginalData(resumeData);
      setGeneratedLatex(generatedLatex);
      setFromCreatePage(true);

      // Redirect to LaTeX workspace
      router.push('/latex');
    } catch (error) {
      console.error('Error generating resume:', error);
      setValidationError('An error occurred while generating your resume. Please try again.');
      setIsGenerating(false);
    }
  }, [resumeData, hasSectionData, setStoreResumeData, setOriginalData, setGeneratedLatex, setFromCreatePage, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="h-14 border-b border-gray-200 flex items-center px-4 bg-white sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900">
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Create Your Resume</h1>
          <p className="text-gray-500 text-sm">Build your resume step by step</p>
        </div>

        {/* Section Cards */}
        <div className="space-y-4">
          {/* Personal Information */}
          <SectionCard
            title="Personal Information"
            sectionKey="personalInfo"
            isExpanded={expandedSections.personalInfo}
            onToggle={toggleSection}
          >
            <div className="pt-4 space-y-4">
              <InputField
                label="Full Name"
                value={resumeData.personalInfo.name}
                onChange={(v) => updatePersonalInfo('name', v)}
                placeholder="John Doe"
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Email"
                  value={resumeData.personalInfo.email}
                  onChange={(v) => updatePersonalInfo('email', v)}
                  placeholder="john@example.com"
                  type="email"
                />
                <InputField
                  label="Phone"
                  value={resumeData.personalInfo.phone}
                  onChange={(v) => updatePersonalInfo('phone', v)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <InputField
                label="Location"
                value={resumeData.personalInfo.location || ''}
                onChange={(v) => updatePersonalInfo('location', v)}
                placeholder="San Francisco, CA"
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="LinkedIn"
                  value={resumeData.personalInfo.linkedin || ''}
                  onChange={(v) => updatePersonalInfo('linkedin', v)}
                  placeholder="linkedin.com/in/johndoe"
                />
                <InputField
                  label="GitHub"
                  value={resumeData.personalInfo.github || ''}
                  onChange={(v) => updatePersonalInfo('github', v)}
                  placeholder="github.com/johndoe"
                />
              </div>
              <InputField
                label="Website"
                value={resumeData.personalInfo.website || ''}
                onChange={(v) => updatePersonalInfo('website', v)}
                placeholder="johndoe.com"
              />
            </div>
          </SectionCard>

          {/* Summary */}
          <SectionCard
            title="Professional Summary"
            sectionKey="summary"
            isExpanded={expandedSections.summary}
            onToggle={toggleSection}
          >
            <div className="pt-4">
              <TextAreaField
                label="Summary"
                value={resumeData.summary || ''}
                onChange={updateSummary}
                placeholder="A brief professional summary highlighting your key strengths and career objectives..."
                rows={4}
              />
            </div>
          </SectionCard>

          {/* Education */}
          <SectionCard
            title="Education"
            sectionKey="education"
            isExpanded={expandedSections.education}
            onToggle={toggleSection}
          >
            <div className="pt-4 space-y-4">
              {resumeData.education?.map((edu, index) => (
                <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Education {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <InputField
                    label="Institution"
                    value={edu.institution || ''}
                    onChange={(v) => updateEducation(index, 'institution', v)}
                    placeholder="University Name"
                  />
                  <InputField
                    label="Degree"
                    value={edu.degree}
                    onChange={(v) => updateEducation(index, 'degree', v)}
                    placeholder="Bachelor of Science in Computer Science"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="Graduation Date"
                      value={edu.graduationDate || ''}
                      onChange={(v) => updateEducation(index, 'graduationDate', v)}
                      placeholder="May 2024"
                    />
                    <InputField
                      label="GPA"
                      value={edu.gpa || ''}
                      onChange={(v) => updateEducation(index, 'gpa', v)}
                      placeholder="3.8/4.0"
                    />
                  </div>
                  <InputField
                    label="Honors"
                    value={edu.honors || ''}
                    onChange={(v) => updateEducation(index, 'honors', v)}
                    placeholder="Magna Cum Laude, Dean's List"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addEducation}
                className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <Plus className="w-4 h-4" /> Add Education
              </button>
            </div>
          </SectionCard>

          {/* Experience */}
          <SectionCard
            title="Experience"
            sectionKey="experience"
            isExpanded={expandedSections.experience}
            onToggle={toggleSection}
          >
            <div className="pt-4 space-y-4">
              {resumeData.experience?.map((exp, expIndex) => (
                <div key={expIndex} className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Experience {expIndex + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeExperience(expIndex)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="Company"
                      value={exp.company}
                      onChange={(v) => updateExperience(expIndex, 'company', v)}
                      placeholder="Company Name"
                    />
                    <InputField
                      label="Job Title"
                      value={exp.title || ''}
                      onChange={(v) => updateExperience(expIndex, 'title', v)}
                      placeholder="Software Engineer"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <InputField
                      label="Start Date"
                      value={exp.startDate}
                      onChange={(v) => updateExperience(expIndex, 'startDate', v)}
                      placeholder="Jan 2022"
                    />
                    <InputField
                      label="End Date"
                      value={exp.endDate}
                      onChange={(v) => updateExperience(expIndex, 'endDate', v)}
                      placeholder="Present"
                    />
                    <InputField
                      label="Location"
                      value={exp.location || ''}
                      onChange={(v) => updateExperience(expIndex, 'location', v)}
                      placeholder="Remote"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Bullet Points</label>
                    {exp.bullets.map((bullet, bulletIndex) => (
                      <div key={bulletIndex} className="flex gap-2">
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => updateBullet(expIndex, bulletIndex, e.target.value)}
                          placeholder="Describe your achievement..."
                          className="flex-1 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => removeBullet(expIndex, bulletIndex)}
                          className="text-red-500 hover:text-red-600 px-2"
                          disabled={exp.bullets.length <= 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addBullet(expIndex)}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      + Add bullet
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addExperience}
                className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <Plus className="w-4 h-4" /> Add Experience
              </button>
            </div>
          </SectionCard>

          {/* Projects */}
          <SectionCard
            title="Projects"
            sectionKey="projects"
            isExpanded={expandedSections.projects}
            onToggle={toggleSection}
          >
            <div className="pt-4 space-y-4">
              {resumeData.projects?.map((project, index) => (
                <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Project {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeProject(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <InputField
                    label="Project Name"
                    value={project.name}
                    onChange={(v) => updateProject(index, 'name', v)}
                    placeholder="Project Name"
                  />
                  <TextAreaField
                    label="Description"
                    value={project.description}
                    onChange={(v) => updateProject(index, 'description', v)}
                    placeholder="Brief description of the project..."
                    rows={2}
                  />
                  <InputField
                    label="Technologies"
                    value={project.technologies?.join(', ') || ''}
                    onChange={(v) => updateProject(index, 'technologies', v.split(',').map((t) => t.trim()))}
                    placeholder="React, Node.js, PostgreSQL"
                  />
                  <InputField
                    label="URL"
                    value={project.url || ''}
                    onChange={(v) => updateProject(index, 'url', v)}
                    placeholder="https://github.com/user/project"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addProject}
                className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <Plus className="w-4 h-4" /> Add Project
              </button>
            </div>
          </SectionCard>

          {/* Skills */}
          <SectionCard
            title="Skills"
            sectionKey="skills"
            isExpanded={expandedSections.skills}
            onToggle={toggleSection}
          >
            <div className="pt-4">
              <TextAreaField
                label="Skills (comma-separated)"
                value={resumeData.skills?.join(', ') || ''}
                onChange={updateSkills}
                placeholder="JavaScript, TypeScript, React, Node.js, Python, SQL, Git..."
                rows={3}
              />
            </div>
          </SectionCard>

          {/* Certifications / Achievements */}
          <SectionCard
            title="Certifications & Achievements"
            sectionKey="certifications"
            isExpanded={expandedSections.certifications}
            onToggle={toggleSection}
          >
            <div className="pt-4 space-y-4">
              {resumeData.certifications?.map((cert, index) => (
                <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Certification {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <InputField
                    label="Name"
                    value={cert.name}
                    onChange={(v) => updateCertification(index, 'name', v)}
                    placeholder="AWS Certified Solutions Architect"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="Issuer"
                      value={cert.issuer || ''}
                      onChange={(v) => updateCertification(index, 'issuer', v)}
                      placeholder="Amazon Web Services"
                    />
                    <InputField
                      label="Date"
                      value={cert.date || ''}
                      onChange={(v) => updateCertification(index, 'date', v)}
                      placeholder="March 2024"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addCertification}
                className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <Plus className="w-4 h-4" /> Add Certification
              </button>
            </div>
          </SectionCard>
        </div>

        {/* Primary CTA */}
        <div className="mt-8 pb-8">
          {/* Validation Error */}
          {validationError && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{validationError}</p>
            </div>
          )}
          
          <button
            type="button"
            onClick={handleGenerateResume}
            disabled={!hasData || isGenerating}
            className="w-full flex items-center justify-center px-6 py-4 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Generating...
              </>
            ) : (
              'Generate Resume'
            )}
          </button>
          {!hasData && (
            <p className="text-center text-sm text-gray-400 mt-3">
              Fill in at least one field to generate your resume
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
