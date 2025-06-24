import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Navbar: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; postCount: number; totalLikes: number } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Watch storage changes across tabs/windows and also internally
    const syncUser = () => {
      const storedEmail = localStorage.getItem("userEmail");
      setUserEmail(storedEmail);
    };

    // On mount
    syncUser();

    // Listen to storage change
    window.addEventListener("storage", syncUser);

    return () => window.removeEventListener("storage", syncUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setUserEmail(null);
    navigate("/");
  };

  const handleUserClick = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("No token found. Please login again.");
        return;
      }

      const response = await axios.get(`${API_URL}/api/user-info`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUserInfo(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching user info:", error);
      alert("Could not load user info.");
    }
  };


  const handleViewProfile = () => {
    navigate("/writeups");
    setShowModal(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar__logo">
          <Link to="/" className="navbar__logo">Evanescent</Link>
        </div>

        <div className="navbar__links">
          {userEmail ? (
            <>
              <span className="navbar__link" onClick={handleUserClick} style={{ cursor: "pointer" }}>
                {userEmail}
              </span>
              <button onClick={handleLogout} className="navbar__link navbar__button">Logout</button>
            </>
          ) : (
            <>
              <Link to="/signup" className="navbar__link">Sign Up</Link>
              <Link to="/login" className="navbar__link">Login</Link>
            </>
          )}
        </div>
      </nav>

      {showModal && userInfo && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>User Info</h2>
            <p><strong>Name:</strong> {userInfo.name}</p>
            <p><strong>Username:</strong> {userInfo.email}</p>
            <p><strong>Created Bottle-Message:</strong> {userInfo.postCount}</p>
            <p><strong>Total Likes:</strong> {userInfo.totalLikes}</p>
            <div className="modal-buttons">
              <button onClick={handleViewProfile} className="navbar__button">My Bottles</button>
              <button onClick={() => setShowModal(false)} className="navbar__button">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
