import React from 'react';
import { Link } from 'react-router-dom';
import './MentorNavbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <ul className="navbar-list">
                <li className="navbar-item">
                    <Link to="/students/doubts" className="navbar-link">Doubts</Link>
                </li>
                <li className="navbar-item">
                    <Link to="/student/schedule" className="navbar-link">Schedule</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;

