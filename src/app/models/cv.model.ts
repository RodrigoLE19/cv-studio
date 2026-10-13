export interface Experience {
  id: string;
  position: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  ongoing: boolean;
  description: string;
}

export interface CvData {
  name: string;
  title: string;
  email: string;
  phone: string;
  city: string;
  profile: string;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  certifications: Certification[];
  projects: CvProject[];
  links: ProfessionalLink[];
}

export interface Skill {
  id: string;
  name: string;
}

export interface Language {
  id: string;
  name: string;
  level: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export type CvTemplate = 'classic' | 'modern';

export interface CvDocument {
  id: string;
  name: string;
  template: CvTemplate;
  updatedAt: string;
  data: CvData;
  design?: CvDesign;
}

export interface CvProject {
  id: string;
  name: string;
  description: string;
  technologies: string;
  url: string;
}

export interface ProfessionalLink {
  id: string;
  label: string;
  url: string;
}

export interface CvDesign {
  color: 'blue' | 'teal' | 'purple' | 'slate';
  font: 'sans' | 'serif' | 'mono';
  hiddenSections?: CvSection[];
}

export type CvSection =
  | 'profile'
  | 'experiences'
  | 'education'
  | 'projects'
  | 'skills'
  | 'languages'
  | 'certifications'
  | 'links';