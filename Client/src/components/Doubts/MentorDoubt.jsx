import React, { useEffect, useState } from 'react';
import LogoutButton from "../Login/Logout.jsx";
import { url } from '../../constants.js';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Doubt.css';

const MentorDoubt = () => {
    const accessToken = localStorage.getItem("accessToken")
    const refreshToken = localStorage.getItem("refreshToken")
    const [login, setLogin] = useState(false)
    const [doubts, setDoubts] = useState([
        {
            title: "Log in to raise doubts",
            description: "",
            status: "resolved",
            response: ""
        }
    ]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.post(
                    `${url}/users/mentor`,
                    {
                        cookies: {
                            accessToken: accessToken,
                            refreshToken: refreshToken
                        },
                    }
                );
                console.log(response.data);
                setDoubts(response.data)
                setLogin(true)
            } catch (error) {
                console.error('Error making API call:', error);
            }
        };

        fetchData();
    }, [accessToken, refreshToken]);

    const handleAddResponse = async (id, response) => {
        try {
            await axios.post(`${url}/users/mentor/respond`,
                {
                    cookies: {
                        accessToken: accessToken,
                        refreshToken: refreshToken
                    },
                    doubt_id: id,
                    response_text: response
                })
            setDoubts(doubts.map((doubt) => {
                if (doubt.doubt_id === id) {
                    return { ...doubt, status: "resolved", response: response };
                }
                return doubt;
            }));
        } catch (error) {
            console.log(error)
        }
    };

    return (
        <div className="mentor-doubt-container">
            {!login && <Link to="/login" className="login-link">Login</Link>}
            {login && <LogoutButton />}
            <h2>Mentor Dashboard</h2>
            <div className="mentor-doubts-list">
                {doubts.map((doubt, id) => (
                    <div key={id} className="mentor-doubt-item">
                        <h3>{doubt.title}</h3>
                        <p>{doubt.description}</p>
                        <p>Status: {doubt.status}</p>
                        <p>Response: {doubt.response || "No response yet"}</p>
                        {doubt.status === "open" && (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const response = e.target.response.value;
                                    handleAddResponse(doubt.doubt_id, response);
                                    e.target.reset();
                                }}
                            >
                                <input
                                    type="text"
                                    name="response"
                                    placeholder="Add your response"
                                    required
                                />
                                <button type="submit">Submit</button>
                            </form>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MentorDoubt;
