import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { useUserDetails } from "../../context/UserContext";
import DeliveryAddressForm from "../deliveryAddressForm/deliveryAddressForm";
import Navbar from "../navbar/navbar";
import "./checkoutPage.css";

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [submittedAddress, setSubmittedAddress] = useState(null);
  const [isProceed, setIsProceed] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const { cartItems, clearCart } = useCart();
  const { userId } = useUserDetails();

  useEffect(() => {
    const jwt = localStorage.getItem("jwt_token");
    if (!jwt) {
      navigate("/login");
    }
  }, [navigate]);

  const handleAddressSubmit = (data) => {
    const order = {
      ...data,
      status: "Pending",
      orderDate: new Date().toLocaleString(),
    };
    setSubmittedAddress(order);
    setOrderConfirmed(true);
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleProceed = async () => {
    // Prevent duplicate executions if an order is already being placed
    if (isPlacingOrder) return;

    if (!submittedAddress || cartItems.length === 0) {
      return alert("Missing address or cart empty");
    }

    setIsPlacingOrder(true);

    const orderData = {
      userId,
      items: cartItems,
      totalAmount,
      shippingAddress: submittedAddress,
    };

    try {
      const res = await fetch(`${apiUrl}/orders/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) throw new Error("Order failed");

      await clearCart();
      setIsProceed(true);
    } catch (err) {
      console.error(err.message);
      alert("Something went wrong while placing order.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="checkout">
        {!orderConfirmed ? (
          <div className="checkout-shell">
            <div className="checkout-header">
              <h1>Checkout</h1>
              <p>Add your delivery address to review and place your order.</p>
            </div>
            <DeliveryAddressForm onAddressSubmit={handleAddressSubmit} />
          </div>
        ) : (
          <div className="confirmation">
            {isProceed ? (
              <div className="order-success-card">
                <FaCheckCircle className="success-icon" />
                <h3>Order Placed Successfully</h3>
                <p className="success-message">
                  Thank you, {submittedAddress.fullName}! Your order has been placed and is now pending confirmation.
                </p>

                <div className="success-details">
                  <div>
                    <span>Delivery Address</span>
                    <strong>
                      {submittedAddress.street}, {submittedAddress.city}, {submittedAddress.state} - {submittedAddress.pincode}, {submittedAddress.country}
                    </strong>
                  </div>
                  <div>
                    <span>Contact Number</span>
                    <strong>{submittedAddress.phone}</strong>
                  </div>
                  <div>
                    <span>Payment Method</span>
                    <strong>Cash on Delivery</strong>
                  </div>
                </div>

                <div className="success-actions">
                  <button type="button" onClick={() => navigate("/orders")}>View Orders</button>
                  <button type="button" className="secondary-success-btn" onClick={() => navigate("/products")}>
                    Continue Shopping
                  </button>
                </div>
              </div>
            ) : (
              <div className="order-review-card">
                <div className="checkout-header">
                  <h1>Review Order</h1>
                  <p>Confirm your items and delivery details before placing the order.</p>
                </div>

                <div className="order-page-cart-container">
                  {cartItems.map((item) => (
                    <div key={item.product._id} className="order-page-cart-items">
                      <div className="checkout-img-wrap">
                        <img src={item.product.image} alt={item.product.name} className="checkout-img" />
                      </div>
                      <div className="order-item-details">
                        <h3>{item.product.name}</h3>
                        <p>Quantity: {item.quantity}</p>
                        <strong>Rs. {item.product.price}</strong>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-total">
                  <span>Total Amount</span>
                  <strong>Rs. {totalAmount.toLocaleString()}</strong>
                </div>

                <div className="checkout-buttons">
                  <button type="button" className="proceed-button" onClick={handleProceed} disabled={isPlacingOrder}>
                    {isPlacingOrder ? "Placing Order..." : "Place Order"}
                  </button>
                  <button type="button" className="back-button" onClick={() => navigate("/cart")}>
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CheckoutPage;
