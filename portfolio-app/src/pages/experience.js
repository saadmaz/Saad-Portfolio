import React, { useState, useEffect } from 'react';
import '../styles/experience.css';

const Experience = () => {
    const [experiences, setExperiences] = useState([]);

    useEffect(() => {
        fetch('/src/assets/data.json')
            .then(res => res.json())
            .then(data => setExperiences(data.experience))
            .catch(err => console.error('Error loading experience data:', err));
    }, []);

    return (
        <section id="experience" className="experience-section">
            <div className="container">
                <h2 className="section-title">Work Experience</h2>
                <div className="experience-timeline">
                    {experiences.map(exp => (
                        <div key={exp.id} className="experience-card">
                            <div className="timeline-marker"></div>
                            <div className="experience-content">
                                <div className="experience-header">
                                    <h3 className="position">{exp.position}</h3>
                                    <span className="company">{exp.company}</span>
                                </div>
                                <p className="date-range">
                                    {exp.startDate} - {exp.endDate}
                                </p>
                                <p className="description">{exp.description}</p>
                                <div className="tech-stack">
                                    {exp.technologies.map((tech, idx) => (
                                        <span key={idx} className="tech-badge">{tech}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Experience;