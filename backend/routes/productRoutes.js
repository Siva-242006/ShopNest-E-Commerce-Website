const express = require("express");
const router = express.Router();
const Product = require("../models/products");
const { protect } = require("../middlewares/protect");
const mongoose = require("mongoose");
const createLog = require("../utils/createLog");

// GET all products
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET a specific product
router.get("/products/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.status(200).json(product);
    await createLog(req, "VIEW_PRODUCT", {product_id: product._id, product_name: product.name})
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// POST Add a new product (Admin/Manager only)
router.post("/products/add", protect, async (req, res) => {
  if (req.user.role === "User") {
    return res.status(403).json({ message: "Access Denied" });
  }

  try {
    const {
      name,
      description,
      price,
      image,
      brand,
      category,
      stock,
      numReviews,
      averageRating,
      reviews,
    } = req.body;

    if (!name || !price || !description || !stock || !image || !brand || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingProduct = await Product.findOne({ name, brand });
    if (existingProduct) {
      return res.status(400).json({ error: "Product already exists" });
    }

    const newProduct = new Product({
      name,
      description,
      price,
      image,
      brand,
      category,
      stock,
      numReviews: numReviews || 0,
      averageRating: averageRating || 0,
      reviews: reviews || [],
    });

    const savedProduct = await newProduct.save();
    await createLog(req, "NEW_PRODUCT_ADDED", {product_id: savedProduct._id, product_name: savedProduct.name});
    res.status(201).json({ message: "Product Added Successfully", product: savedProduct });

  } catch (error) {
    await createLog(req, "NEW_PRODUCT_ADDED_FAILED", {error: error.message})
    res.status(500).json({ error: "Error adding product", details: error.message });
  }
});

// PUT Update product by ID (Admin/Manager only)
router.put("/products/update/:id", protect, async (req, res) => {
  const id = req.params.id;

  if (req.user.role === "User") {
    return res.status(403).json({ message: "Access Denied" });
  }

  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product Not Found" });

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    await createLog(req, "PRODUCT_UPDATED", {product_id: updatedProduct._id, product_name: updatedProduct.name, updated_fields: req.body});

    res.status(200).json({ message: "Updated Successfully", product: updatedProduct });

  } catch (error) {
    await createLog(req, "PRODUCT_UPDATED_FAILED", {error: error.message})
    res.status(500).json({ message: "Error updating product", details: error.message });
  }
});

// DELETE Product by ID (Admin/Manager only)
router.delete("/products/delete/:id", protect, async (req, res) => {
  const id = req.params.id;

  if (req.user.role === "User") {
    return res.status(403).json({ message: "Access Denied" });
  }

  try {
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) return res.status(404).json({ message: "Product not found" });
    await createLog(req, "PRODUCT_DELETED", {deletedProduct});
    res.status(200).json({ message: "Product Deleted Successfully" });
  } catch (error) {
    await createLog(req, "PRODUCT_DELETED_FAILED", {error: error.message});
    res.status(500).json({ message: "Error deleting product", details: error.message });
  }
});

// POST Add/Update Review (Users only)
router.post("/products/:id/reviews", protect, async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;

  if (req.user.role === "Admin") {
    return res.status(403).json({ message: "Access Denied" });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existingReview = product.reviews.find(
      (r) => r.user_id.toString() === req.user.id.toString()
    );

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment;
    } else {
      const newReview = {
        user_id: req.user.id,
        name: req.user.name,
        rating: Number(rating),
        comment,
      };
      product.reviews.push(newReview);
    }

    product.numReviews = product.reviews.length;
    product.avgRating =
      product.reviews.reduce((acc, item) => acc + item.rating, 0) /
      (product.reviews.length || 1);

    await product.save();

    res.status(200).json({ message: "Review added/updated successfully" });
  } catch (error) {
    console.error("Review error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE Review (Only Admin or Review Creator)
router.delete("/products/:productId/reviews/:reviewId", protect, async (req, res) => {
  try {
    const { productId, reviewId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(reviewId)
    ) {
      return res.status(400).json({ message: "Invalid product or review ID" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const reviewIndex = product.reviews.findIndex(
      (rev) => rev._id.toString() === reviewId
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ message: "Review not found" });
    }

    const isAdmin = req.user.role === "Admin";
    const isOwner = req.user.id === product.reviews[reviewIndex].user_id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Access Denied" });
    }

    product.reviews.splice(reviewIndex, 1);
    product.numReviews = product.reviews.length;
    product.avgRating =
      product.reviews.reduce((acc, item) => acc + item.rating, 0) /
      (product.reviews.length || 1);

    await product.save();

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


//dummy

router.post("/products/add-many", protect, async (req, res) => {
  if (req.user.role === "User") {
    return res.status(403).json({ message: "Access Denied" });
  }

  try {
    const products = req.body; // Should be an array

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "No products provided or wrong format" });
    }

    const validProducts = products.filter(p =>
      p.name && p.description && p.price && p.image && p.brand && p.category && p.stock
    );

    if (validProducts.length !== products.length) {
      return res.status(400).json({ error: "Some products are missing required fields" });
    }

    // Optional: prevent duplicates based on name + brand
    const duplicates = [];
    for (const p of validProducts) {
      const exists = await Product.findOne({ name: p.name, brand: p.brand });
      if (exists) {
        duplicates.push(`${p.name} (${p.brand})`);
      }
    }

    if (duplicates.length > 0) {
      return res.status(400).json({ error: `Duplicate products found: ${duplicates.join(", ")}` });
    }

    // Add default values
    const productsToInsert = validProducts.map(p => ({
      ...p,
      numReviews: p.numReviews || 0,
      averageRating: p.averageRating || 0,
      reviews: p.reviews || [],
    }));

    const insertedProducts = await Product.insertMany(productsToInsert);
    res.status(201).json({
      message: "Products added successfully",
      count: insertedProducts.length,
      products: insertedProducts,
    });
  } catch (error) {
    res.status(500).json({ error: "Error adding products", details: error.message });
  }
});


module.exports = router;
