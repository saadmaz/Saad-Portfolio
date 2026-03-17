import 'dotenv/config';
import { connectDB } from '../utils/database.js';
import { 
  projectRepository,
  experienceRepository,
  skillRepository,
  certificateRepository
} from '../models/index.js';

import path from 'path';

async function seedData() {
  console.log('🔄 Connecting to Firebase...');
  const db = await connectDB();
  if (!db) {
    console.error('❌ Failed to connect to Firebase. Check credentials.');
    process.exit(1);
  }
  console.log('✅ Connected to Firebase.');

  try {
    // Projects
    console.log('🔄 Seeding Projects...');
    try {
      const { projects } = await import('../../../frontend/src/data/static/projects.js');
      for (const p of projects) {
          const existing = await projectRepository.getBySlug(p.slug);
          if (!existing) {
              // Map frontend to backend schema
              const projectData: any = {
                  slug: p.slug,
                  title: p.title,
                  description: p.overview || p.tagline || "",
                  long_description: p.overview,
                  date: p.date,
                  status: p.status,
                  stage: "Production",
                  type: "Web Application",
                  category: "Portfolio",
                  image: p.heroImage,
                  images: p.screenshots,
                  video: p.videoDemo,
                  live_preview: p.liveUrl,
                  github: p.githubUrl,
                  featured: p.id === 1 || p.slug.includes('portfolio'),
                  order_index: p.id,
                  technologies: p.techStack,
                  role: p.role,
                  challenges: p.challenges?.map((c: any) => c.wall),
                  learnings: p.challenges?.map((c: any) => c.lesson),
                  colour: p.colour
              };
              await projectRepository.create(projectData);
              console.log(`  ➕ Added Project: ${p.title}`);
          } else {
              console.log(`  ⏭️ Skipped Project: ${p.title} (Already exists)`);
          }
      }
    } catch (err: any) {
      console.error('  ❌ Error seeding projects:', err);
    }

    // Work Experience
    console.log('🔄 Seeding Work Experience...');
    try {
      const { workExperiences } = await import('../../../frontend/src/data/static/workExperience.js');
      for (const exp of workExperiences) {
          const existing = await experienceRepository.findByField('company', '==', exp.company);
          if (existing.length === 0) {
              // Map frontend to backend schema
              const experienceData: any = {
                  company: exp.company,
                  position: exp.position,
                  start_date: exp.startDate,
                  end_date: exp.endDate,
                  location: exp.location,
                  description: exp.description,
                  technologies: exp.technologies,
                  achievements: exp.achievements,
                  is_latest: exp.isCurrent
              };
              await experienceRepository.create(experienceData);
              console.log(`  ➕ Added Experience: ${exp.position} at ${exp.company}`);
          } else {
              console.log(`  ⏭️ Skipped Experience: ${exp.company} (Already exists)`);
          }
      }
    } catch (err: any) {
      console.error('  ❌ Error seeding experience:', err);
    }

    // Skills
    console.log('🔄 Seeding Skills...');
    try {
      const { skillSets } = await import('../../../frontend/src/data/static/skills.js');
      for (const skill of skillSets) {
          const existing = await skillRepository.findByField('category', '==', skill.category);
          if (existing.length === 0) {
              await skillRepository.create(skill as any);
              console.log(`  ➕ Added Skill Category: ${skill.category}`);
          } else {
              console.log(`  ⏭️ Skipped Skill Category: ${skill.category} (Already exists)`);
          }
      }
    } catch (err: any) {
      console.error('  ❌ Error seeding skills:', err);
    }

    // Certificates
    console.log('🔄 Seeding Certificates...');
    try {
      const { certificates } = await import('../../../frontend/src/data/static/certificates.js');
      for (const cert of certificates) {
          const existing = await certificateRepository.findByField('title', '==', cert.title);
          if (existing.length === 0) {
              await certificateRepository.create(cert as any);
              console.log(`  ➕ Added Certificate: ${cert.title}`);
          } else {
              console.log(`  ⏭️ Skipped Certificate: ${cert.title} (Already exists)`);
          }
      }
    } catch (err: any) {
      console.error('  ❌ Error seeding certificates:', err);
    }

    console.log('🎉 Database seeding process finished!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Critical error during database seeding:', error);
    process.exit(1);
  }
}

seedData();
