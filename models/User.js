// models/User.js
// Defines the User schema and exports the User model used in server.js.

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"], // a user must have a name
      trim: true,                           // remove spaces around the name
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,      // no two users can share an email
      lowercase: true,   // store emails in lowercase
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"], // simple email format check
    },
    age: {
      type: Number,
      min: [0, "Age cannot be negative"],
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// "User" becomes the "users" collection in MongoDB
module.exports = mongoose.model("User", userSchema);
