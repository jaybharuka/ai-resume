export interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    linkedin?: string;
    github?: string;
    website?: string;
    location?: string;
  };
  summary: string;
  experience: {
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    location?: string;
    bullets: string[];
  }[];
  education: {
    school: string;
    degree: string;
    year: string;
    gpa?: string;
  }[];
  skills: string[];
  projects?: {
    name: string;
    description: string;
    technologies?: string[];
    link?: string;
  }[];
  certifications?: {
    name: string;
    issuer: string;
    date: string;
  }[];
  languages?: string[];
  interests?: string[];
  awards?: {
    title: string;
    date: string;
    issuer: string;
  }[];
  customSections?: {
    title: string;
    items: {
      name?: string;
      description?: string;
      date?: string;
      bullets?: string[];
    }[];
  }[];
}
