import React from 'react';
import { TemplateProps } from './types';
import { ResumeData } from '@/types/resume';
import { Editable, AddButton, RemoveButton, SectionControls, AddSectionButton, CustomSectionRenderer } from './TemplateComponents';
import { X } from 'lucide-react';

export default function ModernTemplate({ data, colorAccent, isEditing, onUpdate }: TemplateProps) {
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
    <div 
      className="w-full h-full bg-white flex text-sm text-gray-800 font-sans group/resume"
    >
      {/* Sidebar */}
      <div className="w-[32%] bg-slate-900 text-white p-6 flex flex-col gap-6 shrink-0 print:bg-slate-900 print:text-white min-h-full">
        <div className="text-center">
          <div 
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white shadow-lg"
            style={{ backgroundColor: colorAccent }}
          >
            {data.personalInfo.name.charAt(0)}
          </div>
          <Editable 
            tagName="h1" 
            className="text-lg font-bold uppercase tracking-wider leading-tight mb-2 block" 
            value={data.personalInfo.name} 
            onChange={(val) => update(d => d.personalInfo.name = val)} 
            isEditing={isEditing}
          />
          <Editable 
            tagName="p" 
            className="text-slate-400 text-xs block" 
            value={data.personalInfo.location} 
            onChange={(val) => update(d => d.personalInfo.location = val)} 
            isEditing={isEditing}
          />
        </div>

        <div className="space-y-3 text-xs text-slate-300">
          <div className="flex items-center gap-3">
            <span className="opacity-70">📧</span> 
            <Editable value={data.personalInfo.email} onChange={(val) => update(d => d.personalInfo.email = val)} className="break-all" isEditing={isEditing} />
          </div>
          <div className="flex items-center gap-3">
            <span className="opacity-70">📱</span> 
            <Editable value={data.personalInfo.phone} onChange={(val) => update(d => d.personalInfo.phone = val)} isEditing={isEditing} />
          </div>
          <div className="flex items-center gap-3">
            <span className="opacity-70">🔗</span> 
            <Editable value={data.personalInfo.linkedin} onChange={(val) => update(d => d.personalInfo.linkedin = val)} className="break-all" placeholder="LinkedIn URL" isEditing={isEditing} />
          </div>
          <div className="flex items-center gap-3">
            <span className="opacity-70">💻</span> 
            <Editable value={data.personalInfo.github} onChange={(val) => update(d => d.personalInfo.github = val)} className="break-all" placeholder="GitHub URL" isEditing={isEditing} />
          </div>
          <div className="flex items-center gap-3">
            <span className="opacity-70">🌐</span> 
            <Editable value={data.personalInfo.website} onChange={(val) => update(d => d.personalInfo.website = val)} className="break-all" placeholder="Portfolio URL" isEditing={isEditing} />
          </div>
        </div>

        {/* Skills */}
        {(data.skills?.length || 0) > 0 && (
        <div className="break-inside-avoid">
          <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-1 group/section">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Skills</h3>
            <SectionControls onDelete={() => update(d => d.skills = [])} isEditing={isEditing} />
          </div>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, i) => (
              <div key={i} className="relative group">
                <span className="bg-slate-800 px-2 py-1 rounded text-xs text-slate-200 block border border-slate-700">
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
            <AddButton onClick={() => update(d => d.skills.push("New Skill"))} label="Add" className="text-slate-400 hover:text-white" isEditing={isEditing} />
          </div>
        </div>
        )}
        {(!data.skills?.length) && <AddSectionButton label="Skills" onClick={() => update(d => d.skills = ["New Skill"])} isEditing={isEditing} />}

        {/* Education */}
        {(data.education?.length || 0) > 0 && (
        <div className="break-inside-avoid">
          <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-1 group/section">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Education</h3>
            <SectionControls onDelete={() => update(d => d.education = [])} isEditing={isEditing} />
          </div>
          <div className="space-y-4">
            {data.education.map((edu, i) => (
              <div key={i} className="relative group">
                <Editable tagName="div" className="font-bold text-white" value={edu.school} onChange={(val) => update(d => d.education[i].school = val)} isEditing={isEditing} />
                <Editable tagName="div" className="text-slate-300" value={edu.degree} onChange={(val) => update(d => d.education[i].degree = val)} isEditing={isEditing} />
                <div className="flex justify-between text-slate-400 text-[10px] mt-1">
                  <Editable value={edu.year} onChange={(val) => update(d => d.education[i].year = val)} isEditing={isEditing} />
                  <Editable value={edu.gpa} onChange={(val) => update(d => d.education[i].gpa = val)} placeholder="GPA" isEditing={isEditing} />
                </div>
                <RemoveButton onClick={() => update(d => d.education.splice(i, 1))} className="text-red-400" isEditing={isEditing} />
              </div>
            ))}
            <AddButton onClick={() => update(d => d.education.push(emptyEducation))} label="Add Education" className="text-slate-400 hover:text-white" isEditing={isEditing} />
          </div>
        </div>
        )}
        {(!data.education?.length) && <AddSectionButton label="Education" onClick={() => update(d => d.education = [emptyEducation])} isEditing={isEditing} />}

        {/* Certifications */}
        {(data.certifications?.length || 0) > 0 && (
          <div className="break-inside-avoid">
            <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-1 mt-6 group/section">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Certifications</h3>
              <SectionControls onDelete={() => update(d => d.certifications = [])} isEditing={isEditing} />
            </div>
            <div className="space-y-3">
              {(data.certifications || []).map((cert, i) => (
                <div key={i} className="relative group">
                  <Editable tagName="div" className="font-bold text-white" value={cert.name} onChange={(val) => update(d => d.certifications![i].name = val)} isEditing={isEditing} />
                  <div className="flex justify-between text-slate-400 text-[10px]">
                    <Editable value={cert.issuer} onChange={(val) => update(d => d.certifications![i].issuer = val)} isEditing={isEditing} />
                    <Editable value={cert.date} onChange={(val) => update(d => d.certifications![i].date = val)} isEditing={isEditing} />
                  </div>
                  <RemoveButton onClick={() => update(d => d.certifications!.splice(i, 1))} className="text-red-400" isEditing={isEditing} />
                </div>
              ))}
              <AddButton onClick={() => update(d => { if(!d.certifications) d.certifications=[]; d.certifications.push(emptyCertification) })} label="Add Cert" className="text-slate-400 hover:text-white" isEditing={isEditing} />
            </div>
          </div>
        )}
        {(!data.certifications?.length) && <AddSectionButton label="Certifications" onClick={() => update(d => d.certifications = [emptyCertification])} isEditing={isEditing} />}

        {/* Languages */}
        {(data.languages?.length || 0) > 0 && (
          <div className="break-inside-avoid">
            <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-1 mt-6 group/section">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Languages</h3>
              <SectionControls onDelete={() => update(d => d.languages = [])} isEditing={isEditing} />
            </div>
            <div className="flex flex-wrap gap-2">
              {(data.languages || []).map((lang, i) => (
                <div key={i} className="relative group">
                  <span className="bg-slate-800 px-2 py-1 rounded text-xs text-slate-200 block border border-slate-700">
                    <Editable value={lang} onChange={(val) => update(d => d.languages![i] = val)} isEditing={isEditing} />
                  </span>
                  {isEditing && (
                    <button 
                      onClick={() => update(d => d.languages!.splice(i, 1))}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity w-3 h-3 flex items-center justify-center"
                    >
                      <X size={8} />
                    </button>
                  )}
                </div>
              ))}
              <AddButton onClick={() => update(d => { if(!d.languages) d.languages=[]; d.languages.push("Language") })} label="Add" className="text-slate-400 hover:text-white" isEditing={isEditing} />
            </div>
          </div>
        )}
        {(!data.languages?.length) && <AddSectionButton label="Languages" onClick={() => update(d => d.languages = ["Language"])} isEditing={isEditing} />}

        {/* Interests */}
        {(data.interests?.length || 0) > 0 && (
          <div className="break-inside-avoid">
            <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-1 mt-6 group/section">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Interests</h3>
              <SectionControls onDelete={() => update(d => d.interests = [])} isEditing={isEditing} />
            </div>
            <div className="flex flex-wrap gap-2">
              {(data.interests || []).map((int, i) => (
                <div key={i} className="relative group">
                  <span className="bg-slate-800 px-2 py-1 rounded text-xs text-slate-200 block border border-slate-700">
                    <Editable value={int} onChange={(val) => update(d => d.interests![i] = val)} isEditing={isEditing} />
                  </span>
                  {isEditing && (
                    <button 
                      onClick={() => update(d => d.interests!.splice(i, 1))}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity w-3 h-3 flex items-center justify-center"
                    >
                      <X size={8} />
                    </button>
                  )}
                </div>
              ))}
              <AddButton onClick={() => update(d => { if(!d.interests) d.interests=[]; d.interests.push("Interest") })} label="Add" className="text-slate-400 hover:text-white" isEditing={isEditing} />
            </div>
          </div>
        )}
        {(!data.interests?.length) && <AddSectionButton label="Interests" onClick={() => update(d => d.interests = ["Interest"])} isEditing={isEditing} />}
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full p-8 flex flex-col gap-6">
        {/* Summary */}
        {data.summary && (
        <div className="break-inside-avoid group/section">
          <div className="flex items-center justify-between mb-3 border-b pb-1" style={{ borderColor: colorAccent }}>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Profile</h2>
            <SectionControls onDelete={() => update(d => d.summary = "")} isEditing={isEditing} />
          </div>
          <Editable 
            tagName="p" 
            className="text-gray-600 leading-relaxed text-sm" 
            value={data.summary} 
            onChange={(val) => update(d => d.summary = val)} 
            isEditing={isEditing}
          />
        </div>
        )}
        {!data.summary && <AddSectionButton label="Profile" onClick={() => update(d => d.summary = "Professional summary goes here...")} isEditing={isEditing} />}

        {/* Experience */}
        {(data.experience?.length || 0) > 0 && (
        <div className="break-inside-avoid">
          <div className="flex items-center justify-between mb-4 border-b pb-1 group/section" style={{ borderColor: colorAccent }}>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Experience</h2>
            <SectionControls onDelete={() => update(d => d.experience = [])} isEditing={isEditing} />
          </div>
          <div className="space-y-6">
            {data.experience.map((exp, i) => (
              <div key={i} className="relative group break-inside-avoid">
                <div className="flex justify-between items-baseline mb-1">
                  <Editable tagName="h3" className="text-base font-bold text-slate-800" value={exp.role} onChange={(val) => update(d => d.experience[i].role = val)} isEditing={isEditing} />
                  <div className="text-xs font-bold whitespace-nowrap ml-4" style={{ color: colorAccent }}>
                    <Editable value={exp.startDate} onChange={(val) => update(d => d.experience[i].startDate = val)} isEditing={isEditing} /> - <Editable value={exp.endDate} onChange={(val) => update(d => d.experience[i].endDate = val)} isEditing={isEditing} />
                  </div>
                </div>
                <div className="flex justify-between text-gray-600 text-sm font-medium mb-2">
                  <Editable value={exp.company} onChange={(val) => update(d => d.experience[i].company = val)} isEditing={isEditing} />
                  <Editable className="text-xs text-gray-400" value={exp.location} onChange={(val) => update(d => d.experience[i].location = val)} placeholder="Location" isEditing={isEditing} />
                </div>
                <ul className="list-disc list-outside ml-4 space-y-1.5 text-gray-600 text-xs leading-relaxed marker:text-gray-400">
                  {exp.bullets.map((bullet, j) => (
                    <li key={j} className="pl-1 relative group/bullet">
                      <Editable value={bullet} onChange={(val) => update(d => d.experience[i].bullets[j] = val)} isEditing={isEditing} />
                      {isEditing && (
                        <button 
                          onClick={() => update(d => d.experience[i].bullets.splice(j, 1))}
                          className="absolute -left-4 top-0.5 text-red-300 hover:text-red-500 opacity-0 group-hover/bullet:opacity-100"
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
        </div>
        )}
        {(!data.experience.length) && <AddSectionButton label="Experience" onClick={() => update(d => d.experience = [emptyExperience])} isEditing={isEditing} />}

        {/* Projects */}
        {(data.projects?.length || 0) > 0 && (
          <div className="break-inside-avoid">
            <div className="flex items-center justify-between mb-4 border-b pb-1 group/section" style={{ borderColor: colorAccent }}>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Projects</h2>
              <SectionControls onDelete={() => update(d => d.projects = [])} isEditing={isEditing} />
            </div>
            <div className="grid grid-cols-1 gap-5">
              {(data.projects || []).map((proj, i) => (
                <div key={i} className="relative group break-inside-avoid">
                  <div className="flex justify-between items-start mb-1">
                    <Editable tagName="h3" className="font-bold text-slate-800 text-sm" value={proj.name} onChange={(val) => update(d => d.projects![i].name = val)} isEditing={isEditing} />
                    <Editable className="text-[10px] text-blue-500 hover:underline shrink-0 ml-2 bg-blue-50 px-2 py-0.5 rounded-full" value={proj.link} onChange={(val) => update(d => d.projects![i].link = val)} placeholder="Link" isEditing={isEditing} />
                  </div>
                  <Editable tagName="p" className="text-gray-600 text-xs leading-relaxed mb-2" value={proj.description} onChange={(val) => update(d => d.projects![i].description = val)} isEditing={isEditing} />
                  <div className="flex flex-wrap items-center gap-y-1 text-xs text-gray-600 mt-1">
                    {(proj.technologies || []).map((tech, ti) => (
                      <div key={ti} className="relative group/tech flex items-center">
                        <span className="font-medium">
                          <Editable value={tech} onChange={(val) => update(d => d.projects![i].technologies![ti] = val)} isEditing={isEditing} />
                        </span>
                        {ti < (proj.technologies?.length || 0) - 1 && <span className="mx-1.5 text-gray-300">|</span>}
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
                    <AddButton onClick={() => update(d => { if(!d.projects![i].technologies) d.projects![i].technologies=[]; d.projects![i].technologies!.push("Tech") })} label="Add" isEditing={isEditing} />
                  </div>
                  <RemoveButton onClick={() => update(d => d.projects!.splice(i, 1))} isEditing={isEditing} />
                </div>
              ))}
              <AddButton onClick={() => update(d => { if(!d.projects) d.projects=[]; d.projects.push(emptyProject) })} label="Add Project" isEditing={isEditing} />
            </div>
          </div>
        )}
        {(!data.projects?.length) && <AddSectionButton label="Projects" onClick={() => update(d => d.projects = [emptyProject])} isEditing={isEditing} />}

        {/* Awards */}
        {(data.awards?.length || 0) > 0 && (
          <div className="break-inside-avoid">
            <div className="flex items-center justify-between mb-4 border-b pb-1 group/section" style={{ borderColor: colorAccent }}>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Awards</h2>
              <SectionControls onDelete={() => update(d => d.awards = [])} isEditing={isEditing} />
            </div>
            <div className="space-y-3">
              {(data.awards || []).map((award, i) => (
                <div key={i} className="relative group break-inside-avoid">
                  <div className="flex justify-between items-baseline mb-1">
                    <Editable tagName="h3" className="font-bold text-slate-800 text-sm" value={award.title} onChange={(val) => update(d => d.awards![i].title = val)} isEditing={isEditing} />
                    <Editable className="text-xs font-bold whitespace-nowrap ml-4" style={{ color: colorAccent }} value={award.date} onChange={(val) => update(d => d.awards![i].date = val)} isEditing={isEditing} />
                  </div>
                  <Editable className="text-gray-600 text-xs" value={award.issuer} onChange={(val) => update(d => d.awards![i].issuer = val)} isEditing={isEditing} />
                  <RemoveButton onClick={() => update(d => d.awards!.splice(i, 1))} isEditing={isEditing} />
                </div>
              ))}
              <AddButton onClick={() => update(d => { if(!d.awards) d.awards=[]; d.awards.push(emptyAward) })} label="Add Award" isEditing={isEditing} />
            </div>
          </div>
        )}
        {(!data.awards?.length) && <AddSectionButton label="Awards" onClick={() => update(d => d.awards = [emptyAward])} isEditing={isEditing} />}

        {/* Custom Sections */}
        {(data.customSections || []).map((section, i) => (
          <CustomSectionRenderer
            key={i}
            section={section}
            index={i}
            colorAccent={colorAccent}
            isEditing={isEditing}
            onUpdate={(newSection) => update(d => {
                if (!d.customSections) d.customSections = [];
                d.customSections[i] = newSection;
            })}
            onDelete={() => update(d => d.customSections?.splice(i, 1))}
          />
        ))}
        <AddSectionButton label="Custom Section" onClick={() => update(d => {
            if (!d.customSections) d.customSections = [];
            d.customSections.push({ title: "New Section", items: [] });
        })} isEditing={isEditing} />
      </div>
    </div>
  );
}
