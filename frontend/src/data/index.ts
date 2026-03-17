/**
 * Central Data Export File
 * All portfolio data is organized into two categories:
 * 1. content/ - Portfolio projects, blogs, events, newsletters, hosting
 * 2. personal/ - Personal information: about, education, skills, work experience, certificates
 */

// ==================== CONTENT DATA ====================
// Projects, blogs, events, newsletters, and hosting information
export { default as projectsData } from './projects.json';
export { default as blogsData } from './content/blogs.json';
export { default as eventsData } from './content/events.json';
export { default as newslettersData } from './content/newsletters.json';
export { default as hostingData } from './content/hosting.json';

// ==================== PERSONAL DATA ====================
// Personal information and credentials
export { languages, volunteer, extracurricular, sports, awards, events as personalEvents } from './personal/about';
export { educationList } from './personal/education';
export { default as skillsData } from './skills.json';
export { default as workExperienceData } from './personal/workExperience.json';
export { default as certificatesData } from './certificates.json';
