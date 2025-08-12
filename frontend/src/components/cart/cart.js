import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUserDetails } from "../../context/UserContext";
import { useCart } from "../../context/CartContext";
import "./cart.css";
import Navbar from "../navbar/navbar";

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

const CartPage = () => {
  const [cartList, setCartList] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();

  const { userId } = useUserDetails();
  const { setCartCount } = useCart();
  
  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/cart/${userId}`);
      const data = await res.json();
      if (res.ok && data.items) {
        setCartList(data.items);
        const initialQuantities = {};
        data.items.forEach((item) => {
          initialQuantities[item.product._id] = item.quantity || 1;
        });
        setQuantities(initialQuantities);
      } else {
        setCartList([]);
      }
    } catch (err) {
      console.error("Failed to load cart", err);
    }
  }, [userId]);

  // Set page title
  useEffect(() => {
    document.title = "Cart";
  }, []);

  // JWT auth check and fetch cart
  useEffect(() => {
    const jwt = localStorage.getItem("jwt_token");
    if (!jwt) {
      navigate("/login");
    } else {
      fetchCart();
    }
  }, [navigate, fetchCart]);

  // Set cart counter whenever cartList updates
  useEffect(() => {
    setCartCount(cartList.length);
  }, [cartList, setCartCount]);

  // Total price calculation
  useEffect(() => {
    const total = cartList.reduce((sum, item) => {
      const qty = quantities[item.product._id] || 1;
      return sum + item.product.price * qty;
    }, 0);
    setTotalPrice(total);
  }, [quantities, cartList]);

  // Update quantity in backend
  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await fetch(`${apiUrl}/cart/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId, quantity }),
      });
      if (res.ok) {
        setQuantities((prev) => ({ ...prev, [productId]: quantity }));
        fetchCart();
      }
    } catch (err) {
      console.error("Error updating quantity", err);
    }
  };

  // Delete product from cart
  const deleteProduct = async (productId) => {
    try {
      const res = await fetch(`${apiUrl}/cart/${userId}/${productId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchCart();
      }
    } catch (err) {
      console.error("Error deleting product", err);
    }
  };

  // Clear the entire cart
  const clearCart = async () => {
    try {
      const res = await fetch(`${apiUrl}/cart/${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCartList([]);
        setQuantities({});
      }
    } catch (err) {
      console.error("Error clearing cart", err);
    }
  };

  // Increment quantity
  const onIncrement = (productId, stock) => {
    const currentQty = quantities[productId] || 1;
    if (currentQty < stock) {
      updateQuantity(productId, currentQty + 1);
    }
  };

  // Decrement quantity
  const onDecrement = (productId) => {
    const currentQty = quantities[productId] || 1;
    if (currentQty > 1) {
      updateQuantity(productId, currentQty - 1);
    }
  };

  const onCheckoutClick = () => {
    alert("Proceeding to checkout...");
    navigate("/checkout");
  };

  return (
    <>
      <Navbar />
      <div className="cart-page">
        <h1>Shopping Cart</h1>
        {cartList.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <div className="cart-items">
            {cartList.map((item) => (
              <div key={item.product._id} className="cart-item">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="cart-item-image"
                />
                <div className="cart-item-details">
                  <h2>{item.product.name}</h2>
                  <p>Brand: {item.product.brand}</p>
                  <p>
                    Price: ₹{item.product.price.toLocaleString()}{" "}
                    {item.product.currency}
                  </p>

                  <div className="quantity-controls">
                    <button onClick={() => onDecrement(item.product._id)}>-</button>
                    <input
                      type="text"
                      value={quantities[item.product._id] || 1}
                      readOnly
                      className="quantity-display"
                    />
                    <button
                      onClick={() =>
                        onIncrement(item.product._id, item.product.stock)
                      }
                      disabled={
                        quantities[item.product._id] >= item.product.stock
                      }
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="delete-button"
                    onClick={() => deleteProduct(item.product._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="cart-summary">
          <h2>Cart Summary</h2>
          <p>Total Items: {cartList.length}</p>
          <p>Total Price: ₹{totalPrice.toLocaleString()}</p>
          <button onClick={clearCart} className="clear-cart-button">
            Clear Cart
          </button>
          <button
            onClick={() =>
              cartList.length > 0
                ? onCheckoutClick()
                : alert("Cart is Empty.")
            }
            className="checkout-button"
          >
            Checkout
          </button>
        </div>
      </div>
    </>
  );
};

export default CartPage;
