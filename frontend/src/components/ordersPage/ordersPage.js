import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUserDetails } from "../../context/UserContext";
import Navbar from "../navbar/navbar";
import "./ordersPage.css";

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
    const url = role === "Admin" ? `${apiUrl}/admin/orders` : `${apiUrl}/orders/my-orders`;

    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancel = async (orderId) => {
    const url = role === "Admin"
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

  const filteredOrders = orders.filter((order) => {
    const address = order.shippingAddress || {};
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      (address.fullName || "").toLowerCase().includes(search) ||
      (address.city || "").toLowerCase().includes(search) ||
      (address.state || "").toLowerCase().includes(search) ||
      (address.country || "").toLowerCase().includes(search) ||
      (address.phone || "").toLowerCase().includes(search);

    const matchesStatus = selectedStatus === "All" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <Navbar />
      {loading ? (
        <div className="orders-loading">
          <p>Loading orders...</p>
        </div>
      ) : (
        <div className="orders-container">
          <div className="orders-header">
            <h2 className="page-title">{role === "Admin" ? "All Orders" : "My Orders"}</h2>
            <p>{role === "Admin" ? "Manage customer orders and update delivery status." : "Track your purchases, delivery status, and order details."}</p>
          </div>

          <div className="orders-toolbar">
            <input
              className="search-input"
              type="text"
              placeholder="Search by name, city, state, country or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="filter-bar">
              <label htmlFor="statusFilter">Status</label>
              <select
                id="statusFilter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
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
                      <img
                        src={item.product?.image || "https://via.placeholder.com/100"}
                        alt={item.product?.name || "Product is not available"}
                      />
                    </li>
                  ))}
                </ul>

                <div className="order-summary">
                  <div className="status-container">
                    <div className={`status-pill status-${order.status.toLowerCase().replace(" ", "-")}`}></div>
                    <span>{order.status}</span>
                  </div>
                  <span className="order-total-text">Total: Rs. {order.totalAmount?.toLocaleString()}</span>
                  <button className="btn view-details-btn" onClick={() => toggleDetails(order._id)}>
                    {expandedOrderId === order._id ? "Hide Details" : "View Details"}
                  </button>
                </div>

                {role === "Admin" && order.status !== "Cancelled" && order.status !== "Delivered" && (
                  <div className="admin-actions">
                    <label htmlFor={`status-select-${order._id}`}>Change Status</label>
                    <select
                      id={`status-select-${order._id}`}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    >
                      {["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"].map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                )}

                {role !== "Admin" && order.status === "Pending" && (
                  <div className="order-actions">
                    <button className="btn cancel-btn" onClick={() => handleCancel(order._id)}>
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
                      <h4>Delivery Address</h4>
                      <p>{order.shippingAddress?.fullName}, {order.shippingAddress?.phone}</p>
                      <p>
                        {order.shippingAddress?.street}, {order.shippingAddress?.city},{" "}
                        {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                      </p>

                      <h4>Items</h4>
                      <ul className="order-items">
                        {order.items?.map((item, idx) => (
                          <li key={idx} className="order-item-detail">
                            <img
                              src={item.product?.image || "https://via.placeholder.com/100"}
                              alt={item.product?.name || "Product is not available"}
                              className="product-image"
                            />
                            <div className="item-info">
                              <span>{item.product?.name || "Product is not available"}</span>
                              <span className="item-price">
                                Qty: {item.quantity} {item.product?.price ? `- Rs. ${(item.product.price * item.quantity).toLocaleString()}` : ""}
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
      )}
    </>
  );
};

export default OrdersPage;
