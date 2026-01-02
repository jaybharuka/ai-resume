import React from 'react';
import { TemplateProps } from './types';
import { ResumeData } from '@/types/resume';
import { Editable, AddButton, RemoveButton, SectionControls, AddSectionButton, CustomSectionRenderer } from './TemplateComponents';

export default function DeedyTemplate({ data, colorAccent, isEditing, onUpdate }: TemplateProps) {
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
    <div className="w-full h-full bg-white p-[0.75in] text-gray-900 font-serif text-[10pt] leading-snug">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Merriweather:wght@300;400;700&display=swap');
        .font-deedy-header { font-family: 'Lato', sans-serif; }
        .font-deedy-body { font-family: 'Merriweather', serif; }
      `}</style>

      {/* Header */}
      <header className="text-center mb-4 border-b-0">
        <Editable 
          tagName="h1" 
          className="font-deedy-header text-4xl font-medium uppercase tracking-[0.1em] mb-2 block text-gray-800" 
          value={data.personalInfo.name} 
          onChange={(val) => update(d => d.personalInfo.name = val)} 
          isEditing={isEditing}
        />
        <div className="font-deedy-body flex flex-wrap justify-center gap-2 text-gray-700 text-[9pt]">
          <Editable value={data.personalInfo.email} onChange={(val) => update(d => d.personalInfo.email = val)} isEditing={isEditing} />
          <span>|</span>
          <Editable value={data.personalInfo.phone} onChange={(val) => update(d => d.personalInfo.phone = val)} isEditing={isEditing} />
          {data.personalInfo.linkedin && (
            <>
              <span>|</span>
              <Editable value={data.personalInfo.linkedin} onChange={(val) => update(d => d.personalInfo.linkedin = val)} placeholder="LinkedIn" className="hover:underline" isEditing={isEditing} />
            </>
          )}
          {data.personalInfo.github && (
            <>
              <span>|</span>
              <Editable value={data.personalInfo.github} onChange={(val) => update(d => d.personalInfo.github = val)} placeholder="GitHub" className="hover:underline" isEditing={isEditing} />
            </>
          )}
          {data.personalInfo.website && (
            <>
              <span>|</span>
              <Editable value={data.personalInfo.website} onChange={(val) => update(d => d.personalInfo.website = val)} placeholder="Website" className="hover:underline" isEditing={isEditing} />
            </>
          )}
        </div>
      </header>

      {/* Education */}
      {(data.education?.length || 0) > 0 && (
        <section className="mb-4">
          <div className="flex items-center justify-between mb-2 group/section border-b border-gray-300 pb-1">
            <h2 className="font-deedy-header text-[11pt] font-bold uppercase tracking-widest text-gray-800">Education</h2>
            <SectionControls onDelete={() => update(d => d.education = [])} isEditing={isEditing} />
          </div>
          <div className="space-y-2">
            {data.education?.map((edu, i) => (
              <div key={i} className="relative group break-inside-avoid">
                <div className="flex justify-between items-baseline">
                  <div className="font-deedy-header font-bold text-[10.5pt] text-gray-900">
                    <Editable value={edu.school} onChange={(val) => update(d => { if(d.education) d.education[i].school = val })} isEditing={isEditing} />
                  </div>
                  <div className="font-deedy-body text-[10pt] text-gray-800">
                    <Editable value={edu.year} onChange={(val) => update(d => { if(d.education) d.education[i].year = val })} isEditing={isEditing} />
                  </div>
                </div>
                <div className="flex justify-between items-baseline">
                  <div className="font-deedy-body italic text-gray-700">
                    <Editable value={edu.degree} onChange={(val) => update(d => { if(d.education) d.education[i].degree = val })} isEditing={isEditing} />
                  </div>
                  {edu.gpa && (
                    <div className="font-deedy-body text-gray-600 text-[9pt]">
                      GPA: <Editable value={edu.gpa} onChange={(val) => update(d => { if(d.education) d.education[i].gpa = val })} placeholder="..." isEditing={isEditing} />
                    </div>
                  )}
                </div>
                <RemoveButton onClick={() => update(d => { if(d.education) d.education.splice(i, 1) })} isEditing={isEditing} />
              </div>
            ))}
            <AddButton onClick={() => update(d => { if(d.education) d.education.push(emptyEducation) })} label="Add Education" isEditing={isEditing} />
          </div>
        </section>
      )}
      {(!data.education?.length) && <AddSectionButton label="Education" onClick={() => update(d => d.education = [emptyEducation])} isEditing={isEditing} />}

      {/* Skills */}
      {(data.skills?.length || 0) > 0 && (
        <section className="mb-4">
          <div className="flex items-center justify-between mb-2 group/section border-b border-gray-300 pb-1">
            <h2 className="font-deedy-header text-[11pt] font-bold uppercase tracking-widest text-gray-800">Technical Skills</h2>
            <SectionControls onDelete={() => update(d => d.skills = [])} isEditing={isEditing} />
          </div>
          <div className="font-deedy-body text-[10pt] leading-relaxed">
             {/* Deedy often groups skills, but we have a flat list. We'll display them as a comma-separated list for that dense look */}
             <div className="relative group">
                {data.skills?.map((skill, i) => (
                  <span key={i}>
                    <Editable 
                      tagName="span"
                      value={skill} 
                      onChange={(val) => update(d => { if(d.skills) d.skills[i] = val })} 
                      isEditing={isEditing} 
                    />
                    {i < (data.skills?.length || 0) - 1 && <span className="mr-1">,</span>}
                  </span>
                ))}
                <div className="absolute -right-6 top-0 hidden group-hover:flex flex-col gap-1">
                    <button 
                        onClick={() => update(d => { if(d.skills) d.skills.push("New Skill") })}
                        className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                        title="Add Skill"
                    >
                        +
                    </button>
                </div>
             </div>
          </div>
        </section>
      )}
      {(!data.skills?.length) && <AddSectionButton label="Skills" onClick={() => update(d => d.skills = ["New Skill"])} isEditing={isEditing} />}

      {/* Experience */}
      {(data.experience?.length || 0) > 0 && (
        <section className="mb-4">
          <div className="flex items-center justify-between mb-2 group/section border-b border-gray-300 pb-1">
            <h2 className="font-deedy-header text-[11pt] font-bold uppercase tracking-widest text-gray-800">Experience</h2>
            <SectionControls onDelete={() => update(d => d.experience = [])} isEditing={isEditing} />
          </div>
          <div className="space-y-3">
            {data.experience?.map((exp, i) => (
              <div key={i} className="relative group break-inside-avoid">
                <div className="flex justify-between items-baseline mb-0.5">
                  <div className="flex items-baseline gap-2">
                    <Editable tagName="h3" className="font-deedy-header font-bold text-[10.5pt] text-gray-900" value={exp.company} onChange={(val) => update(d => { if(d.experience) d.experience[i].company = val })} isEditing={isEditing} />
                    <span className="text-gray-400 text-xs">|</span>
                    <Editable className="font-deedy-body text-[10pt] text-gray-700" value={exp.location} onChange={(val) => update(d => { if(d.experience) d.experience[i].location = val })} placeholder="Location" isEditing={isEditing} />
                  </div>
                  <div className="font-deedy-body text-[10pt] text-gray-800 whitespace-nowrap">
                    <Editable value={exp.startDate} onChange={(val) => update(d => { if(d.experience) d.experience[i].startDate = val })} isEditing={isEditing} /> – <Editable value={exp.endDate} onChange={(val) => update(d => { if(d.experience) d.experience[i].endDate = val })} isEditing={isEditing} />
                  </div>
                </div>
                <div className="font-deedy-body italic text-[10pt] text-gray-700 mb-1">
                  <Editable value={exp.role} onChange={(val) => update(d => { if(d.experience) d.experience[i].role = val })} isEditing={isEditing} />
                </div>
                <ul className="list-disc list-outside ml-4 space-y-0.5 text-[9.5pt] text-gray-800 font-deedy-body">
                  {exp.bullets?.map((bullet, k) => (
                    <li key={k} className="pl-1 relative group/bullet">
                      <Editable 
                        tagName="span" 
                        value={bullet} 
                        onChange={(val) => update(d => { if(d.experience) d.experience[i].bullets[k] = val })} 
                        isEditing={isEditing}
                      />
                      <div className="absolute -left-6 top-0 hidden group-hover/bullet:flex gap-1">
                        <button 
                            onClick={() => update(d => { if(d.experience) d.experience[i].bullets.splice(k, 1) })}
                            className="text-red-400 hover:text-red-600"
                        >
                            ×
                        </button>
                      </div>
                    </li>
                  ))}
                  {isEditing && (
                    <li className="list-none">
                        <button 
                            onClick={() => update(d => { if(d.experience) d.experience[i].bullets.push("New achievement") })}
                            className="text-xs text-blue-500 hover:underline mt-1"
                        >
                            + Add Bullet
                        </button>
                    </li>
                  )}
                </ul>
                <RemoveButton onClick={() => update(d => { if(d.experience) d.experience.splice(i, 1) })} isEditing={isEditing} />
              </div>
            ))}
            <AddButton onClick={() => update(d => { if(d.experience) d.experience.push(emptyExperience) })} label="Add Experience" isEditing={isEditing} />
          </div>
        </section>
      )}
      {(!data.experience?.length) && <AddSectionButton label="Experience" onClick={() => update(d => d.experience = [emptyExperience])} isEditing={isEditing} />}

      {/* Projects */}
      {(data.projects?.length || 0) > 0 && (
        <section className="mb-4">
          <div className="flex items-center justify-between mb-2 group/section border-b border-gray-300 pb-1">
            <h2 className="font-deedy-header text-[11pt] font-bold uppercase tracking-widest text-gray-800">Projects</h2>
            <SectionControls onDelete={() => update(d => d.projects = [])} isEditing={isEditing} />
          </div>
          <div className="space-y-3">
            {data.projects?.map((proj, i) => (
              <div key={i} className="relative group break-inside-avoid">
                <div className="flex justify-between items-baseline mb-0.5">
                  <div className="flex items-baseline gap-2">
                    <Editable tagName="h3" className="font-deedy-header font-bold text-[10.5pt] text-gray-900" value={proj.name} onChange={(val) => update(d => { if(d.projects) d.projects[i].name = val })} isEditing={isEditing} />
                    {proj.technologies && proj.technologies.length > 0 && (
                        <>
                            <span className="text-gray-400 text-xs">|</span>
                            <span className="font-deedy-body text-[10pt] text-gray-700 italic">
                                {proj.technologies.join(', ')}
                            </span>
                        </>
                    )}
                  </div>
                  {proj.link && (
                     <div className="font-deedy-body text-[9pt]">
                        <Editable value={proj.link} onChange={(val) => update(d => { if(d.projects) d.projects[i].link = val })} placeholder="Link" className="text-blue-600 hover:underline" isEditing={isEditing} />
                     </div>
                  )}
                </div>
                <div className="font-deedy-body text-[9.5pt] text-gray-800">
                  <Editable value={proj.description} onChange={(val) => update(d => { if(d.projects) d.projects[i].description = val })} isEditing={isEditing} />
                </div>
                <RemoveButton onClick={() => update(d => { if(d.projects) d.projects.splice(i, 1) })} isEditing={isEditing} />
              </div>
            ))}
            <AddButton onClick={() => update(d => { if(d.projects) d.projects.push(emptyProject) })} label="Add Project" isEditing={isEditing} />
          </div>
        </section>
      )}
      {(!data.projects?.length) && <AddSectionButton label="Projects" onClick={() => update(d => d.projects = [emptyProject])} isEditing={isEditing} />}

      {/* Custom Sections */}
      {data.customSections?.map((section, i) => (
        <CustomSectionRenderer 
            key={i} 
            section={section} 
            index={i} 
            onUpdate={(newSection) => update(d => { if(d.customSections) d.customSections[i] = newSection })}
            onDelete={() => update(d => { if(d.customSections) d.customSections.splice(i, 1) })}
            isEditing={isEditing}
            className="mb-4"
            headerClassName="border-b border-gray-300 pb-1 mb-2"
            titleClassName="font-deedy-header text-[11pt] font-bold uppercase tracking-widest text-gray-800"
        />
      ))}
      
      <div className="mt-8 text-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
            onClick={() => update(d => {
                if (!d.customSections) d.customSections = [];
                d.customSections.push({ title: "New Section", items: [] });
            })}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-sm font-medium"
        >
            + Add Custom Section
        </button>
      </div>
    </div>
  );
}
