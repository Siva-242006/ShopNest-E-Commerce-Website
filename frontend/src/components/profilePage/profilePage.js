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
    <div className="profile-container">
      <h2>My Profile</h2>

      {message && <p className="message error">{message}</p>}
      {success && <p className="message success">{success}</p>}

      {user ? (
        <div className="profile-box">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
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
    </>
  );
};

export default ProfilePage;
