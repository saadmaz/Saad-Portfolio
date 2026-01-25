import React from 'react';
// Import your unique JSON sources directly
import cseRawData from "../../portfolio-app/src/assets/Newsletter/cse.json";
import founderRawData from "../../portfolio-app/src/assets/Newsletter/founder.json";
import '../styles/newsletter.css';

const Newsletter = () => {
    // 1. DATA PREPARATION: Extract and tag the sources
    const cseList = (cseRawData.newsletters || []).map(nl => ({ ...nl, type: 'CSE Newsroom' }));
    const founderList = (founderRawData.newsletters || []).map(nl => ({ ...nl, type: "Founders' Brief" }));

    // 2. MERGE & SORT: Create a single feed sorted by date
    const allNewsletters = [...cseList, ...founderList].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <section id="newsletter" className="newsletter-section">
            <div className="container">
                <h2 className="section-title">LinkedIn Newsletters</h2>
                
                {/* DUAL SUBSCRIBE BUTTONS */}
                <div className="subscribe-actions">
                    <a href="https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7337874498160848896" 
                       target="_blank" rel="noopener noreferrer" className="subscribe-btn cse">
                        Follow CSE Newsroom
                    </a>
                    <a href="https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=YOUR_FOUNDER_URN" 
                       target="_blank" rel="noopener noreferrer" className="subscribe-btn founder">
                        Follow Founders' Brief
                    </a>
                </div>

                <div className="newsletters-grid">
                    {allNewsletters.map(nl => (
                        <div key={`${nl.type}-${nl.id}`} className="newsletter-card">
                            <span className={`tag ${nl.type.toLowerCase().replace("'", "")}`}>{nl.type}</span>
                            <h3>{nl.title}</h3>
                            <p className="date">{new Date(nl.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            <p className="excerpt">{nl.content.substring(0, 100)}...</p>
                            <a href={nl.linkedinUrl} target="_blank" rel="noopener noreferrer" className="read-btn">
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