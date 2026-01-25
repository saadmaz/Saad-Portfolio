import React from 'react';
import './skills.css';

const Skills = () => {
    const skills = {
        softSkills: ['Communication', 'Teamwork', 'Problem Solving'],
        peopleSkills: ['Empathy', 'Active Listening', 'Conflict Resolution'],
        frontEnd: ['HTML', 'CSS', 'JavaScript', 'React'],
        backEnd: ['Node.js', 'Express', 'MongoDB'],
        devOps: ['Docker', 'Kubernetes', 'CI/CD']
    };

    return (
        <div className="skills-container">
            <h1>Skills</h1>
            <div className="skills-category">
                <h2>Soft Skills</h2>
                <ul>
                    {skills.softSkills.map(skill => <li key={skill}>{skill}</li>)}
                </ul>
            </div>
            <div className="skills-category">
                <h2>People Skills</h2>
                <ul>
                    {skills.peopleSkills.map(skill => <li key={skill}>{skill}</li>)}
                </ul>
            </div>
            <div className="skills-category">
                <h2>Front-End Skills</h2>
                <ul>
                    {skills.frontEnd.map(skill => <li key={skill}>{skill}</li>)}
                </ul>
            </div>
            <div className="skills-category">
                <h2>Back-End Skills</h2>
                <ul>
                    {skills.backEnd.map(skill => <li key={skill}>{skill}</li>)}
                </ul>
            </div>
            <div className="skills-category">
                <h2>DevOps Skills</h2>
                <ul>
                    {skills.devOps.map(skill => <li key={skill}>{skill}</li>)}
                </ul>
            </div>
        </div>
    );
};

export default Skills;