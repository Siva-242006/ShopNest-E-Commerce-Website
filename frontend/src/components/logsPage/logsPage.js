import { useState, useEffect } from "react";
import { useUserDetails } from "../../context/UserContext";
import Navbar from "../navbar/navbar";
import "./logsPage.css";

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Logs = () => {
  const { role } = useUserDetails();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${apiUrl}/logs`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      console.log( "logs",data)
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError("Failed to fetch logs. You may not have permission.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllLogs = async () => {
    if (!window.confirm("Are you sure you want to delete all logs? This cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/logs`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      setLogs([]);
      alert("All logs deleted successfully!");
    } catch (err) {
      console.error("Error deleting logs:", err);
      alert("Failed to delete logs.");
    }
  };

  useEffect(() => {
    if (role === "Admin") {
      fetchLogs();
    } else {
      setLoading(false);
    }
  }, [role]);

  if (role !== "Admin") {
    return (
      <>
        <Navbar />
        <div className="logs-container">Access Denied: Only admins can view logs.</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="logs-container">
        <h2>System Logs</h2>
        {loading ? (
          <p>Loading logs...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : logs.length === 0 ? (
          <p>No logs found.</p>
        ) : (
          <>
            <button className="delete-button" onClick={handleDeleteAllLogs}>
              Delete All Logs
            </button>
            <div className="logs-table-container">
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>IP</th>
                    <th>Location</th>
                    <th>Device</th>
                    <th>Browser</th>
                    <th>OS</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id}>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                      <td>{log.action}</td>
                      <td>{log.ip}</td>
                      <td>
                        {log.location?.city}, {log.location?.country}
                      </td>
                      <td>{log.deviceType}</td>
                      <td>{log.browser}</td>
                      <td>{log.os}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Logs;
