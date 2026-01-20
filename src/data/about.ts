
export const languages = [
    { name: "English", level: "Native", stars: 5 },
    { name: "Sinhala", level: "Native", stars: 5 },
    { name: "Tamil", level: "Conversational", stars: 3 },
    // Spanish and Mandarin were in AboutSection but not AboutPage. Adding them for completeness if desired, 
    // checking AboutSection content again... 
    // AboutSection had: English, Spanish, Mandarin, Sinhala, Tamil. 
    // AboutPage had: English, Sinhala, Tamil.
    // I will include all unique ones.
    { name: "Spanish", level: "Fluent", stars: 4 },
    { name: "Mandarin", level: "Conversational", stars: 2 },
];

export const volunteer = [
    {
        org: "Code for Good",
        role: "Lead Mentor",
        period: "2022 - Present",
        description: "Teaching coding to underserved students",
        impact: "Taught 50+ students to code"
    },
    {
        org: "Tech4Youth",
        role: "Volunteer Instructor", // Normalized from "Instructor" and "Volunteer Instructor"
        period: "2021 - 2022",
        description: "Weekly coding workshops",
        impact: "Led 40+ workshops" // AboutSection had "Weekly coding workshops" as impact? No, impact was "Weekly coding workshops" in AboutSection? Let's check.
        // AboutSection: { org: "Tech4Youth", role: "Volunteer Instructor", impact: "Weekly coding workshops" }
        // AboutPage: { org: "Tech4Youth", role: "Instructor", period: "2021 - 2022", description: "Weekly coding workshops", impact: "Led 40+ workshops" }
        // I'll use the AboutPage version as it seems more detailed.
    },
];

export const extracurricular = [
    { name: "Photography Club", role: "Member", description: "Street and landscape photography" },
    { name: "Entrepreneurship Club", role: "President", description: "Organizing startup events" },
];

export const sports = [
    { name: "Basketball", skill: "Teamwork & Communication", level: "Recreational" }, // skill from AboutSection, level from AboutPage. 
    // AboutPage skill was "Teamwork". AboutSection "Teamwork & Communication". I'll use the longer one.
    { name: "Swimming", skill: "Discipline & Endurance", level: "Competitive" },
    { name: "Chess", skill: "Strategic Thinking", level: "Club Level" },
];

export const awards = [
    { title: "Dean's List", issuer: "University of Technology", year: "2023-2024", description: "Academic excellence" },
    { title: "Best Hack Award", issuer: "HackMIT", year: "2023", description: "Winner among 200+ teams" },
    { title: "Google Developer Scholarship", issuer: "Google", year: "2022", description: "Awarded for potential in software development" }, // Added from AboutSection
];

export const events = [
    { title: "TechCrunch Disrupt", type: "Speaker", year: "2024" },
    { title: "Google I/O", type: "Attended", year: "2024" },
    { title: "HackMIT", type: "Organized", year: "2023" },
];
