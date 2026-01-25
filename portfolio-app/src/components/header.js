import React from 'react';
import './header.css';

const Header = () => {
    return (
        <header className="header">
            <div className="header-container">
                <h1 className="site-title">Saad M</h1>
                <nav className="navigation">
                    <ul className="nav-list">
                        <li><a href="#home" className="nav-link nav-link--primary">Home</a></li>
                        <li><a href="#contact" className="nav-link nav-link--primary">Contact</a></li>
                        <li><a href="#blogs" className="nav-link nav-link--secondary">Blogs</a></li>
                        <li><a href="#education" className="nav-link nav-link--secondary">Education</a></li>
                        <li><a href="#experience" className="nav-link nav-link--secondary">Experience</a></li>
                        <li><a href="#skills" className="nav-link nav-link--secondary">Skills</a></li>
                        <li><a href="#newsletter" className="nav-link nav-link--secondary">Newsletter</a></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;