import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useUserDetails } from "../../context/UserContext";
import Navbar from "../navbar/navbar";
import "./cart.css";

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

  useEffect(() => {
    document.title = "Cart";
  }, []);

  useEffect(() => {
    const jwt = localStorage.getItem("jwt_token");
    if (!jwt) {
      navigate("/login");
    } else {
      fetchCart();
    }
  }, [navigate, fetchCart]);

  useEffect(() => {
    setCartCount(cartList.length);
  }, [cartList, setCartCount]);

  useEffect(() => {
    const total = cartList.reduce((sum, item) => {
      const qty = quantities[item.product._id] || 1;
      return sum + item.product.price * qty;
    }, 0);
    setTotalPrice(total);
  }, [quantities, cartList]);

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

  const onIncrement = (productId, stock) => {
    const currentQty = quantities[productId] || 1;
    if (currentQty < stock) {
      updateQuantity(productId, currentQty + 1);
    }
  };

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
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <p>Review your items and adjust quantities before checkout.</p>
        </div>

        <div className="cart-layout">
          <div className="cart-items-panel">
            {cartList.length === 0 ? (
              <div className="cart-empty-state">
                <h2>Your cart is empty.</h2>
                <p>Add products to your cart and they will appear here.</p>
                <button type="button" onClick={() => navigate("/products")}>
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="cart-items">
                {cartList.map((item) => (
                  <div key={item.product._id} className="cart-item">
                    <div className="cart-item-image-wrap">
                      <img src={item.product.image} alt={item.product.name} className="cart-item-image" />
                    </div>

                    <div className="cart-item-details">
                      <div>
                        <h2>{item.product.name}</h2>
                        <p className="cart-item-brand">{item.product.brand}</p>
                      </div>

                      <p className="cart-item-price">
                        Rs. {item.product.price.toLocaleString()} {item.product.currency}
                      </p>

                      <div className="cart-item-actions">
                        <div className="quantity-controls">
                          <button onClick={() => onDecrement(item.product._id)}>-</button>
                          <input
                            type="text"
                            value={quantities[item.product._id] || 1}
                            readOnly
                            className="quantity-display"
                          />
                          <button
                            onClick={() => onIncrement(item.product._id, item.product.stock)}
                            disabled={quantities[item.product._id] >= item.product.stock}
                          >
                            +
                          </button>
                        </div>

                        <button className="delete-button" onClick={() => deleteProduct(item.product._id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="cart-summary">
            <h2>Cart Summary</h2>
            <div className="summary-row">
              <span>Total Items</span>
              <strong>{cartList.length}</strong>
            </div>
            <div className="summary-row total-row">
              <span>Total Price</span>
              <strong>Rs. {totalPrice.toLocaleString()}</strong>
            </div>
            <button onClick={clearCart} className="clear-cart-button" disabled={cartList.length === 0}>
              Clear Cart
            </button>
            <button
              onClick={() => (cartList.length > 0 ? onCheckoutClick() : alert("Cart is Empty."))}
              className="checkout-button"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage;
