import React from 'react';
import { TemplateProps } from './types';
import { ResumeData } from '@/types/resume';
import { Editable, AddButton, RemoveButton, SectionControls, AddSectionButton, CustomSectionRenderer } from './TemplateComponents';
import { X } from 'lucide-react';

export default function GlitchTemplate({ data, colorAccent, isEditing, onUpdate }: TemplateProps) {
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
    <div className="w-full h-full bg-white text-black font-mono uppercase tracking-widest flex flex-col p-8 border-4 border-black">
      {/* Header */}
      <header className="border-b-4 border-black pb-8 mb-8">
        <Editable 
          tagName="h1" 
          className="text-7xl font-black leading-none mb-4 block" 
          value={data.personalInfo.name} 
          onChange={(val) => update(d => d.personalInfo.name = val)} 
          isEditing={isEditing}
        />
        <div className="flex justify-between items-end">
          <div className="text-xs font-bold space-y-1">
            <div className="bg-black text-white px-2 py-1 inline-block">
              <Editable value={data.personalInfo.location} onChange={(val) => update(d => d.personalInfo.location = val)} isEditing={isEditing} />
            </div>
            <div className="block">
              <Editable value={data.personalInfo.email} onChange={(val) => update(d => d.personalInfo.email = val)} isEditing={isEditing} />
            </div>
            <div className="block">
              <Editable value={data.personalInfo.phone} onChange={(val) => update(d => d.personalInfo.phone = val)} isEditing={isEditing} />
            </div>
          </div>
          <div className="text-right">
             <div className="text-4xl font-bold opacity-20">RESUME_V1.0</div>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="col-span-4 flex flex-col gap-12 border-r-4 border-black pr-8">
          
          {/* Skills */}
          {(data.skills?.length || 0) > 0 && (
            <section className="group/section break-inside-avoid">
              <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-1">
                <h2 className="text-xl font-black bg-black text-white px-2 inline-block">Skills</h2>
                <SectionControls onDelete={() => update(d => d.skills = [])} isEditing={isEditing} />
              </div>
              <div className="flex flex-col gap-2">
                {data.skills.map((skill, i) => (
                  <div key={i} className="relative group">
                    <span className="text-sm font-bold border border-black px-2 py-1 block hover:bg-black hover:text-white transition-colors cursor-default">
                      <Editable value={skill} onChange={(val) => update(d => d.skills[i] = val)} isEditing={isEditing} />
                    </span>
                    {isEditing && (
                      <button 
                        onClick={() => update(d => d.skills.splice(i, 1))}
                        className="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>
                ))}
                <AddButton onClick={() => update(d => d.skills.push("New Skill"))} label="Add" isEditing={isEditing} />
              </div>
            </section>
          )}
          {(!data.skills.length) && <AddSectionButton label="Skills" onClick={() => update(d => d.skills = ["New Skill"])} isEditing={isEditing} />}

          {/* Education */}
          {(data.education?.length || 0) > 0 && (
            <section className="group/section break-inside-avoid">
              <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-1">
                <h2 className="text-xl font-black bg-black text-white px-2 inline-block">Education</h2>
                <SectionControls onDelete={() => update(d => d.education = [])} isEditing={isEditing} />
              </div>
              <div className="space-y-6">
                {data.education.map((edu, i) => (
                  <div key={i} className="relative group">
                    <Editable tagName="div" className="font-bold text-lg leading-none mb-1" value={edu.school} onChange={(val) => update(d => d.education[i].school = val)} isEditing={isEditing} />
                    <Editable tagName="div" className="text-xs font-bold text-gray-500 mb-1" value={edu.degree} onChange={(val) => update(d => d.education[i].degree = val)} isEditing={isEditing} />
                    <div className="text-xs font-bold border-t border-black pt-1 inline-block">
                      <Editable value={edu.year} onChange={(val) => update(d => d.education[i].year = val)} isEditing={isEditing} />
                    </div>
                    <RemoveButton onClick={() => update(d => d.education.splice(i, 1))} className="text-red-400" isEditing={isEditing} />
                  </div>
                ))}
                <AddButton onClick={() => update(d => d.education.push(emptyEducation))} label="Add Education" isEditing={isEditing} />
              </div>
            </section>
          )}

        </div>

        {/* Right Column */}
        <div className="col-span-8 flex flex-col gap-12">
          
          {/* Summary */}
          {data.summary && (
            <section className="group/section">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black border-b-4 border-black inline-block">Profile</h2>
                <SectionControls onDelete={() => update(d => d.summary = "")} isEditing={isEditing} />
              </div>
              <Editable tagName="p" className="text-sm font-bold leading-relaxed text-justify" value={data.summary} onChange={(val) => update(d => d.summary = val)} isEditing={isEditing} />
            </section>
          )}
          {!data.summary && <AddSectionButton label="Profile" onClick={() => update(d => d.summary = "Summary...")} isEditing={isEditing} />}

          {/* Experience */}
          {(data.experience?.length || 0) > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6 group/section">
                <h2 className="text-xl font-black border-b-4 border-black inline-block">Experience</h2>
                <SectionControls onDelete={() => update(d => d.experience = [])} isEditing={isEditing} />
              </div>
              <div className="space-y-8">
                {data.experience.map((exp, i) => (
                  <div key={i} className="relative group break-inside-avoid">
                    <div className="flex justify-between items-start mb-2 border-b-2 border-gray-200 pb-2">
                      <div>
                        <Editable tagName="h3" className="text-xl font-black" value={exp.role} onChange={(val) => update(d => d.experience[i].role = val)} isEditing={isEditing} />
                        <Editable className="text-sm font-bold text-gray-500" value={exp.company} onChange={(val) => update(d => d.experience[i].company = val)} isEditing={isEditing} />
                      </div>
                      <div className="text-xs font-bold bg-black text-white px-2 py-1">
                        <Editable value={exp.startDate} onChange={(val) => update(d => d.experience[i].startDate = val)} isEditing={isEditing} /> - <Editable value={exp.endDate} onChange={(val) => update(d => d.experience[i].endDate = val)} isEditing={isEditing} />
                      </div>
                    </div>
                    
                    <ul className="space-y-2 mt-4">
                      {exp.bullets.map((bullet, j) => (
                        <li key={j} className="relative group/bullet flex gap-4 text-sm font-medium">
                          <span className="font-black text-lg leading-none">→</span>
                          <Editable value={bullet} onChange={(val) => update(d => d.experience[i].bullets[j] = val)} isEditing={isEditing} />
                          {isEditing && (
                            <button 
                              onClick={() => update(d => d.experience[i].bullets.splice(j, 1))}
                              className="absolute -left-6 top-0 text-red-300 hover:text-red-500 opacity-0 group-hover/bullet:opacity-100"
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
      </div>
    </div>
  );
}
