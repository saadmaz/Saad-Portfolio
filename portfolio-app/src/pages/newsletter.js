import React, { useState, useEffect } from 'react';
import '../styles/newsletter.css';

const Newsletter = () => {
    const [newsletters, setNewsletters] = useState([]);

    useEffect(() => {
        fetch('/src/assets/data.json')
            .then(res => res.json())
            .then(data => {
                const sorted = data.newsletters.sort((a, b) => 
                    new Date(b.date) - new Date(a.date)
                );
                setNewsletters(sorted);
            });
    }, []);

    return (
        <section id="newsletter" className="newsletter-section">
            <div className="container">
                <h2 className="section-title">LinkedIn Newsletters</h2>
                <a href="https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7337874498160848896" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="subscribe-btn">
                    Subscribe on LinkedIn
                </a>

                <div className="newsletters-grid">
                    {newsletters.map(nl => (
                        <div key={nl.id} className="newsletter-card">
                            <h3>{nl.title}</h3>
                            <p className="date">{new Date(nl.date).toLocaleDateString()}</p>
                            <p className="excerpt">{nl.excerpt}</p>
                            <a href={nl.linkedinUrl} 
                               target="_blank" 
                               rel="noopener noreferrer"
                               className="read-btn">
                                Read on LinkedIn →
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Newsletter;