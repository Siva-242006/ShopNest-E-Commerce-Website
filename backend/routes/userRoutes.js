const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Users = require("../models/user");
const {protect} = require("../middlewares/protect");
const createLog = require("../utils/createLog");

const jwtSecret = process.env.JWT_SECRET;

router.post("/signup", async (req, res) => {
  try {
    const { name, email, username, password, role } = req.body;

    if ( !name || !email || !username || !password || !role) {
      return res.status(400).json({ msg: "Provide All Credentials" });
    }

    if (password.length < 6) {
      return res.status(400).json({msg: "Password length must be greater then or equal to 6"})
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: "Invalid email format" });
    }

    const existingUser = await Users.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ msg: "User Already Exists" });
    }

    const emailExisting = await Users.findOne({email})
    if (emailExisting) {
      return res.status(400).json({ msg: "Email Already Exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Users({ name, email, username, password: hashedPassword, role });
    await newUser.save();
    await createLog(req, "SIGNUP", { username, email, role });
    return res.status(201).json({ msg: "Signup Successful" });
  } catch (err) {
    console.log(err.message)
    await createLog(req, "SIGNUP_FAILED", { username, email, role, error: err.message });
    return res.status(500).json({ msg: "Server Error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(req.location)

    if (!username && !password) {
      return res.status(400).json({ msg: "Username and Password Required" });
    } else if (!username) {
      return res.status(400).json({ msg: "Username Required" });
    } else if (!password) {
      return res.status(400).json({ msg: "Password Required" });
    }

    const user = await Users.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ msg: "Username not exist. Check Username or Signup" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Password is incorrect" });
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, role: user.role, email: user.email, username: user.username },
      jwtSecret,
      { expiresIn: "24h" }
    );
    await createLog(req, "LOGIN", { username });
    return res.json({ token });
  } catch (error) {
    await createLog(req, "LOGIN_FAILED", { error: error.message });
    return res.status(500).json({ msg: "Server Error" });
  }
});

router.get("/users", protect,async (req, res) => {
  
  if (req.user.role !== "Admin") {
    return res.status(403).json({ msg: "Access Denied" }); 
  }
  
  try {
    const users = await Users.find().select("-password");
    res.send(users);
  } catch (error) {
    return res.status(500).json({ msg: "Error fetching users" });
  }
});

router.get("/users/:id", protect,async (req, res) => {

  const id = req.params.id;

  if (req.user.id !== id || req.user.role !== "Admin") {
    return res.status(403).json({ msg: "Access Denied" }); 
  }

  try {
    const user = await Users.findById(id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.send(user);
  } catch (error) {
    return res.status(500).json({ msg: "Error fetching user" });
  }
});

router.put("/users/update-password", protect, async (req, res) => {
  
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "All fields required" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Password length must be greater than or equal to 6" });
  }

  try {
    const user = await Users.findById(req.user.id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    if (oldPassword === newPassword) {
    return res.status(400).json({ message: "New password must be different from current password" });
  }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    await createLog(req, "UPDATE_PASSWORD", {userId: req.user.id, updatedPassword: newPassword})
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    await createLog(req, "UPDATE_PASSWORD_FAILED", {userId: req.user.id, error:err.message})
    res.status(500).json({ message: "Server error" });
  }
});


router.delete("/users/:id", protect ,async (req, res) => {
  
  const id = req.params.id;

  if (req.user.role !== "Admin" || req.user.id !== id) {
    return res.status(403).json({ msg: "Access Denied" }); 
  }
  
  try {

    const user = await Users.findById(id)
    if (!user) {
      return res.status(404).json({msg: "User Not Exist"})
    }

    await Users.deleteOne({ _id: id });
    res.send("User deleted!");
  } catch (err) {
    return res.status(500).json({ msg: "Error deleting user" });
  }
});

module.exports = router;
