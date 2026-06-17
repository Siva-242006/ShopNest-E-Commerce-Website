import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { useUserDetails } from "../../context/UserContext";
import Navbar from "../navbar/navbar";
import "./productItem.css";

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ProductItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId, role } = useUserDetails();
  const { fetchCart } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    document.title = "E-Commerce Website";
    const jwt = localStorage.getItem("jwt_token");
    if (!jwt) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${apiUrl}/products/${id}`);
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const onIncrement = () => {
    if (quantity < product.stock) setQuantity((prev) => prev + 1);
  };

  const onDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleAddToCart = async () => {
    if (product.stock <= 0) {
      alert("Sorry, this product is out of stock.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          productId: product._id,
          quantity,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        await fetchCart();
        alert(`${quantity} ${product.name} added to cart.`);
      } else {
        alert(data.message || "Failed to add product to cart.");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);

    try {
      const token = localStorage.getItem("jwt_token");
      await fetch(`${apiUrl}/products/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });

      setComment("");
      setRating(0);
      const res = await fetch(`${apiUrl}/products/${id}`);
      const data = await res.json();
      setProduct(data);
    } catch (err) {
      console.error("Review error", err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;

    try {
      const token = localStorage.getItem("jwt_token");
      await fetch(`${apiUrl}/products/${id}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const res = await fetch(`${apiUrl}/products/${id}`);
      const data = await res.json();
      setProduct(data);
    } catch (err) {
      console.error("Delete review error", err);
    }
  };

  if (loading || !product) {
    return (
      <>
        <Navbar />
        <div className="product-item-loading">Loading...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="product-item">
        <div className="product-item-image-wrap">
          {product.stock <= 5 && product.stock > 0 && (
            <span className="product-item-stock-badge">Only {product.stock} left</span>
          )}
          <img src={product.image} alt={product.name} className="product-item-product-image" />
        </div>

        <div className={`product-details ${role === "Admin" ? "product-details-admin" : ""}`}>
          <div>
            <div className="product-item-meta-row">
              <span>{product.brand}</span>
              <span>{product.category}</span>
            </div>
            <h2>{product.name}</h2>
            <p className="product-item-description">{product.description}</p>
          </div>

          <div className="product-item-summary">
            <div>
              <span className="summary-label">Price</span>
              <strong className="product-item-price">Rs. {product.price}</strong>
            </div>
            <div>
              <span className="summary-label">Rating</span>
              <strong className="product-item-rating">
                <FaStar aria-hidden="true" /> {(product.avgRating || 0).toFixed(1)} / 5
              </strong>
            </div>
            <div>
              <span className="summary-label">Stock</span>
              <strong>{product.stock}</strong>
            </div>
          </div>

          {role === "User" && (
            <>
              <div className="quantity-selector">
                <label>Quantity</label>
                <div className="quantity-controls">
                  <button onClick={onDecrement}>-</button>
                  <input value={quantity} readOnly className="quantity-display" />
                  <button onClick={onIncrement} disabled={quantity >= product.stock}>+</button>
                </div>
              </div>

              <button className="add-to-cart-button" onClick={handleAddToCart}>
                Add to Cart
              </button>
            </>
          )}
        </div>
      </div>

      <div className="reviews-section">
        <h3>Customer Reviews ({product.reviews.length})</h3>
        {product.reviews.length > 0 ? (
          product.reviews.map((rev) => (
            <div key={rev._id} className="review-card">
              <div className="review-header">
                <strong>{rev.name.charAt(0).toUpperCase() + rev.name.slice(1)}</strong>
                <span><FaStar aria-hidden="true" /> {rev.rating}/5</span>
              </div>
              <p>{rev.comment}</p>
              {(rev.user_id === userId || role === "Admin") && (
                <button className="delete-review" onClick={() => handleDeleteReview(rev._id)}>
                  Delete
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="reviews-empty-state">No reviews yet.</p>
        )}

        {role === "User" && (
          <form onSubmit={handleReviewSubmit} className="review-form">
            <h4>Leave a Review</h4>
            <label>
              Rating:
              <select value={rating} onChange={(e) => setRating(Number(e.target.value))} required>
                <option value="">Select</option>
                {[1, 2, 3, 4, 5].map((ratingValue) => (
                  <option key={ratingValue} value={ratingValue}>{ratingValue}</option>
                ))}
              </select>
            </label>
            <label>
              Comment:
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} required />
            </label>
            <button type="submit" disabled={reviewSubmitting}>
              {reviewSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}
      </div>
    </>
  );
};

export default ProductItem;
