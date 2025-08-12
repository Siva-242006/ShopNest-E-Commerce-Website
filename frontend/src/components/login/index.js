import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import {useUserDetails} from "../../context/UserContext"
import "./index.css"

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Login = () => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [errorMsg, setErrorMsg] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()
    const {refreshUser} = useUserDetails()

    useEffect( () => {
    document.title = "Login Page"
  }, [])

    useEffect(() => {
        const jwt = localStorage.getItem("jwt_token");
        if (jwt) {
          navigate("/");
        }
      }, [navigate]);

    const onSubmitClick = async (event) => {
        event.preventDefault()

        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: username, password }),
        }

        try {
            const res = await fetch(`${apiUrl}/login`, options)
            const data = await res.json()

            if (!res.ok) {
                setErrorMsg(data.msg || "Invalid credentials")
            } else {
                setErrorMsg("")
                localStorage.setItem("jwt_token", data.token)
                refreshUser()
                navigate("/")
            }
        } catch (err) {
            setErrorMsg("An unexpected error occurred. Please try again.")
        }
    }

    return (
        <div className="login-page">
            <form className="login-form" onSubmit={onSubmitClick}>
                <h2 className="login-heading">Login</h2>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        required
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        placeholder="Enter your password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-input"
                    />        
                    <label className="show-password-label">
                        <input
                        type="checkbox"
                        checked={showPassword}
                        onChange={() => setShowPassword((prev) => !prev)}
                        />{" "}
                        Show Password
                    </label>  
          </div>
                <button type="submit" className="login-button">Login</button>
                {errorMsg && <p className="error-message">{errorMsg}</p>}
            </form>
            <p>Don't have account <Link to="/signup">Sign Up</Link></p>
        </div>
    )
}

export default Login
