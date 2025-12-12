import React from 'react';
import { TemplateProps } from './types';
import { ResumeData } from '@/types/resume';
import { Editable, AddButton, RemoveButton, SectionControls, AddSectionButton, CustomSectionRenderer } from './TemplateComponents';
import { X } from 'lucide-react';

export default function StartupTemplate({ data, colorAccent, isEditing, onUpdate }: TemplateProps) {
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
    <div className="w-full h-full bg-white font-sans flex">
      {/* Left Sidebar (30%) */}
      <div className="w-[30%] bg-gray-50 p-8 flex flex-col gap-8 border-r border-gray-100">
        <div className="text-center">
          <div className="w-24 h-24 rounded-2xl mx-auto mb-6 flex items-center justify-center text-4xl font-bold text-white shadow-xl rotate-3" style={{ backgroundColor: colorAccent }}>
            {data.personalInfo.name.charAt(0)}
          </div>
          
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Email</span>
              <Editable value={data.personalInfo.email} onChange={(val) => update(d => d.personalInfo.email = val)} className="break-all font-medium" isEditing={isEditing} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Phone</span>
              <Editable value={data.personalInfo.phone} onChange={(val) => update(d => d.personalInfo.phone = val)} className="font-medium" isEditing={isEditing} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Location</span>
              <Editable value={data.personalInfo.location} onChange={(val) => update(d => d.personalInfo.location = val)} className="font-medium" isEditing={isEditing} />
            </div>
            {data.personalInfo.linkedin && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">LinkedIn</span>
                <Editable value={data.personalInfo.linkedin} onChange={(val) => update(d => d.personalInfo.linkedin = val)} placeholder="URL" className="break-all font-medium text-blue-600" isEditing={isEditing} />
              </div>
            )}
          </div>
        </div>

        {/* Skills */}
        {(data.skills?.length || 0) > 0 && (
          <div className="group/section break-inside-avoid">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800">Skills</h3>
              <SectionControls onDelete={() => update(d => d.skills = [])} isEditing={isEditing} />
            </div>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, i) => (
                <div key={i} className="relative group">
                  <span className="bg-white px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 shadow-sm border border-gray-200 block">
                    <Editable value={skill} onChange={(val) => update(d => d.skills[i] = val)} isEditing={isEditing} />
                  </span>
                  {isEditing && (
                    <button 
                      onClick={() => update(d => d.skills.splice(i, 1))}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity w-3 h-3 flex items-center justify-center"
                    >
                      <X size={8} />
                    </button>
                  )}
                </div>
              ))}
              <AddButton onClick={() => update(d => d.skills.push("New Skill"))} label="Add" isEditing={isEditing} />
            </div>
          </div>
        )}
        {(!data.skills.length) && <AddSectionButton label="Skills" onClick={() => update(d => d.skills = ["New Skill"])} isEditing={isEditing} />}

        {/* Education */}
        {(data.education?.length || 0) > 0 && (
          <div className="group/section break-inside-avoid">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800">Education</h3>
              <SectionControls onDelete={() => update(d => d.education = [])} isEditing={isEditing} />
            </div>
            <div className="space-y-4">
              {data.education.map((edu, i) => (
                <div key={i} className="relative group">
                  <Editable tagName="div" className="font-bold text-gray-800" value={edu.school} onChange={(val) => update(d => d.education[i].school = val)} isEditing={isEditing} />
                  <Editable tagName="div" className="text-xs text-gray-500" value={edu.degree} onChange={(val) => update(d => d.education[i].degree = val)} isEditing={isEditing} />
                  <div className="text-xs text-gray-400 mt-1">
                    <Editable value={edu.year} onChange={(val) => update(d => d.education[i].year = val)} isEditing={isEditing} />
                  </div>
                  <RemoveButton onClick={() => update(d => d.education.splice(i, 1))} className="text-red-400" isEditing={isEditing} />
                </div>
              ))}
              <AddButton onClick={() => update(d => d.education.push(emptyEducation))} label="Add Education" isEditing={isEditing} />
            </div>
          </div>
        )}
      </div>

      {/* Right Content (70%) */}
      <div className="flex-1 p-10 flex flex-col gap-10">
        {/* Header Name */}
        <div>
          <Editable 
            tagName="h1" 
            className="text-6xl font-black tracking-tighter mb-4 block text-gray-900" 
            value={data.personalInfo.name} 
            onChange={(val) => update(d => d.personalInfo.name = val)} 
            isEditing={isEditing}
          />
          {data.summary && (
            <div className="group/section relative">
              <Editable tagName="p" className="text-xl text-gray-500 font-light leading-relaxed" value={data.summary} onChange={(val) => update(d => d.summary = val)} isEditing={isEditing} />
              <SectionControls onDelete={() => update(d => d.summary = "")} className="absolute -right-8 top-0" isEditing={isEditing} />
            </div>
          )}
          {!data.summary && <AddSectionButton label="Summary" onClick={() => update(d => d.summary = "Startup summary...")} isEditing={isEditing} />}
        </div>

        {/* Experience */}
        {(data.experience?.length || 0) > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6 group/section">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <span className="w-8 h-1 rounded-full" style={{ backgroundColor: colorAccent }}></span>
                Experience
              </h2>
              <SectionControls onDelete={() => update(d => d.experience = [])} isEditing={isEditing} />
            </div>
            <div className="space-y-8">
              {data.experience.map((exp, i) => (
                <div key={i} className="relative group pl-4 border-l-2 border-gray-100 hover:border-gray-200 transition-colors break-inside-avoid">
                  <div className="flex justify-between items-baseline mb-2">
                    <Editable tagName="h3" className="text-xl font-bold text-gray-800" value={exp.role} onChange={(val) => update(d => d.experience[i].role = val)} isEditing={isEditing} />
                    <div className="text-sm font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                      <Editable value={exp.startDate} onChange={(val) => update(d => d.experience[i].startDate = val)} isEditing={isEditing} /> - <Editable value={exp.endDate} onChange={(val) => update(d => d.experience[i].endDate = val)} isEditing={isEditing} />
                    </div>
                  </div>
                  <div className="text-lg font-medium text-gray-500 mb-3">
                    <Editable value={exp.company} onChange={(val) => update(d => d.experience[i].company = val)} isEditing={isEditing} />
                  </div>
                  
                  <ul className="space-y-2 text-gray-600">
                    {exp.bullets.map((bullet, j) => (
                      <li key={j} className="relative group/bullet flex gap-3">
                        <span className="text-lg leading-none" style={{ color: colorAccent }}>▸</span>
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

        {/* Projects */}
        {(data.projects?.length || 0) > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6 group/section">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <span className="w-8 h-1 rounded-full" style={{ backgroundColor: colorAccent }}></span>
                Projects
              </h2>
              <SectionControls onDelete={() => update(d => d.projects = [])} isEditing={isEditing} />
            </div>
            <div className="grid grid-cols-2 gap-6">
              {(data.projects || []).map((proj, i) => (
                <div key={i} className="relative group bg-gray-50 p-6 rounded-2xl hover:shadow-md transition-shadow break-inside-avoid">
                  <div className="flex justify-between items-start mb-2">
                    <Editable tagName="h3" className="font-bold text-lg text-gray-800" value={proj.name} onChange={(val) => update(d => d.projects![i].name = val)} isEditing={isEditing} />
                    {proj.link && (
                      <Editable className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full" value={proj.link} onChange={(val) => update(d => d.projects![i].link = val)} placeholder="Link" isEditing={isEditing} />
                    )}
                  </div>
                  <Editable tagName="p" className="text-gray-600 text-sm mb-4" value={proj.description} onChange={(val) => update(d => d.projects![i].description = val)} isEditing={isEditing} />
                  <div className="flex flex-wrap gap-1">
                    {(proj.technologies || []).map((tech, ti) => (
                      <span key={ti} className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-white px-2 py-1 rounded border border-gray-100">
                        <Editable value={tech} onChange={(val) => update(d => d.projects![i].technologies![ti] = val)} isEditing={isEditing} />
                      </span>
                    ))}
                  </div>
                  <RemoveButton onClick={() => update(d => d.projects!.splice(i, 1))} isEditing={isEditing} />
                </div>
              ))}
              <AddButton onClick={() => update(d => { if(!d.projects) d.projects=[]; d.projects.push(emptyProject) })} label="Add Project" isEditing={isEditing} />
            </div>
          </section>
        )}
        {(!data.projects?.length) && <AddSectionButton label="Projects" onClick={() => update(d => d.projects = [emptyProject])} isEditing={isEditing} />}

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
  );
}
