import React from 'react';
import { Link } from 'react-router-dom';
import './MentorNavbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <ul className="navbar-list">
                <li className="navbar-item">
                    <Link to="/mentor/doubts" className="navbar-link">Doubts</Link>
                </li>
                <li className="navbar-item">
                    <Link to="/mentor/schedule" className="navbar-link">Schedule</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;

