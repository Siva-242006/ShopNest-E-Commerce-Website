const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: { 
    type: String, 
    enum: [
      "LOGIN",
      "SIGNUP",
      "SIGNUP_FAILED",
      "LOGIN_FAILED",
      "VIEW_PRODUCT",
      "NEW_PRODUCT_ADDED",
      "NEW_PRODUCT_ADDED_FAILED",
      "PRODUCT_UPDATED",
      "PRODUCT_UPDATED_FAILED",
      "PRODUCT_DELETED",
      "PRODUCT_DELETED_FAILED",
      "NEW_ORDER_PLACED",
      "NEW_ORDER_PLACED_FAILED",
      "ORDER_CANCELLED_FAILED",
      "ORDER_CANCELLED",
      "ORDER_STATUS_UPDATED",
      "ORDER_STATUS_UPDATED_FAILED",
      "ADD_TO_CART",
      "ADD_TO_CART_FAILED",
      "CART_UPDATED",
      "CART_UPDATED_FAILED",
      "PRODUCT_REMOVED_IN_CART",
      "PRODUCT_REMOVED_IN_CART_FAILED",
      "CART_CLEARED",
      "CART_CLEARED_FAILED",
      "UPDATE_PASSWORD",
      "UPDATE_PASSWORD_FAILED"
    ],
    required: true 
  },
  ip: { type: String, default: "unknown" },
  userAgent: { type: String, default: "unknown" },
  deviceType: { type: String, default: "unknown" },
  browser: { type: String, default: "unknown" },
  os: { type: String, default: "unknown" },
  location: {
    country: { type: String, default: "unknown" },
    city: { type: String, default: "unknown" },
  },
  metadata: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Log", logSchema);
