import React from 'react';

const Experience = () => {
    const workExperience = [
        {
            title: 'Software Engineer',
            company: 'Tech Company',
            duration: 'June 2020 - Present',
            description: 'Developing and maintaining web applications using React and Node.js.'
        },
        {
            title: 'Intern',
            company: 'Startup Inc.',
            duration: 'Jan 2020 - May 2020',
            description: 'Assisted in the development of a mobile application and participated in code reviews.'
        }
    ];

    return (
        <div className="experience">
            <h2>Work Experience</h2>
            <ul>
                {workExperience.map((job, index) => (
                    <li key={index}>
                        <h3>{job.title} at {job.company}</h3>
                        <p>{job.duration}</p>
                        <p>{job.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Experience;