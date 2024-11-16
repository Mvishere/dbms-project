import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { url } from '../../constants';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${url}/users/login`, { email, password });
            const { accessToken, refreshToken, role } = response.data.data;

            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);

            const roleRoutes = {
                admin: "/admin",
                student: "/students/doubts",
                mentor: "/mentor/doubts",
            };

            if (role in roleRoutes) {
                navigate(roleRoutes[role]);
            } else {
                console.error(`Unhandled role: ${role}`);
                navigate("/login");
            }
        } catch (error) {
            setError(error.response.data);
            navigate("/login");
        }

    };

    return (
        <div className="login-container">
            <h1 className="app-title">Solvify</h1>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
                <h3>{error}</h3>
            </form>
            <h3>Don't have an account <Link to="/register">register</Link></h3>
        </div>
    );
};

export default Login;
