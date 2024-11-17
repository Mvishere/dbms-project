import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LogoutButton from '../Login/Logout.jsx';
import { url } from '../../constants.js';
import './MentorSchedules.css';
import MentorNavbar from './MentorNavbar.jsx';

const MentorSchedules = () => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const [schedules, setSchedules] = useState([]);
    const [login, setLogin] = useState(false)

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const response = await axios.post(
                    `${url}/users/mentor/getSchedules`,
                    {
                        cookies: {
                            accessToken: accessToken,
                            refreshToken: refreshToken
                        }
                    }
                );
                setLogin(true)
                setSchedules(response.data);
            } catch (error) {
                console.error('Error fetching schedules:', error);
            }
        };

        fetchSchedules();
    }, [accessToken, refreshToken]);

    return (
        <div className="mentor-schedules-container">
            <h1>My Schedule</h1>
            {login && <LogoutButton />}
            <MentorNavbar />
            <div className="schedule-list">
                {schedules.length === 0 ? (
                    <p>No schedules available.</p>
                ) : (
                    schedules.map((schedule, index) => (
                        <div key={index} className="schedule-item">
                            <p>Time: {schedule.time_slot}</p>
                            <p>Status: {schedule.status ? "booked" : "not booked"}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MentorSchedules;
