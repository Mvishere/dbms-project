import "./LogoutButton.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { url } from "../../constants";

const LogoutButton = () => {
    const navigate = useNavigate();
    const accessToken = localStorage.getItem("accessToken")
    const refreshToken = localStorage.getItem("refreshToken")

    const handleLogout = async () => {
        try {
            await axios.post(`${url}/users/logout`, {
                cookies: {
                    accessToken: accessToken,
                    refreshToken: refreshToken
                }
            });
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")
            navigate("/login");
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    return (
        <button onClick={handleLogout} className="logout-button">
            Logout
        </button>
    );
};

export default LogoutButton;
