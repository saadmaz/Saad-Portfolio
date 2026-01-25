import React from 'react';
import './header.css';

const Header = () => {
    return (
        <header className="header">
            <h1 className="site-title">My Portfolio</h1>
            <nav className="navigation">
                <ul>
                    <li><a href="#blogs">Blogs</a></li>
                    <li><a href="#education">Education</a></li>
                    <li><a href="#experience">Experience</a></li>
                    <li><a href="#skills">Skills</a></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;