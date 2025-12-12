import React from 'react';
import { TemplateProps } from './types';
import { ResumeData } from '@/types/resume';
import { Editable, AddButton, RemoveButton, SectionControls, AddSectionButton, CustomSectionRenderer } from './TemplateComponents';
import { X } from 'lucide-react';

export default function MinimalistTemplate({ data, colorAccent, isEditing, onUpdate }: TemplateProps) {
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
      className="w-full h-full bg-white p-10 text-gray-900 font-serif flex flex-col gap-6 group/resume"
    >
      {/* Header */}
      <header className="border-b-2 border-gray-900 pb-6" style={{ borderColor: colorAccent }}>
        <Editable tagName="h1" className="text-4xl font-bold uppercase tracking-tight mb-2 block" style={{ color: colorAccent }} value={data.personalInfo.name} onChange={(val) => update(d => d.personalInfo.name = val)} isEditing={isEditing} />
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <Editable value={data.personalInfo.email} onChange={(val) => update(d => d.personalInfo.email = val)} isEditing={isEditing} />
          <span>•</span>
          <Editable value={data.personalInfo.phone} onChange={(val) => update(d => d.personalInfo.phone = val)} isEditing={isEditing} />
          <div className="flex items-center gap-2">
            <span>•</span>
            <Editable value={data.personalInfo.linkedin} onChange={(val) => update(d => d.personalInfo.linkedin = val)} placeholder="LinkedIn" className="hover:underline" isEditing={isEditing} />
          </div>
          <div className="flex items-center gap-2">
            <span>•</span>
            <Editable value={data.personalInfo.github} onChange={(val) => update(d => d.personalInfo.github = val)} placeholder="GitHub" className="hover:underline" isEditing={isEditing} />
          </div>
          <div className="flex items-center gap-2">
            <span>•</span>
            <Editable value={data.personalInfo.website} onChange={(val) => update(d => d.personalInfo.website = val)} placeholder="Portfolio" className="hover:underline" isEditing={isEditing} />
          </div>
          <div className="flex items-center gap-2">
            <span>•</span>
            <Editable value={data.personalInfo.location} onChange={(val) => update(d => d.personalInfo.location = val)} placeholder="Location" isEditing={isEditing} />
          </div>
        </div>
      </header>

      {/* Summary */}
      {data.summary && (
      <section className="break-inside-avoid group/section">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold uppercase tracking-wider" style={{ color: colorAccent }}>Professional Summary</h2>
          <SectionControls onDelete={() => update(d => d.summary = "")} isEditing={isEditing} />
        </div>
        <Editable tagName="p" className="leading-relaxed text-gray-700" value={data.summary} onChange={(val) => update(d => d.summary = val)} isEditing={isEditing} />
      </section>
      )}
      {!data.summary && <AddSectionButton label="Professional Summary" onClick={() => update(d => d.summary = "Professional summary goes here...")} isEditing={isEditing} />}

      {/* Experience */}
      {(data.experience?.length || 0) > 0 && (
      <section className="break-inside-avoid">
        <div className="flex items-center justify-between mb-4 group/section">
          <h2 className="text-lg font-bold uppercase tracking-wider" style={{ color: colorAccent }}>Experience</h2>
          <SectionControls onDelete={() => update(d => d.experience = [])} isEditing={isEditing} />
        </div>
        <div className="space-y-6">
          {data.experience.map((exp, i) => (
            <div key={i} className="relative group break-inside-avoid">
              <div className="flex justify-between items-baseline mb-1">
                <Editable tagName="h3" className="font-bold text-lg" value={exp.company} onChange={(val) => update(d => d.experience[i].company = val)} isEditing={isEditing} />
                <div className="text-sm italic">
                  <Editable value={exp.startDate} onChange={(val) => update(d => d.experience[i].startDate = val)} isEditing={isEditing} /> — <Editable value={exp.endDate} onChange={(val) => update(d => d.experience[i].endDate = val)} isEditing={isEditing} />
                </div>
              </div>
              <div className="flex justify-between text-gray-700 italic mb-2">
                <Editable value={exp.role} onChange={(val) => update(d => d.experience[i].role = val)} isEditing={isEditing} />
                <Editable className="text-xs not-italic" value={exp.location} onChange={(val) => update(d => d.experience[i].location = val)} placeholder="Location" isEditing={isEditing} />
              </div>
              <ul className="list-disc list-outside ml-5 space-y-1 text-gray-700">
                {exp.bullets.map((bullet, j) => (
                  <li key={j} className="pl-1 relative group/bullet">
                    <Editable value={bullet} onChange={(val) => update(d => d.experience[i].bullets[j] = val)} isEditing={isEditing} />
                    {isEditing && (
                      <button 
                        onClick={() => update(d => d.experience[i].bullets.splice(j, 1))}
                        className="absolute -left-5 top-1 text-red-300 hover:text-red-500 opacity-0 group-hover/bullet:opacity-100"
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
        <section className="break-inside-avoid">
          <div className="flex items-center justify-between mb-4 group/section">
            <h2 className="text-lg font-bold uppercase tracking-wider" style={{ color: colorAccent }}>Projects</h2>
            <SectionControls onDelete={() => update(d => d.projects = [])} isEditing={isEditing} />
          </div>
          <div className="space-y-4">
            {(data.projects || []).map((proj, i) => (
              <div key={i} className="relative group break-inside-avoid">
                <div className="flex justify-between items-baseline">
                  <div className="flex items-center gap-2">
                    <Editable tagName="h3" className="font-bold text-md" value={proj.name} onChange={(val) => update(d => d.projects![i].name = val)} isEditing={isEditing} />
                    <Editable className="text-xs font-normal text-blue-600 hover:underline" value={proj.link} onChange={(val) => update(d => d.projects![i].link = val)} placeholder="Link" isEditing={isEditing} />
                  </div>
                </div>
                <Editable tagName="p" className="text-gray-700" value={proj.description} onChange={(val) => update(d => d.projects![i].description = val)} isEditing={isEditing} />
                <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-1">
                  <span>Tech:</span>
                  {(proj.technologies || []).map((tech, ti) => (
                    <div key={ti} className="relative group/tech inline-block">
                      <Editable value={tech} onChange={(val) => update(d => d.projects![i].technologies![ti] = val)} isEditing={isEditing} />
                      {ti < (proj.technologies?.length || 0) - 1 && <span className="mx-1.5 text-gray-300">|</span>}
                      {isEditing && (
                        <button 
                          onClick={() => update(d => d.projects![i].technologies!.splice(ti, 1))}
                          className="absolute -top-2 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/tech:opacity-100 transition-opacity w-3 h-3 flex items-center justify-center"
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

      {/* Education */}
      {(data.education?.length || 0) > 0 && (
      <section className="break-inside-avoid">
        <div className="flex items-center justify-between mb-4 group/section">
          <h2 className="text-lg font-bold uppercase tracking-wider" style={{ color: colorAccent }}>Education</h2>
          <SectionControls onDelete={() => update(d => d.education = [])} isEditing={isEditing} />
        </div>
        <div className="space-y-4">
          {data.education.map((edu, i) => (
            <div key={i} className="relative group flex justify-between break-inside-avoid">
              <div>
                <Editable tagName="div" className="font-bold" value={edu.school} onChange={(val) => update(d => d.education[i].school = val)} isEditing={isEditing} />
                <Editable tagName="div" value={edu.degree} onChange={(val) => update(d => d.education[i].degree = val)} isEditing={isEditing} />
                <div className="text-sm text-gray-500 flex gap-1">
                  GPA: <Editable value={edu.gpa} onChange={(val) => update(d => d.education[i].gpa = val)} placeholder="..." isEditing={isEditing} />
                </div>
              </div>
              <div className="text-sm">
                <Editable value={edu.year} onChange={(val) => update(d => d.education[i].year = val)} isEditing={isEditing} />
              </div>
              <RemoveButton onClick={() => update(d => d.education.splice(i, 1))} isEditing={isEditing} />
            </div>
          ))}
          <AddButton onClick={() => update(d => d.education.push(emptyEducation))} label="Add Education" isEditing={isEditing} />
        </div>
      </section>
      )}
      {(!data.education.length) && <AddSectionButton label="Education" onClick={() => update(d => d.education = [emptyEducation])} isEditing={isEditing} />}

      {/* Certifications */}
      {(data.certifications?.length || 0) > 0 && (
        <section className="break-inside-avoid">
          <div className="flex items-center justify-between mb-4 group/section">
            <h2 className="text-lg font-bold uppercase tracking-wider" style={{ color: colorAccent }}>Certifications</h2>
            <SectionControls onDelete={() => update(d => d.certifications = [])} isEditing={isEditing} />
          </div>
          <div className="space-y-2">
            {(data.certifications || []).map((cert, i) => (
              <div key={i} className="relative group flex justify-between break-inside-avoid">
                <div className="flex gap-2">
                  <Editable tagName="span" className="font-bold" value={cert.name} onChange={(val) => update(d => d.certifications![i].name = val)} isEditing={isEditing} />
                  <span className="text-gray-400">|</span>
                  <Editable tagName="span" className="text-gray-600" value={cert.issuer} onChange={(val) => update(d => d.certifications![i].issuer = val)} isEditing={isEditing} />
                </div>
                <div className="text-sm text-gray-600">
                  <Editable value={cert.date} onChange={(val) => update(d => d.certifications![i].date = val)} isEditing={isEditing} />
                </div>
                <RemoveButton onClick={() => update(d => d.certifications!.splice(i, 1))} isEditing={isEditing} />
              </div>
            ))}
            <AddButton onClick={() => update(d => { if(!d.certifications) d.certifications=[]; d.certifications.push(emptyCertification) })} label="Add Cert" isEditing={isEditing} />
          </div>
        </section>
      )}
      {(!data.certifications?.length) && <AddSectionButton label="Certifications" onClick={() => update(d => d.certifications = [emptyCertification])} isEditing={isEditing} />}

      {/* Skills */}
      {(data.skills?.length || 0) > 0 && (
      <section className="break-inside-avoid">
        <div className="flex items-center justify-between mb-3 group/section">
          <h2 className="text-lg font-bold uppercase tracking-wider" style={{ color: colorAccent }}>Skills</h2>
          <SectionControls onDelete={() => update(d => d.skills = [])} isEditing={isEditing} />
        </div>
        <div className="flex flex-wrap gap-2 leading-relaxed text-gray-700">
          {data.skills.map((skill, i) => (
            <div key={i} className="relative group inline-block">
              <Editable value={skill} onChange={(val) => update(d => d.skills[i] = val)} isEditing={isEditing} />
              {i < data.skills.length - 1 && <span className="mx-1.5 text-gray-300">|</span>}
              {isEditing && (
                <button 
                  onClick={() => update(d => d.skills.splice(i, 1))}
                  className="absolute -top-2 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity w-3 h-3 flex items-center justify-center"
                >
                  <X size={8} />
                </button>
              )}
            </div>
          ))}
          <AddButton onClick={() => update(d => d.skills.push("New Skill"))} label="+" isEditing={isEditing} />
        </div>
      </section>
      )}
      {(!data.skills.length) && <AddSectionButton label="Skills" onClick={() => update(d => d.skills = ["New Skill"])} isEditing={isEditing} />}

      {/* Awards */}
      {(data.awards?.length || 0) > 0 && (
        <section className="break-inside-avoid">
          <div className="flex items-center justify-between mb-4 group/section">
            <h2 className="text-lg font-bold uppercase tracking-wider" style={{ color: colorAccent }}>Awards</h2>
            <SectionControls onDelete={() => update(d => d.awards = [])} isEditing={isEditing} />
          </div>
          <div className="space-y-2">
            {(data.awards || []).map((award, i) => (
              <div key={i} className="relative group flex justify-between break-inside-avoid">
                <div className="flex gap-2">
                  <Editable tagName="span" className="font-bold" value={award.title} onChange={(val) => update(d => d.awards![i].title = val)} isEditing={isEditing} />
                  <span className="text-gray-400">|</span>
                  <Editable tagName="span" className="text-gray-600" value={award.issuer} onChange={(val) => update(d => d.awards![i].issuer = val)} isEditing={isEditing} />
                </div>
                <div className="text-sm text-gray-600">
                  <Editable value={award.date} onChange={(val) => update(d => d.awards![i].date = val)} isEditing={isEditing} />
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
      <section className="break-inside-avoid">
        <div className="flex items-center justify-between mb-3 group/section">
          <h2 className="text-lg font-bold uppercase tracking-wider" style={{ color: colorAccent }}>Languages</h2>
          <SectionControls onDelete={() => update(d => d.languages = [])} isEditing={isEditing} />
        </div>
        <div className="flex flex-wrap gap-2 leading-relaxed text-gray-700">
          {(data.languages || []).map((lang, i) => (
            <div key={i} className="relative group inline-block">
              <Editable value={lang} onChange={(val) => update(d => d.languages![i] = val)} isEditing={isEditing} />
              {i < (data.languages?.length || 0) - 1 && <span> • </span>}
              {isEditing && (
                <button 
                  onClick={() => update(d => d.languages!.splice(i, 1))}
                  className="absolute -top-2 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity w-3 h-3 flex items-center justify-center"
                >
                  <X size={8} />
                </button>
              )}
            </div>
          ))}
          <AddButton onClick={() => update(d => { if(!d.languages) d.languages=[]; d.languages.push("Language") })} label="+" isEditing={isEditing} />
        </div>
      </section>
      )}
      {(!data.languages?.length) && <AddSectionButton label="Languages" onClick={() => update(d => d.languages = ["Language"])} isEditing={isEditing} />}

      {/* Interests */}
      {(data.interests?.length || 0) > 0 && (
      <section className="break-inside-avoid">
        <div className="flex items-center justify-between mb-3 group/section">
          <h2 className="text-lg font-bold uppercase tracking-wider" style={{ color: colorAccent }}>Interests</h2>
          <SectionControls onDelete={() => update(d => d.interests = [])} isEditing={isEditing} />
        </div>
        <div className="flex flex-wrap gap-2 leading-relaxed text-gray-700">
          {(data.interests || []).map((int, i) => (
            <div key={i} className="relative group inline-block">
              <Editable value={int} onChange={(val) => update(d => d.interests![i] = val)} isEditing={isEditing} />
              {i < (data.interests?.length || 0) - 1 && <span> • </span>}
              {isEditing && (
                <button 
                  onClick={() => update(d => d.interests!.splice(i, 1))}
                  className="absolute -top-2 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity w-3 h-3 flex items-center justify-center"
                >
                  <X size={8} />
                </button>
              )}
            </div>
          ))}
          <AddButton onClick={() => update(d => { if(!d.interests) d.interests=[]; d.interests.push("Interest") })} label="+" isEditing={isEditing} />
        </div>
      </section>
      )}
      {(!data.interests?.length) && <AddSectionButton label="Interests" onClick={() => update(d => d.interests = ["Interest"])} isEditing={isEditing} />}

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
