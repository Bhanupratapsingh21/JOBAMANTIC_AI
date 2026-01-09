// src/types/resume.ts
export interface PersonalInfo {
    fullName: string;
    headline: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
    linkedin: string;
    github: string;
}

export interface Education {
    id: number;
    institution: string;
    location: string;
    degree: string;
    minor?: string;
    startDate: string;
    endDate: string;
    gpa?: string;
}

export interface Experience {
    id: number;
    company: string;
    location: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string[];
}

export interface Project {
    id: number;
    name: string;
    technologies: string;
    startDate: string;
    endDate: string;
    description: string[];
}

export interface Skills {
    languages: string[];
    frameworks: string[];
    tools: string[];
    libraries: string[];
}

export interface ResumeData {
    personalInfo: PersonalInfo;
    summary: string;
    education: Education[];
    experience: Experience[];
    projects: Project[];
    skills: Skills;
    template: string; // Add this field
}

// Template names as union type for type safety
export type TemplateName =
    | 'jake'
    | 'modern'
    | 'classic'
    | 'executive'
    | 'minimal'
    | 'academic';

export interface ResumePreviewProps {
    data: ResumeData;
    template: TemplateName;
}

export interface SectionProps {
    title: string;
    children: React.ReactNode;
    modern?: boolean;
    classic?: boolean;
}

export interface TemplateProps {
    data: ResumeData;
}