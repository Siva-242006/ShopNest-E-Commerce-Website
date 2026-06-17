import { useState } from "react";
import "./profilePage.css";
import { useUserDetails } from "../../context/UserContext";
import Navbar from "../navbar/navbar";

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ProfilePage = () => {
  const { userId ,name, email, username, role, } = useUserDetails();

  const user = { userId, name, email, username, role };

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("jwt_token");

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setMessage("New password and confirm password do not match");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters long");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/users/update-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Password updated successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage(data.message || "Failed to update password");
      }
    } catch (error) {
      console.error(error);
      setMessage("Server error during password update");
    }
  };

  return (
    <>
    <Navbar/>
    <div className="profile-page">
      <div className="profile-container">
      <div className="profile-header">
        <h2>My Profile</h2>
        <p>View your account details and update your password securely.</p>
      </div>

      {message && <p className="message error">{message}</p>}
      {success && <p className="message success">{success}</p>}

      {user ? (
        <div className="profile-box">
          <div><span>Name</span><strong>{user.name}</strong></div>
          <div><span>Username</span><strong>{user.username}</strong></div>
          <div><span>Email</span><strong>{user.email}</strong></div>
          <div><span>Role</span><strong>{user.role}</strong></div>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}

      <form className="password-form" onSubmit={handlePasswordUpdate}>
        <h3>Update Password</h3>
        <input
          type="password"
          placeholder="Old Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Update Password</button>
      </form>
      </div>
    </div>
    </>
  );
};

export default ProfilePage;
