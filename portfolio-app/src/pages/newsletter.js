import React, { useState, useEffect } from 'react';
import '../styles/newsletter.css';

const Newsletter = () => {
    const [newsletters, setNewsletters] = useState([]);
    const [selectedNewsletter, setSelectedNewsletter] = useState(null);

    useEffect(() => {
        fetch('/src/assets/data.json')
            .then(res => res.json())
            .then(data => {
                const sorted = data.newsletters.sort((a, b) => 
                    new Date(b.date) - new Date(a.date)
                );
                setNewsletters(sorted);
                if (sorted.length > 0) setSelectedNewsletter(sorted[0]);
            })
            .catch(err => console.error('Error loading newsletters:', err));
    }, []);

    return (
        <section id="newsletter" className="newsletter-section">
            <div className="container">
                <h2 className="section-title">LinkedIn Newsletters</h2>
                <div className="newsletter-container">
                    <div className="newsletter-main">
                        {selectedNewsletter && (
                            <div className="newsletter-display">
                                <h3>{selectedNewsletter.title}</h3>
                                <p className="newsletter-date">
                                    {new Date(selectedNewsletter.date).toLocaleDateString()}
                                </p>
                                <div className="newsletter-content">
                                    {selectedNewsletter.content}
                                </div>
                                <a 
                                    href={selectedNewsletter.linkedinUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="linkedin-btn"
                                >
                                    View on LinkedIn
                                </a>
                            </div>
                        )}
                    </div>
                    <div className="newsletter-sidebar">
                        <h4>All Newsletters</h4>
                        <div className="newsletter-list">
                            {newsletters.map(nl => (
                                <div 
                                    key={nl.id}
                                    className={`newsletter-item ${selectedNewsletter?.id === nl.id ? 'active' : ''}`}
                                    onClick={() => setSelectedNewsletter(nl)}
                                >
                                    <p className="nl-title">{nl.title}</p>
                                    <p className="nl-date">
                                        {new Date(nl.date).toLocaleDateString()}
                                    </p>
                                    {nl.isLatest && <span className="latest-badge">Latest</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Newsletter;