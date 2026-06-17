import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { FaLock, FaRegEye, FaRegEyeSlash, FaUser } from "react-icons/fa"
import {useUserDetails} from "../../context/UserContext"
import "./index.css"

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Login = () => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [errorMsg, setErrorMsg] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
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
        setErrorMsg("")
        setIsLoading(true)

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
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="login-page">
            <form className="login-form" onSubmit={onSubmitClick}>
                <div className="login-header">
                    <span className="login-badge">ShopNest</span>
                    <h2 className="login-heading">Welcome back</h2>
                    <p className="login-subtitle">Sign in to continue shopping.</p>
                </div>

                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <div className="input-wrapper">
                        <FaUser className="input-icon" aria-hidden="true" />
                        <input
                            type="text"
                            id="username"
                            required
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="form-input"
                            disabled={isLoading}
                            autoComplete="username"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <div className="input-wrapper">
                        <FaLock className="input-icon" aria-hidden="true" />
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            placeholder="Enter your password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input password-input"
                            disabled={isLoading}
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword((prev) => !prev)}
                            disabled={isLoading}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                        </button>
                    </div>
                </div>

                <button type="submit" className="login-button" disabled={isLoading}>
                    {isLoading ? (
                        <span className="button-loading">
                            <span className="spinner"></span>
                            Logging in...
                        </span>
                    ) : (
                        "Login"
                    )}
                </button>
                {errorMsg && <p className="error-message">{errorMsg}</p>}
            </form>
            <p className="signup-link">Don't have an account? <Link to="/signup">Sign Up</Link></p>
        </div>
    )
}

export default Login
