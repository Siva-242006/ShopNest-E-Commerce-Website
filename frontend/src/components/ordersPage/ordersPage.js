import { useEffect, useState, useCallback } from "react";
import { useUserDetails } from "../../context/UserContext";
import Navbar from "../navbar/navbar";
import "./ordersPage.css";
import { motion, AnimatePresence } from "framer-motion";

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

const OrdersPage = () => {
  const { role } = useUserDetails();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const url =
      role === "Admin"
        ? `${apiUrl}/admin/orders`
        : `${apiUrl}/orders/my-orders`;

    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : data.orders || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancel = async (orderId) => {
    const url =
      role === "Admin"
        ? `${apiUrl}/admin/orders/${orderId}/status`
        : `${apiUrl}/orders/${orderId}/cancel`;

    const body = role === "Admin" ? { status: "Cancelled" } : undefined;

    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      alert(data.message || "Order updated");
      fetchOrders();
    } catch (err) {
      console.error("Error cancelling order:", err);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${apiUrl}/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      alert(data.message || "Status updated");
      fetchOrders();
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const toggleDetails = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const handleStatusFilterChange = (e) => {
  setSelectedStatus(e.target.value);
};


  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.shippingAddress.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.phone.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = selectedStatus === "All" || order.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });


  return (
    <>
      <Navbar />
      {loading ? (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <p>Loading orders...</p>
        </div>
          ) : (
            <div className="orders-container">
        <h2 className="page-title">{role === "Admin" ? "All Orders" : "My Orders"}</h2>

        <input
          className="search-input"
          type="text"
          placeholder="Search by Name, City, State, Country or Phone"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="filter-bar">
          <label htmlFor="statusFilter">Filter by Status: </label>
          <select
            id="statusFilter"
            value={selectedStatus}
            onChange={handleStatusFilterChange}
            className="status-filter"
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>


        {filteredOrders.length === 0 ? (
          <p className="no-orders">No orders found.</p>
        ) : (
          filteredOrders.map((order) => (
            <motion.div
              key={order._id}
              className={`order-card ${expandedOrderId === order._id ? "expanded" : ""}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="order-header">
                <span className="order-id">
                  <strong>Order ID:</strong> {order._id}
                </span>
                <span className="order-date">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>

              {role === "Admin" && order.user && (
                <p className="order-user">
                  <strong>User:</strong> {order.user.name} ({order.user.email})
                </p>
              )}

              <ul className="order-item-images-container">
                {order.items?.map((item, idx) => (
                  <li key={idx}>
                      <img src={item.product.image} alt={item.product.name} />
                  </li>
                ))}
              </ul>

              <div className="order-summary">
                <div className="status-container">
                  Status:{" "}
                  <div className={`status-pill status-${order.status
                      .toLowerCase()
                      .replace(" ", "-")}`}>
                 </div>
                  <span>
                    {order.status}
                  </span>
                </div>
                <span>Total: ₹{order.totalAmount?.toLocaleString()}</span>
                <button
                  className="btn view-details-btn"
                  onClick={() => toggleDetails(order._id)}
                >
                  {expandedOrderId === order._id ? "Hide Details" : "View Details"}
                </button>
              </div>

              {(role === "Admin" && order.status !== "Cancelled" && order.status !== "Delivered" ) && (
                <div className="admin-actions">
                  <label htmlFor={`status-select-${order._id}`}>Change Status:</label>
                  <select
                    id={`status-select-${order._id}`}
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  >
                    {["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"].map(
                      (s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      )
                    )}
                  </select>
                </div>
              )}

              {role !== "Admin" && order.status === "Pending" && (
                <div className="order-actions">
                  <button
                    className="btn cancel-btn"
                    onClick={() => handleCancel(order._id)}
                  >
                    Cancel Order
                  </button>
                </div>
              )}

              <AnimatePresence>
                {expandedOrderId === order._id && (
                  <motion.div
                    className="order-details"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h4>Delivery Address:</h4>
                    <p>
                      {order.shippingAddress?.fullName}, {order.shippingAddress?.phone}
                    </p>
                    <p>
                      {order.shippingAddress?.street}, {order.shippingAddress?.city},{" "}
                      {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                    </p>

                    <h4>Items:</h4>
                    <ul className="order-items">
                      {order.items?.map((item, idx) => (
                        <li key={idx} className="order-item-detail">
                          <img
                            src={
                              item.product?.image ||
                              "https://via.placeholder.com/100"
                            }
                            alt={item.product?.name}
                            className="product-image"
                          />
                          <div className="item-info">
                            <span>{item.product?.name}</span>
                            <span className="item-price">
                              Qty: {item.quantity} · ₹
                              {(item.product?.price * item.quantity)?.toLocaleString()}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
          )
      }
    </>
  );
};

export default OrdersPage;
