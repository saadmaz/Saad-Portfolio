export interface Blog {
    id: string;
    title: string;
    content: string;
    date: Date;
}

export interface Education {
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: Date;
    endDate: Date;
}

export interface WorkExperience {
    id: string;
    company: string;
    position: string;
    startDate: Date;
    endDate: Date;
    responsibilities: string[];
}

export interface Skill {
    name: string;
    category: 'soft' | 'people' | 'front-end' | 'back-end' | 'DevOps';
}

export interface Newsletter {
    id: string;
    title: string;
    link: string;
    date: Date;
}