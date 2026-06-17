import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaSearch, FaStar } from "react-icons/fa";
import Navbar from "../navbar/navbar";
import { useUserDetails } from "../../context/UserContext";
import "./products.css";

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ProductsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useUserDetails();
  const searchParams = new URLSearchParams(location.search);
  const category = searchParams.get("category") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [sortOrder, setSortOrder] = useState("");

  useEffect(() => {
    document.title = "E-Commerce Website";
  }, []);

  useEffect(() => {
    const jwt = localStorage.getItem("jwt_token");
    if (!jwt) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("jwt_token");
        const res = await fetch(`${apiUrl}/products`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }

    if (sortOrder === "asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "desc") {
      filtered.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, sortOrder]);

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this product?");
    if (!confirm) return;

    try {
      const token = localStorage.getItem("jwt_token");
      const res = await fetch(`${apiUrl}/products/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete product");
      }

      setProducts((prev) => prev.filter((product) => product._id !== id));
    } catch (err) {
      alert("Delete failed");
      console.error(err);
    }
  };

  const visibleProducts = filteredProducts.filter((product) => product.stock > 0);
  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))];

  return (
    <>
      <Navbar />
      <div className="products-container">
        <div className="products-add-product-container">
          <div>
            <h1 className="products-heading">Products</h1>
            <p className="products-subtitle">Browse products, filter by category, and compare prices.</p>
          </div>

          {role === "Admin" && (
            <div className="admin-header">
              <button className="add-button" onClick={() => navigate("/admin/products/add")}>
                + Add New Product
              </button>
            </div>
          )}
        </div>

        <div className="filters-container">
          <div className="products-search-wrapper">
            <FaSearch className="products-search-icon" aria-hidden="true" />
            <input
              type="text"
              className="products-search-input"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="">Sort by</option>
            <option value="asc">Price: Low to High</option>
            <option value="desc">Price: High to Low</option>
          </select>
        </div>

        {loading ? (
          <div className="loading">
            <span className="products-loader"></span>
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <div className="product-grid">
            {visibleProducts.length > 0 ? (
              visibleProducts.map((product) => (
                <div key={product._id} className="product-card">
                  <Link to={`/products/${product._id}`} className="product-link">
                    {product.stock <= 5 && <span className="products-stock-badge">Only {product.stock} left</span>}
                    <div className="product-image-wrap">
                      <img src={product.image} alt={product.name} />
                    </div>
                    <p className="product-category">{product.category}</p>
                    <h2>{product.name}</h2>
                    <p className="product-description">{product.description}</p>
                    <div className="product-card-meta">
                      <div>
                        <span className="product-price-label">Price</span>
                        <p className="product-price">Rs. {product.price}</p>
                      </div>
                      <span className="product-rating">
                        <FaStar aria-hidden="true" /> {(product.avgRating || 0).toFixed(1)}
                      </span>
                    </div>
                  </Link>

                  {role === "Admin" && (
                    <div className="product-admin-actions">
                      <button
                        className="product-edit-btn"
                        onClick={() => navigate(`/admin/products/update/${product._id}`)}
                      >
                        Edit
                      </button>
                      <button className="product-delete-btn" onClick={() => handleDelete(product._id)}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="products-empty-state">No products match your filters.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ProductsPage;
