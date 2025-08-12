const express = require("express");
const mongoose = require("mongoose");
const Cart = require("../models/cart");
const Product = require("../models/products");
const router = express.Router();
const createLog = require("../utils/createLog")

router.get("/cart/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart) {
      return res.status(200).json({ message: "Cart is empty" });
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Error fetching cart", error: err.message });
  }
});

router.post("/cart/add", async (req, res) => {
  const { userId, productId, quantity } = req.body;
  
  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(productId)
  ) {
    return res.status(400).json({ message: "Invalid user ID or product ID" });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ user: userId });

    if (cart) {
      const index = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );
      if (index > -1) {
        return res.status(400).json({ message: "Product already in cart" });
      } else {
        cart.items.push({ product: productId, quantity });
      }
    } else {
      cart = new Cart({
        user: userId,
        items: [{ product: productId, quantity }],
      });
    }

    await cart.save();
    await createLog(req, "ADD_TO_CART", {
      userId,
      productId,
      quantity,
      cartId: cart._id,
    });
    res.status(201).json(cart);
  } catch (err) {
    await createLog(req, "ADD_TO_CART_FAILED", {
      userId,
      error: err.message,
      productId,
    })
    res.status(500).json({ message: "Error updating cart", error: err.message });
  }
});


router.put("/cart/update", async (req, res) => {
  const { userId, productId, quantity } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(productId)
  ) {
    return res.status(400).json({ message: "Invalid user ID or product ID" });
  }

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Product not in cart" });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    await createLog(req, "CART_UPDATED", {cart})
    res.status(200).json({ message: "Cart updated successfully", cart });
  } catch (err) {
    await createLog(req, "CART_UPDATED_FAILED", {cart, error: err.message})
    res.status(500).json({ message: "Error updating cart", error: err.message });
  }
});


router.delete("/cart/:userId/:productId", async (req, res) => {
  const { userId, productId } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(productId)
  ) {
    return res.status(400).json({ message: "Invalid IDs" });
  }

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    await createLog(req, "PRODUCT_REMOVED_IN_CART", {userId: userId ,productId: productId})
    res.json({ message: "Product removed", cart });
  } catch (err) {
    await createLog(req, "PRODUCT_REMOVED_IN_CART_FAILED", {userId: userId ,productId: productId, error: err.message})
    res.status(500).json({ message: "Error removing product", error: err.message });
  }
});

router.delete("/cart/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    await Cart.findOneAndDelete({ user: userId });
    await createLog(req, "CART_CLEARED", {userId})
    res.json({ message: "Cart cleared" });
  } catch (err) {
    await createLog(req, "CART_CLEARED_FAILED", {userId, error: err.message})
    res.status(500).json({ message: "Error deleting cart", error: err.message });
  }
});

module.exports = router;
