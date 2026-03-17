export interface Project {
    id: number | string;
    slug: string;
    title: string;
    tagline: string;
    date?: string;
    status: string;
    gradientStart?: string;
    gradientEnd?: string;
    techStack: string[];
    role?: string;
    duration?: string;
    githubUrl?: string;
    liveUrl?: string;
    pdfReport?: string;
    heroImage: string;
    screenshots?: string[];
    videoDemo?: string;
    overview: string;
    problem?: string;
    solution?: string;
    impact?: string;
    architecture?: {
        description: string;
        diagramUrl: string;
    };
    databaseSchema?: string;
    apiDocs?: string;
    challenges?: Array<{
        wall: string;
        fix: string;
        lesson: string;
    }>;
    metrics?: {
        users: number;
        lighthouseScore: {
            performance: number;
            accessibility: number;
            seo: number;
        };
        testCoverage: number;
        cicd: string;
    };
    stackDeepDive?: {
        frontend: string;
        backend: string;
        aiIntegration: string;
    };
    roadmap?: string[];
    features?: string[];
    colour?: string;
    order_index?: number;
    featured?: boolean;
    category?: string;
}
export interface Skill {
    name: string;
    level: 'Beginner' | 'Intermediate' | 'Advance' | 'Expert';
    years: number;
    icon?: string;
}
export interface SkillSet {
    category: string;
    skills: Skill[];
}
export interface Experience {
    id: number | string;
    company: string;
    position: string;
    employmentType: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    location: string;
    workMode: string;
    department?: string;
    description: string;
    responsibilities: string[];
    technologies: string[];
    achievements: string[];
    companyUrl?: string;
    companyLogo?: string;
    companyIndustry?: string;
    companySize?: string;
    teamSize?: number;
    reportsTo?: string;
    directReports?: number;
    projectsHighlighted?: string[];
    referenceAvailable?: boolean;
    linkedinUrl?: string;
    mediaLinks?: string[];
}
export interface Certificate {
    id: string;
    title: string;
    issuer: string;
    platform: string;
    issuer_logo: string;
    issue_date: string;
    expiry_date: string | null;
    does_not_expire: boolean;
    credential_id?: string;
    credential_url: string;
    description: string;
    skills: string[];
    category: string;
    type: string;
    tags: string[];
    pdf_document_link: string;
    is_verifiable: boolean;
    is_featured: boolean;
}
export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    date: string;
    category: string;
    author: string;
    image?: string;
    tags?: string[];
    published: boolean;
    is_latest?: boolean;
}
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}
//# sourceMappingURL=index.d.ts.map