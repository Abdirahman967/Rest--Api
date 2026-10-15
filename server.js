// server.js
// Express server with a REST API for users, backed by MongoDB through Mongoose.

const path = require("path");

// Load environment variables from config/.env
require("dotenv").config({ path: path.join(__dirname, "config", ".env") });

const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware: parse JSON request bodies so we can read req.body
app.use(express.json());

// ---------------------------------------------------------------
// Helper: check that an id is a valid MongoDB ObjectId
// (avoids a CastError when someone sends a malformed id)
// ---------------------------------------------------------------
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ---------------------------------------------------------------
// Helper: turn Mongoose errors into clear HTTP responses
// ---------------------------------------------------------------
const handleError = (res, err) => {
  // Schema validation failed (missing name, bad email, negative age...)
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: "Validation failed", errors });
  }
  // Duplicate key (email already used)
  if (err.code === 11000) {
    return res.status(409).json({ message: "Email already exists" });
  }
  // Anything else is a server error
  console.error(err);
  return res.status(500).json({ message: "Server error", error: err.message });
};

// ===============================================================
// ROUTES
// ===============================================================

// GET /users : return all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find(); // find() with no filter returns every user
    res.status(200).json(users);
  } catch (err) {
    handleError(res, err);
  }
});

// POST /users : add a new user to the database
app.post("/users", async (req, res) => {
  try {
    const { name, email, age } = req.body;
    const newUser = new User({ name, email, age }); // build the document
    const savedUser = await newUser.save();         // save it (runs validators)
    res.status(201).json(savedUser);                // 201 = Created
  } catch (err) {
    handleError(res, err);
  }
});

// PUT /users/:id : edit a user by id
app.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: "Invalid user id" });

  try {
    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,           // return the updated document instead of the old one
      runValidators: true, // apply the schema rules to the update too
    });

    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.status(200).json(updatedUser);
  } catch (err) {
    handleError(res, err);
  }
});

// DELETE /users/:id : remove a user by id
app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: "Invalid user id" });

  try {
    const deletedUser = await User.findByIdAndDelete(id); // returns the removed document

    if (!deletedUser) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted", user: deletedUser });
  } catch (err) {
    handleError(res, err);
  }
});

// Fallback for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// ===============================================================
// CONNECT TO THE DATABASE, THEN START THE SERVER
// ===============================================================
const startServer = async () => {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing. Copy config/.env.example to config/.env and fill it in.");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Could not connect to MongoDB:", err.message);
    process.exit(1);
  }
};

// Only start when run directly (node server.js), so the app can be imported for tests
if (require.main === module) {
  startServer();
}

module.exports = app;
