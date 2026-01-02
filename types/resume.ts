export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  linkedin?: string;
  github?: string;
  website?: string;
  location?: string;
}

export interface Experience {
  company: string;
  title?: string;  // preferred
  role?: string;   // legacy alias
  startDate: string;
  endDate: string;
  location?: string;
  bullets: string[];
}

export interface Education {
  institution?: string;  // preferred
  school?: string;       // legacy alias
  degree: string;
  graduationDate?: string;  // preferred
  year?: string;            // legacy alias
  gpa?: string;
  honors?: string;
  coursework?: string[];
}

export interface Project {
  name: string;
  description: string;
  technologies?: string[];
  url?: string;    // preferred
  link?: string;   // legacy alias
  date?: string;
}

export interface Certification {
  name: string;
  issuer?: string;
  date?: string;
}

export interface Award {
  title: string;
  date?: string;
  issuer?: string;
}

export interface CustomSection {
  title: string;
  content?: string;         // paragraph format
  items?: string[];         // simple list format
  detailedItems?: {         // detailed items format (legacy)
    name?: string;
    description?: string;
    date?: string;
    bullets?: string[];
  }[];
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary?: string;
  experience?: Experience[];
  education?: Education[];
  skills?: string[];
  projects?: Project[];
  certifications?: Certification[];
  languages?: string[];
  interests?: string[];
  awards?: (string | Award)[];  // Can be string array or Award objects
  customSections?: CustomSection[];
  sectionOrder?: string[];
}
