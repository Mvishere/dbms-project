import React, { useEffect, useState } from 'react';
import { url } from '../../constants.js';
import LogoutButton from "../Login/Logout.jsx";
import axios from 'axios';
import { Link } from 'react-router-dom';
import StudentNavbar from './StudentNavbar.jsx';
import './Doubt.css';

const StudentScheduleBooking = () => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const [login, setLogin] = useState(false);
    const [schedules, setSchedules] = useState([]);

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const response = await axios.post(
                    `${url}/users/student/schedules`,
                    {
                        cookies: {
                            accessToken: accessToken,
                            refreshToken: refreshToken,
                        },
                    }
                );
                setSchedules(response.data);
                setLogin(true);
            } catch (error) {
                console.error('Error fetching schedules:', error);
            }
        };

        fetchSchedules();
    }, [accessToken, refreshToken]);

    const handleBookSchedule = async (schedule) => {
        setSchedules(schedules.map((s) => {
            if (s.schedule_id === schedule.schedule_id) {
                return { ...s, is_booked: true };
            }
            return s;
        }));
        try {
            await axios.post(
                `${url}/users/student/bookSchedule`,
                {
                    cookies: {
                        accessToken: accessToken,
                        refreshToken: refreshToken,
                    },
                    schedule_id: schedule.schedule_id,
                    mentor_id: schedule.mentor_id,
                    time_slot: schedule.time_slot
                }
            );

        } catch (error) {
            console.error('Error booking schedule:', error);
        }
    };

    return (
        <div className="student-schedule-container">
            <h1>Student Dashboard</h1>
            <StudentNavbar />
            {!login && <Link to="/login" className="login-link">Login</Link>}
            {login && <LogoutButton />}
            {login && <h1>Book a Mentorship Schedule</h1>}
            <div className="schedules-list">
                {schedules.length === 0 ? (
                    <p>No available schedules</p>
                ) : (
                    schedules.map((schedule) => (
                        <div key={schedule.schedule_id} className="schedule-item">
                            <h3>Mentor: {schedule.name}</h3>
                            <p>Time Slot: {schedule.time_slot}</p>
                            <p>Email: {schedule.email}</p>
                            <p>Status: {schedule.is_booked ? "Booked" : "Available"}</p>
                            {!schedule.is_booked && (
                                <button onClick={() => handleBookSchedule(schedule)}>
                                    Book Now
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StudentScheduleBooking;
