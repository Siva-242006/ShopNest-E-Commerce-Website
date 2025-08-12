import { Link, useNavigate } from 'react-router-dom';
import './navbar.css';
import { useCart } from '../../context/CartContext';
import { useUserDetails } from '../../context/UserContext';

const Navbar = () => {
  const navigate = useNavigate();
  const {role} = useUserDetails()
  const {cartCount} = useCart();

  const token = localStorage.getItem('jwt_token');

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    navigate('/login');
  };

  return (
    <nav>
      <Link to="/" className="brand">ShopNest</Link>
      <div className="nav-links">
        <Link to="/products" className="link">Products</Link>
        {role === "User" && <Link to="/cart" className="link">
          Cart <span className='cart-count'>{cartCount}</span>
        </Link>}
        {role === "User" && <Link to="/orders" className="link">My Orders</Link>}
        {role === "Admin" && <Link to="/orders" className="link">Orders</Link>}
        {role === "Admin" && <Link to="/logs" className="link">Logs</Link>}
        <Link to="/profile" className="link">Profile</Link>

        {token && (
          <button onClick={handleLogout} className="auth-btn">Logout</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
