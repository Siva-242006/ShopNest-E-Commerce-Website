const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const orderItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending"
    },
    paymentMethod: {
      type: String,
      enum: ["COD"],
      default: "COD"
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      landmark: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: "India" }
    },
    paymentDetails: {
      transactionId: String,
      paymentStatus: {
        type: String,
        enum: ["Success", "Failed", "Pending"],
        default: "Pending"
      },
      paymentDate: Date,
      paymentGateway: String,
      amountPaid: Number
    }
  },
  { timestamps: true }
);

const Order = model("Order", orderSchema);
module.exports = Order;
