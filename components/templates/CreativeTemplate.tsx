import React from 'react';
import { TemplateProps } from './types';
import { ResumeData } from '@/types/resume';
import { Editable, AddButton, RemoveButton, SectionControls, AddSectionButton, CustomSectionRenderer } from './TemplateComponents';
import { X } from 'lucide-react';

export default function CreativeTemplate({ data, colorAccent, isEditing, onUpdate }: TemplateProps) {
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
    <div className="w-full h-full bg-white font-sans flex flex-col">
      {/* Header */}
      <header className="p-10 text-white" style={{ backgroundColor: colorAccent }}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Editable 
              tagName="h1" 
              className="text-5xl font-black tracking-tight mb-4 block" 
              value={data.personalInfo.name} 
              onChange={(val) => update(d => d.personalInfo.name = val)} 
              isEditing={isEditing}
            />
            <Editable 
              tagName="p" 
              className="text-xl opacity-90 font-light tracking-wide mb-6 block" 
              value={data.personalInfo.location} 
              onChange={(val) => update(d => d.personalInfo.location = val)} 
              isEditing={isEditing}
            />
            <div className="flex flex-wrap gap-4 text-sm font-medium opacity-80">
              <Editable value={data.personalInfo.email} onChange={(val) => update(d => d.personalInfo.email = val)} isEditing={isEditing} />
              <Editable value={data.personalInfo.phone} onChange={(val) => update(d => d.personalInfo.phone = val)} isEditing={isEditing} />
              {data.personalInfo.linkedin && (
                <Editable value={data.personalInfo.linkedin} onChange={(val) => update(d => d.personalInfo.linkedin = val)} placeholder="LinkedIn" className="hover:underline" isEditing={isEditing} />
              )}
              {data.personalInfo.website && (
                <Editable value={data.personalInfo.website} onChange={(val) => update(d => d.personalInfo.website = val)} placeholder="Portfolio" className="hover:underline" isEditing={isEditing} />
              )}
            </div>
          </div>
          
          {/* Initials Circle */}
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl font-bold shrink-0 ml-6" style={{ color: colorAccent }}>
            {data.personalInfo.name.charAt(0)}
          </div>
        </div>
      </header>

      <div className="flex flex-1 p-10 gap-10">
        {/* Left Column (Main Content) */}
        <div className="flex-[2] flex flex-col gap-8">
          
          {/* Summary */}
          {data.summary && (
            <section className="group/section">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-800">About Me</h2>
                <SectionControls onDelete={() => update(d => d.summary = "")} isEditing={isEditing} />
              </div>
              <Editable tagName="p" className="text-gray-600 leading-relaxed" value={data.summary} onChange={(val) => update(d => d.summary = val)} isEditing={isEditing} />
            </section>
          )}
          {!data.summary && <AddSectionButton label="About Me" onClick={() => update(d => d.summary = "Creative summary goes here...")} isEditing={isEditing} />}

          {/* Experience */}
          {(data.experience?.length || 0) > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6 group/section">
                <h2 className="text-2xl font-bold text-gray-800">Experience</h2>
                <SectionControls onDelete={() => update(d => d.experience = [])} isEditing={isEditing} />
              </div>
              <div className="space-y-8 border-l-2 border-gray-100 pl-6 ml-2">
                {data.experience.map((exp, i) => (
                  <div key={i} className="relative group break-inside-avoid">
                    {/* Timeline Dot */}
                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: colorAccent }}></div>
                    
                    <div className="mb-2">
                      <Editable tagName="h3" className="text-xl font-bold text-gray-800" value={exp.role} onChange={(val) => update(d => d.experience[i].role = val)} isEditing={isEditing} />
                      <div className="flex justify-between items-center mt-1">
                        <Editable className="text-lg font-medium text-gray-600" value={exp.company} onChange={(val) => update(d => d.experience[i].company = val)} isEditing={isEditing} />
                        <div className="text-sm font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                          <Editable value={exp.startDate} onChange={(val) => update(d => d.experience[i].startDate = val)} isEditing={isEditing} /> - <Editable value={exp.endDate} onChange={(val) => update(d => d.experience[i].endDate = val)} isEditing={isEditing} />
                        </div>
                      </div>
                    </div>
                    
                    <ul className="space-y-2 text-gray-600 mt-3">
                      {exp.bullets.map((bullet, j) => (
                        <li key={j} className="relative group/bullet pl-4">
                          <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-gray-300"></span>
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
                <h2 className="text-2xl font-bold text-gray-800">Projects</h2>
                <SectionControls onDelete={() => update(d => d.projects = [])} isEditing={isEditing} />
              </div>
              <div className="grid grid-cols-1 gap-6">
                {(data.projects || []).map((proj, i) => (
                  <div key={i} className="relative group bg-gray-50 p-5 rounded-xl border border-gray-100 break-inside-avoid">
                    <div className="flex justify-between items-start mb-2">
                      <Editable tagName="h3" className="font-bold text-lg text-gray-800" value={proj.name} onChange={(val) => update(d => d.projects![i].name = val)} isEditing={isEditing} />
                      <Editable className="text-xs font-bold text-white px-2 py-1 rounded" style={{ backgroundColor: colorAccent }} value={proj.link} onChange={(val) => update(d => d.projects![i].link = val)} placeholder="Link" isEditing={isEditing} />
                    </div>
                    <Editable tagName="p" className="text-gray-600 text-sm mb-3" value={proj.description} onChange={(val) => update(d => d.projects![i].description = val)} isEditing={isEditing} />
                    <div className="flex flex-wrap gap-2">
                      {(proj.technologies || []).map((tech, ti) => (
                        <div key={ti} className="relative group/tech">
                          <span className="text-xs font-medium text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded-md">
                            <Editable value={tech} onChange={(val) => update(d => d.projects![i].technologies![ti] = val)} isEditing={isEditing} />
                          </span>
                          {isEditing && (
                            <button 
                              onClick={() => update(d => d.projects![i].technologies!.splice(ti, 1))}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/tech:opacity-100 transition-opacity w-3 h-3 flex items-center justify-center z-10"
                            >
                              <X size={8} />
                            </button>
                          )}
                        </div>
                      ))}
                      <AddButton onClick={() => update(d => { if(!d.projects![i].technologies) d.projects![i].technologies=[]; d.projects![i].technologies!.push("Tech") })} label="+" isEditing={isEditing} />
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

        {/* Right Column (Sidebar) */}
        <div className="flex-1 flex flex-col gap-8">
          
          {/* Skills Cloud */}
          {(data.skills?.length || 0) > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4 group/section">
                <h2 className="text-xl font-bold text-gray-800">Skills</h2>
                <SectionControls onDelete={() => update(d => d.skills = [])} isEditing={isEditing} />
              </div>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, i) => (
                  <div key={i} className="relative group">
                    <span 
                      className="px-3 py-1.5 rounded-full text-sm font-medium text-white shadow-sm block transition-transform hover:scale-105"
                      style={{ backgroundColor: colorAccent }}
                    >
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
            </section>
          )}
          {(!data.skills.length) && <AddSectionButton label="Skills" onClick={() => update(d => d.skills = ["New Skill"])} isEditing={isEditing} />}

          {/* Education */}
          {(data.education?.length || 0) > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4 group/section">
                <h2 className="text-xl font-bold text-gray-800">Education</h2>
                <SectionControls onDelete={() => update(d => d.education = [])} isEditing={isEditing} />
              </div>
              <div className="space-y-6">
                {data.education.map((edu, i) => (
                  <div key={i} className="relative group break-inside-avoid">
                    <Editable tagName="div" className="font-bold text-gray-800" value={edu.school} onChange={(val) => update(d => d.education[i].school = val)} isEditing={isEditing} />
                    <Editable tagName="div" className="text-sm text-gray-600 mb-1" value={edu.degree} onChange={(val) => update(d => d.education[i].degree = val)} isEditing={isEditing} />
                    <div className="flex justify-between text-xs font-medium text-gray-400">
                      <Editable value={edu.year} onChange={(val) => update(d => d.education[i].year = val)} isEditing={isEditing} />
                      {edu.gpa && <Editable value={edu.gpa} onChange={(val) => update(d => d.education[i].gpa = val)} placeholder="GPA" isEditing={isEditing} />}
                    </div>
                    <RemoveButton onClick={() => update(d => d.education.splice(i, 1))} isEditing={isEditing} />
                  </div>
                ))}
                <AddButton onClick={() => update(d => d.education.push(emptyEducation))} label="Add Education" isEditing={isEditing} />
              </div>
            </section>
          )}
          {(!data.education.length) && <AddSectionButton label="Education" onClick={() => update(d => d.education = [emptyEducation])} isEditing={isEditing} />}

          {/* Awards */}
          {(data.awards?.length || 0) > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4 group/section">
                <h2 className="text-xl font-bold text-gray-800">Awards</h2>
                <SectionControls onDelete={() => update(d => d.awards = [])} isEditing={isEditing} />
              </div>
              <div className="space-y-4">
                {(data.awards || []).map((award, i) => (
                  <div key={i} className="relative group border-l-2 pl-3 break-inside-avoid" style={{ borderColor: colorAccent }}>
                    <Editable tagName="h3" className="font-bold text-sm text-gray-800" value={award.title} onChange={(val) => update(d => d.awards![i].title = val)} isEditing={isEditing} />
                    <div className="text-xs text-gray-500 mt-1">
                      <Editable value={award.issuer} onChange={(val) => update(d => d.awards![i].issuer = val)} isEditing={isEditing} /> • <Editable value={award.date} onChange={(val) => update(d => d.awards![i].date = val)} isEditing={isEditing} />
                    </div>
                    <RemoveButton onClick={() => update(d => d.awards!.splice(i, 1))} isEditing={isEditing} />
                  </div>
                ))}
                <AddButton onClick={() => update(d => { if(!d.awards) d.awards=[]; d.awards.push(emptyAward) })} label="Add Award" isEditing={isEditing} />
              </div>
            </section>
          )}
          {(!data.awards?.length) && <AddSectionButton label="Awards" onClick={() => update(d => d.awards = [emptyAward])} isEditing={isEditing} />}

          {/* Languages */}
          {(data.languages?.length || 0) > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4 group/section">
                <h2 className="text-xl font-bold text-gray-800">Languages</h2>
                <SectionControls onDelete={() => update(d => d.languages = [])} isEditing={isEditing} />
              </div>
              <div className="space-y-2">
                {(data.languages || []).map((lang, i) => (
                  <div key={i} className="relative group flex items-center justify-between">
                    <Editable className="font-medium text-gray-700" value={lang} onChange={(val) => update(d => d.languages![i] = val)} isEditing={isEditing} />
                    {isEditing && (
                      <button 
                        onClick={() => update(d => d.languages!.splice(i, 1))}
                        className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <AddButton onClick={() => update(d => { if(!d.languages) d.languages=[]; d.languages.push("Language") })} label="Add" isEditing={isEditing} />
              </div>
            </section>
          )}
          {(!data.languages?.length) && <AddSectionButton label="Languages" onClick={() => update(d => d.languages = ["Language"])} isEditing={isEditing} />}

        </div>
      </div>
    </div>
  );
}
