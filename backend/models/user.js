const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name must be needed"]
    },
    email: {
      type: String,
      required: [true, "Email must be needed"],
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"]
    },
    username: {
      type: String,
      required: [true, "Username must be needed"],
      unique: true
    },
    password: {
      type: String,
      required: [true, "Password must be needed"]
    },
    role: {
      type: String,
      enum: ["Admin", "User"],
      default: "User"
    }
  },
  {
    timestamps: true
  }
);

const Users = model("Users", userSchema);
module.exports = Users;
