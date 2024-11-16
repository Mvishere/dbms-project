import React, { useState } from 'react';
import { url } from "../../constants.js"
import { useNavigate, Link } from 'react-router-dom';
import axios from "axios"
import './Register.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "student",
        password: "",
    });

    const navigate = useNavigate();

    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${url}/users/register`, formData);
            try {
                const response = await axios.post(`${url}/users/login`, { email: formData.email, password: formData.password })
                localStorage.setItem("accessToken", response.data.data.accessToken)
                localStorage.setItem("refreshToken", response.data.data.refreshToken)
                if (response.data.data.role === "student") {
                    navigate("/students/doubts")
                } else if (response.data.data.role === "mentor") {
                    navigate("/mentor/doubts")
                }

            } catch (error) {
                navigate("/login")
            }
        } catch (err) {
            console.error("Signup error:", err);
            setError(err.response?.data || "Something went wrong.");
        }
    };

    return (
        <div className="signup-container">
            <h1 className="app-title">Solvify</h1>
            <h2>Signup</h2>
            <form onSubmit={handleSignup}>
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                />
                <select name="role" value={formData.role} onChange={handleInputChange} required>
                    <option value="student">Student</option>
                    <option value="mentor">Mentor</option>
                </select>
                <button type="submit">Signup</button>
                <h3>{error}</h3>
                <h3>Already have an account <Link to="/login">Login</Link></h3>
            </form>
        </div>
    );
};

export default Signup;
