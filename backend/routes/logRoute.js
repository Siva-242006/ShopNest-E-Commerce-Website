const express = require('express');
const router = express.Router();
const Log = require('../models/logs');
const { protect } = require('../middlewares/protect');

// GET all logs
router.get("/logs", protect, async (req, res) => {

  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  try {
    const logs = await Log.find().sort({ timestamp: -1 });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve logs.", error: error.message });
  }
});

// DELETE all logs
router.delete("/logs", protect, async (req, res) => {

  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  try {
    await Log.deleteMany({});
    res.status(200).json({ message: "All logs deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete logs.", error: error.message });
  }
});

module.exports = router;