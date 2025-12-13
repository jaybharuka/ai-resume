import React from 'react';
import { TemplateProps } from './types';
import { ResumeData } from '@/types/resume';
import { Editable, AddButton, RemoveButton, SectionControls, AddSectionButton, CustomSectionRenderer } from './TemplateComponents';
import { X } from 'lucide-react';

export default function TechTemplate({ data, colorAccent, isEditing, onUpdate }: TemplateProps) {
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
    <div className="w-full h-full bg-[#1e1e1e] text-[#d4d4d4] font-mono flex text-sm">
      {/* Sidebar */}
      <div className="w-[280px] bg-[#252526] border-r border-[#333] p-6 flex flex-col gap-8 shrink-0">
        <div>
          <div className="text-[#569cd6] text-xs mb-2">const developer = {'{'}</div>
          <div className="pl-4 border-l border-[#404040]">
            <div className="mb-4">
              <span className="text-[#9cdcfe]">name: </span>
              <Editable 
                tagName="span" 
                className="text-[#ce9178] font-bold" 
                value={`"${data.personalInfo.name}"`} 
                onChange={(val) => update(d => d.personalInfo.name = val.replace(/"/g, ''))} 
                isEditing={isEditing}
              />,
            </div>
            <div className="mb-1">
              <span className="text-[#9cdcfe]">role: </span>
              <span className="text-[#ce9178]">&quot;Full Stack Developer&quot;</span>,
            </div>
            <div className="mb-1">
              <span className="text-[#9cdcfe]">location: </span>
              <Editable 
                tagName="span" 
                className="text-[#ce9178]" 
                value={`"${data.personalInfo.location}"`} 
                onChange={(val) => update(d => d.personalInfo.location = val.replace(/"/g, ''))} 
                isEditing={isEditing}
              />,
            </div>
          </div>
          <div className="text-[#569cd6] text-xs mt-2">{'}'};</div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-[#569cd6] font-bold mb-3 uppercase tracking-wider text-xs">{'// Contact'}</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#6a9955]">#</span>
              <Editable value={data.personalInfo.email} onChange={(val) => update(d => d.personalInfo.email = val)} isEditing={isEditing} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#6a9955]">#</span>
              <Editable value={data.personalInfo.phone} onChange={(val) => update(d => d.personalInfo.phone = val)} isEditing={isEditing} />
            </div>
            {data.personalInfo.linkedin && (
              <div className="flex items-center gap-2">
                <span className="text-[#6a9955]">#</span>
                <Editable value={data.personalInfo.linkedin} onChange={(val) => update(d => d.personalInfo.linkedin = val)} placeholder="LinkedIn" className="hover:text-[#569cd6]" isEditing={isEditing} />
              </div>
            )}
            {data.personalInfo.github && (
              <div className="flex items-center gap-2">
                <span className="text-[#6a9955]">#</span>
                <Editable value={data.personalInfo.github} onChange={(val) => update(d => d.personalInfo.github = val)} placeholder="GitHub" className="hover:text-[#569cd6]" isEditing={isEditing} />
              </div>
            )}
          </div>
        </div>

        {/* Skills */}
        {(data.skills?.length || 0) > 0 && (
          <div className="group/section break-inside-avoid">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[#569cd6] font-bold uppercase tracking-wider text-xs">{'// Skills'}</h3>
              <SectionControls onDelete={() => update(d => d.skills = [])} isEditing={isEditing} />
            </div>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, i) => (
                <div key={i} className="relative group">
                  <span className="bg-[#3c3c3c] px-2 py-1 rounded text-xs text-[#d4d4d4] border border-[#404040]">
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
              <AddButton onClick={() => update(d => d.skills.push("New Skill"))} label="Add" className="text-[#808080] hover:text-white" isEditing={isEditing} />
            </div>
          </div>
        )}
        {(!data.skills.length) && <AddSectionButton label="Skills" onClick={() => update(d => d.skills = ["New Skill"])} isEditing={isEditing} />}

        {/* Education */}
        {(data.education?.length || 0) > 0 && (
          <div className="group/section break-inside-avoid">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[#569cd6] font-bold uppercase tracking-wider text-xs">{'// Education'}</h3>
              <SectionControls onDelete={() => update(d => d.education = [])} isEditing={isEditing} />
            </div>
            <div className="space-y-4">
              {data.education.map((edu, i) => (
                <div key={i} className="relative group">
                  <Editable tagName="div" className="font-bold text-[#dcdcaa]" value={edu.school} onChange={(val) => update(d => d.education[i].school = val)} isEditing={isEditing} />
                  <Editable tagName="div" className="text-[#9cdcfe] text-xs" value={edu.degree} onChange={(val) => update(d => d.education[i].degree = val)} isEditing={isEditing} />
                  <div className="flex justify-between text-[#808080] text-[10px] mt-1">
                    <Editable value={edu.year} onChange={(val) => update(d => d.education[i].year = val)} isEditing={isEditing} />
                  </div>
                  <RemoveButton onClick={() => update(d => d.education.splice(i, 1))} className="text-red-400" isEditing={isEditing} />
                </div>
              ))}
              <AddButton onClick={() => update(d => d.education.push(emptyEducation))} label="Add Education" className="text-[#808080] hover:text-white" isEditing={isEditing} />
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 flex flex-col gap-8 overflow-hidden">
        
        {/* Summary */}
        {data.summary && (
          <section className="group/section">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-[#c586c0]">function <span className="text-[#dcdcaa]">getSummary</span>() {'{'}</h2>
              <SectionControls onDelete={() => update(d => d.summary = "")} isEditing={isEditing} />
            </div>
            <div className="pl-4 border-l border-[#404040] ml-2">
              <span className="text-[#569cd6]">return</span> <span className="text-[#ce9178]">`</span>
              <Editable tagName="span" className="text-[#ce9178] leading-relaxed block my-1" value={data.summary} onChange={(val) => update(d => d.summary = val)} isEditing={isEditing} />
              <span className="text-[#ce9178]">`</span>;
            </div>
            <div className="text-[#c586c0] mt-1">{'}'}</div>
          </section>
        )}
        {!data.summary && <AddSectionButton label="Summary" onClick={() => update(d => d.summary = "Tech summary...")} isEditing={isEditing} />}

        {/* Experience */}
        {(data.experience?.length || 0) > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4 group/section">
              <h2 className="text-lg font-bold text-[#c586c0]">class <span className="text-[#4ec9b0]">Experience</span> {'{'}</h2>
              <SectionControls onDelete={() => update(d => d.experience = [])} isEditing={isEditing} />
            </div>
            <div className="space-y-6 pl-4 border-l border-[#404040] ml-2">
              {data.experience.map((exp, i) => (
                <div key={i} className="relative group break-inside-avoid">
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[#569cd6]">public</span>
                      <Editable tagName="h3" className="text-[#dcdcaa] font-bold" value={exp.role} onChange={(val) => update(d => d.experience[i].role = val)} isEditing={isEditing} />
                    </div>
                    <div className="text-xs text-[#808080]">
                      <span className="text-[#808080]">{'// '}</span>
                      <Editable value={exp.startDate} onChange={(val) => update(d => d.experience[i].startDate = val)} isEditing={isEditing} /> - <Editable value={exp.endDate} onChange={(val) => update(d => d.experience[i].endDate = val)} isEditing={isEditing} />
                    </div>
                  </div>
                  <div className="text-[#4ec9b0] text-sm mb-2">
                    @<Editable value={exp.company} onChange={(val) => update(d => d.experience[i].company = val)} isEditing={isEditing} />
                  </div>
                  
                  <div className="text-[#808080] text-xs mb-1">{'/** Achievements */'}</div>
                  <ul className="space-y-1 text-[#d4d4d4] text-xs font-light">
                    {exp.bullets.map((bullet, j) => (
                      <li key={j} className="relative group/bullet flex gap-2">
                        <span className="text-[#6a9955]">*</span>
                        <Editable value={bullet} onChange={(val) => update(d => d.experience[i].bullets[j] = val)} isEditing={isEditing} />
                        {isEditing && (
                          <button 
                            onClick={() => update(d => d.experience[i].bullets.splice(j, 1))}
                            className="absolute -left-4 top-0 text-red-400 opacity-0 group-hover/bullet:opacity-100"
                          >
                            <X size={10} />
                          </button>
                        )}
                      </li>
                    ))}
                    <AddButton onClick={() => update(d => d.experience[i].bullets.push("New achievement"))} label="Add" className="text-[#808080] hover:text-white" isEditing={isEditing} />
                  </ul>
                  <RemoveButton onClick={() => update(d => d.experience.splice(i, 1))} isEditing={isEditing} />
                </div>
              ))}
              <AddButton onClick={() => update(d => d.experience.push(emptyExperience))} label="Add Experience" className="text-[#808080] hover:text-white" isEditing={isEditing} />
            </div>
            <div className="text-[#c586c0] mt-2">{'}'}</div>
          </section>
        )}
        {(!data.experience.length) && <AddSectionButton label="Experience" onClick={() => update(d => d.experience = [emptyExperience])} isEditing={isEditing} />}

        {/* Projects */}
        {(data.projects?.length || 0) > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4 group/section">
              <h2 className="text-lg font-bold text-[#c586c0]">const <span className="text-[#4ec9b0]">projects</span> = [</h2>
              <SectionControls onDelete={() => update(d => d.projects = [])} isEditing={isEditing} />
            </div>
            <div className="grid grid-cols-1 gap-4 pl-4 border-l border-[#404040] ml-2">
              {(data.projects || []).map((proj, i) => (
                <div key={i} className="relative group bg-[#252526] p-4 rounded border border-[#333] break-inside-avoid">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex gap-2">
                      <span className="text-[#da70d6]">{'{'}</span>
                      <span className="text-[#9cdcfe]">name:</span>
                      <Editable tagName="h3" className="text-[#ce9178]" value={`"${proj.name}"`} onChange={(val) => update(d => d.projects![i].name = val.replace(/"/g, ''))} isEditing={isEditing} />
                      <span className="text-[#d4d4d4]">,</span>
                    </div>
                    <Editable className="text-[10px] text-[#569cd6] hover:underline" value={proj.link} onChange={(val) => update(d => d.projects![i].link = val)} placeholder="git_url" isEditing={isEditing} />
                  </div>
                  
                  <div className="ml-4 mb-2">
                    <span className="text-[#9cdcfe]">desc:</span> <span className="text-[#ce9178]">&quot;</span>
                    <Editable tagName="span" className="text-[#ce9178] text-xs" value={proj.description} onChange={(val) => update(d => d.projects![i].description = val)} isEditing={isEditing} />
                    <span className="text-[#ce9178]">&quot;</span><span className="text-[#d4d4d4]">,</span>
                  </div>

                  <div className="ml-4 flex flex-wrap items-center">
                    <span className="text-[#9cdcfe]">stack:</span> <span className="text-[#da70d6]">[</span>
                    {(proj.technologies || []).map((tech, ti) => (
                      <span key={ti} className="relative group/tech">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 mr-2 mb-2 whitespace-nowrap leading-none">
                          <Editable className="bg-transparent text-slate-700 text-xs font-medium p-0 m-0 focus:outline-none" value={tech} onChange={(val) => update(d => d.projects![i].technologies![ti] = val)} isEditing={isEditing} />
                        </span>
                        {isEditing && (
                          <button 
                            onClick={() => update(d => d.projects![i].technologies!.splice(ti, 1))}
                            className="absolute -top-2 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/tech:opacity-100 transition-opacity w-3 h-3 flex items-center justify-center z-10"
                          >
                            <X size={8} />
                          </button>
                        )}
                      </span>
                    ))}
                    <AddButton onClick={() => update(d => { if(!d.projects![i].technologies) d.projects![i].technologies=[]; d.projects![i].technologies!.push("Tech") })} label="+" className="text-[#808080] hover:text-white" isEditing={isEditing} />
                    <span className="text-[#da70d6]">]</span>
                  </div>
                  
                  <div className="text-[#da70d6] mt-1">{'}'},</div>
                  <RemoveButton onClick={() => update(d => d.projects!.splice(i, 1))} isEditing={isEditing} />
                </div>
              ))}
              <AddButton onClick={() => update(d => { if(!d.projects) d.projects=[]; d.projects.push(emptyProject) })} label="Add Project" className="text-[#808080] hover:text-white" isEditing={isEditing} />
            </div>
            <div className="text-[#c586c0] mt-2">];</div>
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
