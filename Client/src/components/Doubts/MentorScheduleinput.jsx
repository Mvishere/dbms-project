import React, { useState } from 'react';
import axios from 'axios';
import { url } from '../../constants.js';

const MentorScheduleInput = () => {
    const [timeSlot, setTimeSlot] = useState('');
    const [message, setMessage] = useState('');
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    const handleScheduleSubmit = async (e) => {
        e.preventDefault();

        if (!timeSlot) {
            setMessage('Please select a time slot.');
            return;
        }

        try {
            await axios.post(
                `${url}/users/mentor/schedule`,
                {
                    cookies: {
                        accessToken: accessToken,
                        refreshToken: refreshToken,
                    },
                    time_slot: timeSlot,
                }
            );
            setMessage('Schedule created successfully.');
            setTimeSlot('');
        } catch (error) {
            console.error('Error creating schedule:', error);
            setMessage('Failed to create schedule. Please try again.');
        }
    };

    return (
        <div className="mentor-schedule-container">
            <h3>Create Your Schedule</h3>
            <form onSubmit={handleScheduleSubmit}>
                <input
                    type="datetime-local"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    required
                />
                <button type="submit">Create Schedule</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default MentorScheduleInput;
