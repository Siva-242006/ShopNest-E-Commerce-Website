import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DeliveryAddressForm from "../deliveryAddressForm/deliveryAddressForm";
import "./checkoutPage.css";
import { FaCheckCircle } from "react-icons/fa";
import Navbar from "../navbar/navbar";
import { useCart } from "../../context/CartContext";
import { useUserDetails } from "../../context/UserContext";

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [submittedAddress, setSubmittedAddress] = useState(null);
  const [isProceed, setIsProceed] = useState(false);
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

  const handleProceed = async () => {
    if (!submittedAddress || cartItems.length === 0) {
      return alert("Missing address or cart empty");
    }

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

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
    }
  };

  return (
    <>
      <Navbar />
      <div className="checkout">
        {!orderConfirmed ? (
          <DeliveryAddressForm onAddressSubmit={handleAddressSubmit} />
        ) : (
          <div className="confirmation">
            {isProceed ? (
              <>
                <FaCheckCircle className="success-icon" />
                <h3>Order Placed Successfully</h3>
                <p>Thank you, {submittedAddress.fullName}!</p>
                <p>
                  Delivery to: {submittedAddress.street}, {submittedAddress.city},{" "}
                  {submittedAddress.state} - {submittedAddress.pincode},{" "}
                  {submittedAddress.country}
                </p>
                <p>Contact Number: {submittedAddress.phone}</p>
              </>
            ) : (
              <>
                <div className="order-page-cart-container">
                  {cartItems.map((item) => (
                    <div key={item.product._id} className="order-page-cart-items">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="checkout-img"
                      />
                      <div className="order-item-details">
                        <p>
                          <strong>Product:</strong> {item.product.name}
                        </p>
                        <p>
                          <strong>Quantity:</strong> {item.quantity}
                        </p>
                        <p>
                          <strong>Price:</strong> ₹{item.product.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="order-total">
                    <strong>Total Amount:</strong> ₹
                    {cartItems.reduce(
                      (sum, item) => sum + item.product.price * item.quantity,
                      0
                    )}
                  </div>
                <div className="checkout-buttons">
                  <button
                    type="button"
                    className="proceed-button"
                    onClick={handleProceed}
                  >
                    Proceed
                  </button>
                  <button
                    type="button"
                    className="back-button"
                    onClick={() => navigate("/cart")}
                  >
                    Back
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CheckoutPage;
