const express = require("express");
const router = express.Router();
const Order = require("../models/orders");
const Cart = require("../models/cart");
const Product = require("../models/products")
const { protect } = require("../middlewares/protect");
const createLog = require("../utils/createLog");
const { create } = require("../models/logs");

// Place a new order (user only)
router.post("/orders/add", protect, async (req, res) => {
  try {
    if (req.user.role !== "User") {
      return res.status(403).json({ message: "User access only" });
    }

    const { items, totalAmount, shippingAddress } = req.body;

    if (!items || !totalAmount || !shippingAddress) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in the order." });
    }

    const order = new Order({
      user: req.user.id,
      items,
      totalAmount,
      paymentMethod: "COD",
      shippingAddress
    });

    const savedOrder = await order.save();

    items.forEach(async (each) => {
      const product = await Product.findById(each.product._id);
      if (product) {
        product.stock -= each.quantity;
        product.save();
      }
    });

    await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { items: [] } }
    );

    await createLog(req, "NEW_ORDER_PLACED", { savedOrder})

    res.status(201).json({ message: "Order placed successfully", order: savedOrder });
  } catch (err) {
    
    await createLog(req, "NEW_ORDER_PLACED_FAILED", { error: err.message })
    res.status(500).json({ message: "Failed to place order", error: err.message });
  }
});

//Get all orders of the logged-in user
router.get("/orders/my-orders", protect, async (req, res) => {
  try {

    if (req.user.role !== "User") {
      return res.status(403).json({ message: "User access only" });
    }

    const orders = await Order.find({ user: req.user.id }).populate("items.product", "name price image").sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
});

//Get a single order by orderId
router.get("/orders/:orderId", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate("items.product", "name price");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (req.user.role !== "Admin" && !order.user.equals(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch order", error: err.message });
  }
});

//Cancel order by orderId
router.put("/orders/:orderId/cancel", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!order.user.equals(req.user.id)) {
      return res.status(403).json({ message: "You can only cancel your own orders." });
    }

    if (order.status !== "Pending") {
      return res.status(400).json({ message: "Only pending orders can be cancelled." });
    }

    order.status = "Cancelled";
    await order.save();

    order.items.forEach(async (item) => {
      const product = await Product.findById(item.product._id);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    });
    await createLog(req, "ORDER_CANCELLED", { order });
    res.json({ message: "Order cancelled successfully", order });
  } catch (err) {
    await createLog(req, "ORDER_CANCELLED_FAILED", { error: err.message });
    
    res.status(500).json({ message: "Failed to cancel order", error: err.message });
  }
});

//Admin: Get all orders
router.get("/admin/orders", protect, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name price image")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch all orders", error: err.message });
  }
});

//Admin: Update order status by orderId
router.put("/admin/orders/:orderId/status", protect, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const { status } = req.body;
    const validStatuses = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findById(req.params.orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    await createLog(req, "ORDER_STATUS_UPDATED", { orderId: order._id, status });

    res.json({ message: "Order status updated", order });
  } catch (err) {
    
    await createLog(req, "ORDER_STATUS_UPDATED_FAILED", { orderId: order._id, error: err.message });
    res.status(500).json({ message: "Failed to update order", error: err.message });
  }
});


//dummy
router.delete("/orders/", protect, async (req, res) => {

  try {
    const orders = await Order.deleteMany({ user: req.user.id });
    res.json({message: "Deleted"}, orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
});

router.delete("/orders/:id", protect, async (req, res) => {

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({message: "Deleted"}, orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
});


module.exports = router;
