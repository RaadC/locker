const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

// 🔑 Replace with your own secret key (store in .env)
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// POST: /api/admin/login
router.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required." });

  try {
    // find admin by email
    const [rows] = await db.query("SELECT * FROM admin WHERE email = ?", [
      email,
    ]);

    if (!rows.length) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const admin = rows[0];

    // check role (must be admin, role = 1)
    if (admin.role !== 1) {
      return res
        .status(403)
        .json({ message: "Access denied. Not an admin account." });
    }

    // verify password
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // generate JWT
    const token = jwt.sign(
      { id: admin.id, role: admin.role, email: admin.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, role: admin.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login." });
  }
});

// ✅ Middleware to protect admin routes
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided." });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Invalid token format." });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // must be admin role
    if (decoded.role !== 1) {
      return res.status(403).json({ message: "Access denied. Not admin." });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

module.exports = { router, authenticateAdmin };
