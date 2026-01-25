import React from 'react';

const Education = () => {
    const educationData = [
        {
            institution: 'University of Example',
            degree: 'Bachelor of Science in Computer Science',
            year: '2018 - 2022',
        },
        {
            institution: 'Example High School',
            degree: 'High School Diploma',
            year: '2014 - 2018',
        },
    ];

    return (
        <div className="education">
            <h2>Education</h2>
            <ul>
                {educationData.map((edu, index) => (
                    <li key={index}>
                        <h3>{edu.degree}</h3>
                        <p>{edu.institution}</p>
                        <p>{edu.year}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Education;