import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import Navbar from "../navbar/navbar";
import "./home.css";

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "ShopNest | Your Ultimate Shopping Destination";
  }, []);

  useEffect(() => {
          const jwt = localStorage.getItem("jwt_token");
          if (!jwt) {
            navigate("/login");
          }
  }, [navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${apiUrl}/products`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const onClickHandler = () => {
    navigate("/products");
    window.scrollTo(0, 0);
  };

  const featured = products.filter(p => p.avgRating >= 4.5).slice(0, 5).sort((a, b) => b.avgRating - a.avgRating);
  const newArrivals = [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const limitedStock = products.filter(p => p.stock <= 5).slice(0, 5);
  const topReviewed = [...products].sort((a, b) => b.numReviews - a.numReviews).slice(0, 5);
  const categories = [...new Set(products.map(p => p.category))].slice(0, 5);

  const renderProducts = (items) =>
    items.map(item => (
      item.stock <= 0 ? null : (
      <Link to={`/products/${item._id}`} className="home-product-link" key={item._id}>
      <div className="home-product-card">
        <img src={item.image} alt={item.name} />
        <h4>{item.name}</h4>
        <p>₹{item.price}</p>
        <span className="rating">{item.avgRating.toFixed(1)}</span>
        {item.stock <= 5 && <p className="limited-stock">Only {item.stock} left!</p>}
      </div>
      </Link> )
    ));

  return (
    <>
      <Navbar />
      {isLoading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <div className="home-page">
          <div className="hero-section">
            <FaHome className="home-icon" />
            <h1>Welcome to ShopNest</h1>
            <p>Discover trending products, new arrivals & more!</p>
            <button onClick={onClickHandler}>Go to Shopping</button>
          </div>

          <section className="home-section">
            <h2>Shop by Category</h2>
            <div className="category-grid">
              {categories.map(cat => (
                <div className="category-card" key={cat} onClick={() => navigate(`/products?category=${encodeURIComponent(cat)}`)}>
                  <span>{cat}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="home-section">
            <h2>Featured Products</h2>
            <div className="home-products-row">{renderProducts(featured)}</div>
          </section>

          <section className="home-section">
            <h2>New Arrivals</h2>
            <div className="home-products-row">{renderProducts(newArrivals)}</div>
          </section>

          <section className="home-section">
            <h2>Limited Stock</h2>
            <div className="home-products-row">{renderProducts(limitedStock)}</div>
          </section>

          <section className="home-section">
            <h2>Top Reviewed</h2>
            <div className="home-products-row">{renderProducts(topReviewed)}</div>
          </section>
        </div>
      )}
    </>
  );
};

export default Home;
