export const projects = [
    {
        id: 1,
        slug: "portfolio-website",
        title: "Portfolio Website",
        tagline: "A modern, responsive portfolio website built with React and TypeScript",
        date: "2025-06-01",
        status: "Live",
        gradientStart: "#4f46e5",
        gradientEnd: "#1e3a8a",
        techStack: ["React", "TypeScript", "Tailwind CSS", "Vite", "Framer Motion"],
        role: "Solo Developer",
        duration: "2 months",
        githubUrl: "https://github.com/saadmalik/portfolio",
        liveUrl: "https://saadmalik.dev",
        pdfReport: "none",
        heroImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=1400",
        screenshots: [
            "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600",
            "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600"
        ],
        videoDemo: "https://youtube.com/watch?v=demo1",
        overview: "A high-performance personal brand hub designed to showcase technical expertise through an interactive UI and integrated blog.",
        problem: "Generic templates failed to represent my specific technical skills in low-latency frontend development.",
        solution: "Built a custom engine using Vite for near-instant HMR and Tailwind for a design system that scales across all devices.",
        impact: "Resulted in 3 high-tier job offers and a 200% increase in LinkedIn profile views within the first month.",
        architecture: {
            description: "Component-based React architecture utilizing Atomic Design principles and deployed via Vercel's Edge Network.",
            diagramUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=1000"
        },
        databaseSchema: "",
        apiDocs: "",
        challenges: [
            { wall: "Achieving 100/100 Lighthouse scores", fix: "Implemented image webp conversion and dynamic imports for heavy components.", lesson: "Performance is a feature, not an afterthought." },
            { wall: "Complex scroll animations", fix: "Used Framer Motion with useInView hooks to trigger animations only when visible.", lesson: "Declarative animations keep code clean." }
        ],
        metrics: {
            users: 1500,
            lighthouseScore: { performance: 100, accessibility: 100, seo: 100 },
            testCoverage: 92,
            cicd: "Vercel Auto-deploy"
        },
        stackDeepDive: { frontend: "React 18 with TypeScript", backend: "N/A", aiIntegration: "" },
        roadmap: ["Add localized content (i18n)", "Integrate a custom MDX-based CMS", "Add a 3D Hero section with Three.js"],
        features: ["Dark Mode Engine", "Dynamic Project Routing", "Contact Form via Formspree"],
        colour: "from-indigo-900/40 to-blue-900/40"
    },
    // ... rest of projects would be here. Using a truncated list for brevity in this step
];
//# sourceMappingURL=projects.js.map