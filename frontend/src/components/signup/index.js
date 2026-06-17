import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FaEnvelope, FaLock, FaRegEye, FaRegEyeSlash, FaUser, FaUserTag } from "react-icons/fa"
import "./index.css"

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "User",
  })

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    document.title = "Signup Page"
  }, [])

  useEffect(() => {
    const jwt = localStorage.getItem("jwt_token")
    if (jwt) {
      navigate("/")
    }
  }, [navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsSubmitting(true)

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.")
      setIsSubmitting(false)
      return
    }

    if (!isValidEmail(formData.email)) {
      setError("Please enter a valid email address.")
      setIsSubmitting(false)
      return
    }

    const updatedFormData = {
      name: formData.name.charAt(0).toUpperCase() + formData.name.slice(1),
      email: formData.email.trim().toLowerCase(),
      username: formData.username.trim().toLowerCase(),
      password: formData.password,
      role: formData.role,
    }

    try {
      const response = await fetch(`${apiUrl}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFormData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.msg || "Signup failed")
      }

      setSuccess("Signup successful! Redirecting to login...")
      setTimeout(() => {
        navigate("/login")
      }, 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <div className="signup-header">
          <span className="signup-badge">ShopNest</span>
          <h2>Create account</h2>
          <p>Join ShopNest and start your shopping journey.</p>
        </div>

        <div className="signup-field">
          <label htmlFor="name">Name</label>
          <div className="signup-input-wrapper">
            <FaUser className="signup-input-icon" aria-hidden="true" />
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
              autoComplete="name"
              required
            />
          </div>
        </div>

        <div className="signup-field">
          <label htmlFor="email">Email</label>
          <div className="signup-input-wrapper">
            <FaEnvelope className="signup-input-icon" aria-hidden="true" />
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div className="signup-field">
          <label htmlFor="username">Username</label>
          <div className="signup-input-wrapper">
            <FaUserTag className="signup-input-icon" aria-hidden="true" />
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              disabled={isSubmitting}
              autoComplete="username"
              required
            />
          </div>
        </div>

        <div className="signup-field">
          <label htmlFor="password">Password</label>
          <div className="signup-input-wrapper">
            <FaLock className="signup-input-icon" aria-hidden="true" />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              disabled={isSubmitting}
              autoComplete="new-password"
              className="signup-password-input"
              required
            />
            <button
              type="button"
              className="signup-password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={isSubmitting}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
            </button>
          </div>
        </div>

        <div className="signup-field">
          <label htmlFor="role">Account type</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            <option value="User">User</option>
          </select>
        </div>

        <button type="submit" className="signup-submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="signup-button-loading">
              <span className="signup-spinner"></span>
              Creating account...
            </span>
          ) : (
            "Create account"
          )}
        </button>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </form>
      <p className="login-link">Already have an account? <Link to="/login">Login</Link></p>
    </div>
  )
}

export default Signup
