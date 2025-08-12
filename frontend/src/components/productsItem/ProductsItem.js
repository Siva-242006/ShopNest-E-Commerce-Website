import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserDetails } from "../../context/UserContext";
import { useCart } from "../../context/CartContext";
import Navbar from "../navbar/navbar";
import "./productItem.css";

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ProductItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId, role } = useUserDetails();
  const { fetchCart } = useCart()

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
  if (product.stock > 0) {
    try {
      const response = await fetch(`${apiUrl}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          productId: product._id,
          quantity: quantity,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        await fetchCart()
        alert(`${quantity} ${product.name} added to cart.`);
      } else {
        alert(data.message || "Failed to add product to cart.");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Something went wrong. Please try again.");
    }
  } 
  else {
    alert("Sorry, this product is out of stock.");
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

  if (loading || !product) return <><Navbar /><div className="loading">Loading...</div></>;

  return (
    <>
      <Navbar />
      <div className="product-item">
        <img src={product.image} alt={product.name} className="product-item-product-image" />
        <div className="product-details">
          <h2>{product.name}</h2>
          <p><strong>Brand:</strong> {product.brand}</p>
          <p><strong>Category:</strong> {product.category}</p>
          <p><strong>Description:</strong> {product.description}</p>
          <p><strong>Rating:</strong> {product.avgRating.toFixed(1)} / 5</p>
          <p><strong>Price:</strong> ₹{product.price}</p>
          <p><strong>Stock:</strong> {product.stock}</p>

          {role === "User" && <> <div className="quantity-selector">
            <label><strong>Quantity:</strong></label>
            <div className="quantity-controls">
              <button onClick={onDecrement}>-</button>
              <input value={quantity} readOnly className="quantity-display" />
              <button onClick={onIncrement} disabled={quantity >= product.stock}>+</button>
            </div>
          </div>

          <button className="add-to-cart-button" onClick={handleAddToCart}>
            Add to Cart
          </button> </>}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h3>Customer Reviews ({product.reviews.length})</h3>
        {product.reviews.map((rev) => (
          <div key={rev._id} className="review-card">
            <p><strong>{rev.name.charAt(0).toUpperCase() + rev.name.slice(1)}</strong> ({rev.rating}/5)</p>
            <p>{rev.comment}</p>
            {(rev.user_id === userId || role === "Admin") && (
              <button
                className="delete-review"
                onClick={() => handleDeleteReview(rev._id)}
              >
                Delete
              </button>
            )}
          </div>
        ))}

        {/* Review Form */}
        {role === "User" && (
          <form onSubmit={handleReviewSubmit} className="review-form">
            <h4>Leave a Review</h4>
            <label>
              Rating:
              <select value={rating} onChange={(e) => setRating(Number(e.target.value))} required>
                <option value="">Select</option>
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>{r}</option>
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
