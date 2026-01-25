import React, { useState, useEffect } from 'react';
import '../styles/skills.css';

const Skills = () => {
    const [skills, setSkills] = useState(null);

    useEffect(() => {
        fetch('/src/assets/data.json')
            .then(res => res.json())
            .then(data => setSkills(data.skills))
            .catch(err => console.error('Error loading skills data:', err));
    }, []);

    if (!skills) return <div>Loading...</div>;

    const SkillCategory = ({ title, skillsList }) => (
        <div className="skill-category">
            <h3 className="category-title">{title}</h3>
            <div className="skills-list">
                {skillsList.map(skill => (
                    <div key={skill.id} className="skill-item">
                        <div className="skill-header">
                            <span className="skill-name">{skill.skill}</span>
                            <span className="skill-level">{skill.level}/5</span>
                        </div>
                        <div className="skill-bar">
                            <div 
                                className="skill-progress" 
                                style={{ width: `${(skill.level / 5) * 100}%` }}
                            ></div>
                        </div>
                        {skill.description && (
                            <p className="skill-description">{skill.description}</p>
                        )}
                        {skill.years && (
                            <p className="skill-years">{skill.years} years experience</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <section id="skills" className="skills-section">
            <div className="container">
                <h2 className="section-title">Skills</h2>
                <div className="skills-grid">
                    <SkillCategory title="Soft Skills" skillsList={skills.softSkills} />
                    <SkillCategory title="Frontend" skillsList={skills.frontend} />
                    <SkillCategory title="Backend" skillsList={skills.backend} />
                    <SkillCategory title="DevOps" skillsList={skills.devops} />
                </div>
            </div>
        </section>
    );
};

export default Skills;