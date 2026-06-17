import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { useUserDetails } from "../../context/UserContext";
import "./navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const { role } = useUserDetails();
  const { cartCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const token = localStorage.getItem("jwt_token");

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    closeMenu();
    navigate("/login");
  };

  const linkClassName = ({ isActive }) => (isActive ? "link active-link" : "link");

  return (
    <nav className="site-navbar">
      <Link to="/" className="brand" onClick={closeMenu}>
        ShopNest
      </Link>

      <button
        type="button"
        className="nav-toggle"
        onClick={() => setIsMenuOpen((prev) => !prev)}
        aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isMenuOpen}
      >
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`nav-links ${isMenuOpen ? "nav-links-open" : ""}`}>
        <NavLink to="/products" className={linkClassName} onClick={closeMenu}>
          Products
        </NavLink>
        {role === "User" && (
          <NavLink to="/cart" className={linkClassName} onClick={closeMenu}>
            Cart <span className="cart-count">{cartCount}</span>
          </NavLink>
        )}
        {role === "User" && (
          <NavLink to="/orders" className={linkClassName} onClick={closeMenu}>
            My Orders
          </NavLink>
        )}
        {role === "Admin" && (
          <NavLink to="/orders" className={linkClassName} onClick={closeMenu}>
            Orders
          </NavLink>
        )}
        {role === "Admin" && (
          <NavLink to="/logs" className={linkClassName} onClick={closeMenu}>
            Logs
          </NavLink>
        )}
        <NavLink to="/profile" className={linkClassName} onClick={closeMenu}>
          Profile
        </NavLink>

        {token && (
          <button onClick={handleLogout} className="auth-btn">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
