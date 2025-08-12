import { useState, createContext, useEffect, useContext, useCallback } from "react";
import { jwtDecode } from "jwt-decode";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUserName] = useState("");
  
  
  const refreshUser = useCallback(() => {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.id || "");
        setName(decoded.name || "");
        setRole(decoded.role || "");
        setEmail(decoded.email || "");
        setUserName(decoded.username || "");
      } catch (err) {
        console.error("Invalid token:", err.message);
        setUserId("");
        setName("");
        setRole("");
        setEmail("");
        setUserName("");
      }
    } else {
      setUserId("");
      setName("");
      setRole("");
      setEmail("");
      setUserName("");
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <UserContext.Provider value={{ userId, name, role , username, email, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserDetails = () => useContext(UserContext);
