import React from 'react';
import { TemplateProps } from './types';
import { ResumeData } from '@/types/resume';
import { Editable, AddButton, RemoveButton, SectionControls, AddSectionButton, CustomSectionRenderer } from './TemplateComponents';
import { X } from 'lucide-react';

export default function IvyTemplate({ data, colorAccent, isEditing, onUpdate }: TemplateProps) {
  const update = (fn: (d: ResumeData) => void) => {
    if (!onUpdate) return;
    const newData = JSON.parse(JSON.stringify(data));
    fn(newData);
    onUpdate(newData);
  };

  const emptyExperience = { company: "Company Name", role: "Job Title", startDate: "Start", endDate: "End", location: "Location", bullets: ["New achievement"] };
  const emptyProject = { name: "Project Name", technologies: ["Tech"], description: "Project description", link: "" };
  const emptyEducation = { school: "University Name", degree: "Degree", year: "Year", gpa: "" };
  const emptyCertification = { name: "Certification Name", issuer: "Issuer", date: "Date" };
  const emptyAward = { title: "Award Title", issuer: "Issuer", date: "Date" };

  return (
    <div className="w-full h-full bg-white p-12 text-gray-900 font-serif text-[10pt] leading-tight">
      {/* Header */}
      <header className="text-center mb-6">
        <Editable 
          tagName="h1" 
          className="text-2xl font-bold uppercase tracking-wide mb-2 block" 
          value={data.personalInfo.name} 
          onChange={(val) => update(d => d.personalInfo.name = val)} 
          isEditing={isEditing}
        />
        <div className="flex flex-wrap justify-center gap-3 text-gray-600">
          <Editable value={data.personalInfo.location} onChange={(val) => update(d => d.personalInfo.location = val)} isEditing={isEditing} />
          <span>•</span>
          <Editable value={data.personalInfo.email} onChange={(val) => update(d => d.personalInfo.email = val)} isEditing={isEditing} />
          <span>•</span>
          <Editable value={data.personalInfo.phone} onChange={(val) => update(d => d.personalInfo.phone = val)} isEditing={isEditing} />
          {data.personalInfo.linkedin && (
            <>
              <span>•</span>
              <Editable value={data.personalInfo.linkedin} onChange={(val) => update(d => d.personalInfo.linkedin = val)} placeholder="LinkedIn" className="hover:underline" isEditing={isEditing} />
            </>
          )}
        </div>
      </header>

      {/* Education (Top Priority for Academic/Ivy) */}
      {(data.education?.length || 0) > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-2 group/section border-b border-gray-800 pb-1">
            <h2 className="text-sm font-bold uppercase tracking-wider">Education</h2>
            <SectionControls onDelete={() => update(d => d.education = [])} isEditing={isEditing} />
          </div>
          <div className="space-y-3">
            {data.education.map((edu, i) => (
              <div key={i} className="relative group break-inside-avoid">
                <div className="flex justify-between items-baseline">
                  <Editable tagName="div" className="font-bold" value={edu.school} onChange={(val) => update(d => d.education[i].school = val)} isEditing={isEditing} />
                  <Editable tagName="div" className="text-right" value={edu.year} onChange={(val) => update(d => d.education[i].year = val)} isEditing={isEditing} />
                </div>
                <div className="flex justify-between items-baseline">
                  <Editable tagName="div" className="italic" value={edu.degree} onChange={(val) => update(d => d.education[i].degree = val)} isEditing={isEditing} />
                  {edu.gpa && (
                    <div className="text-gray-600">
                      GPA: <Editable value={edu.gpa} onChange={(val) => update(d => d.education[i].gpa = val)} placeholder="..." isEditing={isEditing} />
                    </div>
                  )}
                </div>
                <RemoveButton onClick={() => update(d => d.education.splice(i, 1))} isEditing={isEditing} />
              </div>
            ))}
            <AddButton onClick={() => update(d => d.education.push(emptyEducation))} label="Add Education" isEditing={isEditing} />
          </div>
        </section>
      )}
      {(!data.education.length) && <AddSectionButton label="Education" onClick={() => update(d => d.education = [emptyEducation])} isEditing={isEditing} />}

      {/* Experience */}
      {(data.experience?.length || 0) > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-2 group/section border-b border-gray-800 pb-1">
            <h2 className="text-sm font-bold uppercase tracking-wider">Experience</h2>
            <SectionControls onDelete={() => update(d => d.experience = [])} isEditing={isEditing} />
          </div>
          <div className="space-y-4">
            {data.experience.map((exp, i) => (
              <div key={i} className="relative group break-inside-avoid">
                <div className="flex justify-between items-baseline">
                  <div className="flex gap-2 items-baseline">
                    <Editable tagName="h3" className="font-bold" value={exp.company} onChange={(val) => update(d => d.experience[i].company = val)} isEditing={isEditing} />
                    <span className="text-gray-500">,</span>
                    <Editable className="italic" value={exp.location} onChange={(val) => update(d => d.experience[i].location = val)} placeholder="Location" isEditing={isEditing} />
                  </div>
                  <div className="text-right">
                    <Editable value={exp.startDate} onChange={(val) => update(d => d.experience[i].startDate = val)} isEditing={isEditing} /> – <Editable value={exp.endDate} onChange={(val) => update(d => d.experience[i].endDate = val)} isEditing={isEditing} />
                  </div>
                </div>
                <div className="italic mb-1">
                  <Editable value={exp.role} onChange={(val) => update(d => d.experience[i].role = val)} isEditing={isEditing} />
                </div>
                <ul className="list-disc list-outside ml-4 space-y-0.5 text-gray-800">
                  {exp.bullets.map((bullet, j) => (
                    <li key={j} className="pl-1 relative group/bullet">
                      <Editable value={bullet} onChange={(val) => update(d => d.experience[i].bullets[j] = val)} isEditing={isEditing} />
                      {isEditing && (
                        <button 
                          onClick={() => update(d => d.experience[i].bullets.splice(j, 1))}
                          className="absolute -left-5 top-0 text-red-300 hover:text-red-500 opacity-0 group-hover/bullet:opacity-100"
                        >
                          <X size={10} />
                        </button>
                      )}
                    </li>
                  ))}
                  <AddButton onClick={() => update(d => d.experience[i].bullets.push("New achievement"))} label="Add Bullet" isEditing={isEditing} />
                </ul>
                <RemoveButton onClick={() => update(d => d.experience.splice(i, 1))} isEditing={isEditing} />
              </div>
            ))}
            <AddButton onClick={() => update(d => d.experience.push(emptyExperience))} label="Add Experience" isEditing={isEditing} />
          </div>
        </section>
      )}
      {(!data.experience.length) && <AddSectionButton label="Experience" onClick={() => update(d => d.experience = [emptyExperience])} isEditing={isEditing} />}

      {/* Projects */}
      {(data.projects?.length || 0) > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-2 group/section border-b border-gray-800 pb-1">
            <h2 className="text-sm font-bold uppercase tracking-wider">Projects</h2>
            <SectionControls onDelete={() => update(d => d.projects = [])} isEditing={isEditing} />
          </div>
          <div className="space-y-3">
            {(data.projects || []).map((proj, i) => (
              <div key={i} className="relative group break-inside-avoid">
                <div className="flex justify-between items-baseline">
                  <div className="flex items-center gap-2">
                    <Editable tagName="h3" className="font-bold" value={proj.name} onChange={(val) => update(d => d.projects![i].name = val)} isEditing={isEditing} />
                    {proj.link && (
                      <Editable className="text-xs text-blue-800 hover:underline" value={proj.link} onChange={(val) => update(d => d.projects![i].link = val)} placeholder="Link" isEditing={isEditing} />
                    )}
                  </div>
                </div>
                <Editable tagName="p" className="text-gray-800" value={proj.description} onChange={(val) => update(d => d.projects![i].description = val)} isEditing={isEditing} />
                <div className="text-xs text-gray-600 mt-0.5 italic">
                  Technologies: {(proj.technologies || []).join(", ")}
                </div>
                <RemoveButton onClick={() => update(d => d.projects!.splice(i, 1))} isEditing={isEditing} />
              </div>
            ))}
            <AddButton onClick={() => update(d => { if(!d.projects) d.projects=[]; d.projects.push(emptyProject) })} label="Add Project" isEditing={isEditing} />
          </div>
        </section>
      )}

      {/* Skills & Interests (Compact) */}
      <div className="grid grid-cols-2 gap-6">
        {(data.skills?.length || 0) > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2 group/section border-b border-gray-800 pb-1">
              <h2 className="text-sm font-bold uppercase tracking-wider">Skills</h2>
              <SectionControls onDelete={() => update(d => d.skills = [])} isEditing={isEditing} />
            </div>
            <div className="text-gray-800">
              {data.skills.join(", ")}
            </div>
          </section>
        )}

        {(data.languages?.length || 0) > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2 group/section border-b border-gray-800 pb-1">
              <h2 className="text-sm font-bold uppercase tracking-wider">Languages</h2>
              <SectionControls onDelete={() => update(d => d.languages = [])} isEditing={isEditing} />
            </div>
            <div className="text-gray-800">
              {data.languages?.join(", ")}
            </div>
          </section>
        )}
      </div>

      {/* Custom Sections */}
      {data.customSections?.map((section, index) => (
        <CustomSectionRenderer
          key={index}
          index={index}
          section={section}
          colorAccent={colorAccent}
          isEditing={isEditing}
          onUpdate={(updatedSection) => update(d => {
            if (!d.customSections) d.customSections = [];
            d.customSections[index] = updatedSection;
          })}
          onDelete={() => update(d => d.customSections?.splice(index, 1))}
        />
      ))}
    </div>
  );
}
