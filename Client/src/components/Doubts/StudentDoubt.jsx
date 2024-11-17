import React, { useEffect, useState } from 'react';
import LogoutButton from "../Login/Logout.jsx";
import axios from 'axios';
import { url } from '../../constants.js';
import './Doubt.css';
import StudentNavbar from './StudentNavbar.jsx';
import { Link } from 'react-router-dom';

const Doubt = () => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const [login, setLogin] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [doubts, setDoubts] = useState([
        {
            id: 1,
            title: "Log in to raise doubts",
            description: "",
            status: "open",
            response: ""
        }
    ]);

    const handleRaiseDoubt = async (e) => {
        e.preventDefault();
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");
        const newDoubt = {
            title,
            description,
            status: "open",
            response: ""
        };
        await axios.post(`${url}/users/student/raisedoubt`, {
            cookies: {
                accessToken: accessToken,
                refreshToken: refreshToken
            },
            title: title,
            description: description
        });
        setDoubts([...doubts, newDoubt]);
        setTitle('');
        setDescription('');
    };

    const handleDelete = async (id) => {
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");
        try {
            await axios.post(`${url}/users/student/deletedoubt`,
                {
                    cookies: {
                        accessToken: accessToken,
                        refreshToken: refreshToken
                    },
                    id: id,
                })
            setDoubts(doubts.filter(doubt => doubt.doubt_id !== id));
        } catch (error) {
            console.error('Error deleting the doubt:', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.post(
                    `${url}/users/student`,
                    {
                        cookies: {
                            accessToken: accessToken,
                            refreshToken: refreshToken
                        },
                    }
                );
                setDoubts(response.data);
                setLogin(true);
            } catch (error) {
                console.error('Error making API call:', error);
            }
        };

        fetchData();
    }, [accessToken, refreshToken]);

    return (
        <>
            <h1>Student Dashboard</h1>
            <StudentNavbar />
            {login && <LogoutButton />}
            <div className="doubt-container">
                {!login && <Link to="/login" className="login-link">Login</Link>}

                <h2>Raise a Doubt</h2>
                {login && <form onSubmit={handleRaiseDoubt}>
                    <input
                        type="text"
                        placeholder="Doubt Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <textarea
                        placeholder="Describe your doubt"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    ></textarea>
                    <button type="submit">Raise Doubt</button>
                </form>}
                <h2>Your Doubts</h2>
                <div className="doubts-list">
                    {doubts.map((doubt) => (
                        <div key={doubt.id} className="doubt-item">
                            <h3>{doubt.title}</h3>
                            <p>{doubt.description}</p>
                            <p>Status: {doubt.status}</p>
                            <p>Response: {doubt.response || "No response yet"}</p>
                            <button onClick={() => handleDelete(doubt.doubt_id)}>Delete</button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Doubt;

