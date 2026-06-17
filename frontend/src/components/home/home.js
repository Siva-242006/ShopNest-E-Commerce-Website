import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaStar } from "react-icons/fa";
import Navbar from "../navbar/navbar";
import "./home.css";

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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
      setError("");

      try {
        const response = await fetch(`${apiUrl}/products`);
        if (!response.ok) {
          throw new Error("Unable to load products");
        }

        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load products", error);
        setError("Failed to load products. Please try again.");
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

  const availableProducts = products.filter((product) => product.stock > 0);
  const featured = availableProducts
    .filter((product) => product.avgRating >= 4.5)
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 5);
  const newArrivals = [...availableProducts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  const limitedStock = availableProducts
    .filter((product) => product.stock <= 5)
    .slice(0, 5);
  const topReviewed = [...availableProducts]
    .sort((a, b) => b.numReviews - a.numReviews)
    .slice(0, 5);
  const categories = [...new Set(availableProducts.map((product) => product.category).filter(Boolean))].slice(0, 5);

  const renderProducts = (items) =>
    items.length > 0 ? (
      items.map((item) => (
        <Link to={`/products/${item._id}`} className="home-product-link" key={item._id}>
          <div className="home-product-card">
            {item.stock <= 5 && <span className="limited-stock">Only {item.stock} left!</span>}
            <img src={item.image} alt={item.name} />
            <h4>{item.name}</h4>
            <div className="home-card-footer">
              <p className="home-product-price">Rs. {item.price}</p>
              <span className="rating">
                <FaStar aria-hidden="true" /> {(item.avgRating || 0).toFixed(1)}
              </span>
            </div>
          </div>
        </Link>
      ))
    ) : (
      <p className="home-empty-state">Products will appear here soon.</p>
    );

  return (
    <>
      <Navbar />
      {isLoading ? (
        <div className="loading-spinner">
          <span className="home-loader"></span>
          <p>Loading...</p>
        </div>
      ) : error ? (
        <div className="home-page">
          <div className="home-error-state">
            <h2>{error}</h2>
            <button type="button" onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <div className="home-page">
          <div className="hero-section">
            <FaHome className="home-icon" />
            <h1>Welcome to ShopNest</h1>
            <p>Discover trending products, new arrivals & more!</p>
            <button type="button" onClick={onClickHandler}>
              Go to Shopping
            </button>
          </div>

          <section className="home-section">
            <h2>Shop by Category</h2>
            <div className="category-grid">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <button
                    type="button"
                    className="category-card"
                    key={category}
                    onClick={() => navigate(`/products?category=${encodeURIComponent(category)}`)}
                  >
                    <span>{category}</span>
                  </button>
                ))
              ) : (
                <p className="home-empty-state">No categories available yet.</p>
              )}
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
