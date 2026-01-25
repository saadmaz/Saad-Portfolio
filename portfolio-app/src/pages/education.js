import React, { useState, useEffect } from 'react';
import '../styles/education.css';

const Education = () => {
    const [education, setEducation] = useState([]);

    useEffect(() => {
        // Import data from data.json
        fetch('/src/assets/data.json')
            .then(res => res.json())
            .then(data => setEducation(data.education))
            .catch(err => console.error('Error loading education data:', err));
    }, []);

    return (
        <section id="education" className="education-section">
            <div className="container">
                <h2 className="section-title">Education</h2>
                <div className="education-grid">
                    {education.map(edu => (
                        <div key={edu.id} className="education-card">
                            <div className="education-header">
                                <h3 className="school-name">{edu.school}</h3>
                                <span className="graduation-year">{edu.endDate}</span>
                            </div>
                            <div className="education-details">
                                <p className="degree">{edu.degree}</p>
                                <p className="field">{edu.field}</p>
                                {edu.gpa && <p className="gpa">GPA: {edu.gpa}</p>}
                            </div>
                            <p className="description">{edu.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Education;