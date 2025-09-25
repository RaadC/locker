const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// POST: /api/admin/login
router.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required." });

  try {
    // find user (admin or superadmin) by email
    const [rows] = await db.query("SELECT * FROM admin WHERE email = ?", [
      email,
    ]);

    if (!rows.length) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const account = rows[0];

    // verify password
    const isMatch = await bcrypt.compare(password, account.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // generate JWT with role (0 = superadmin, 1 = admin)
    const token = jwt.sign(
      { id: account.id, role: account.role, email: account.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, role: account.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login." });
  }
});

//Middleware: Admin (role 1) OR Superadmin (role 0)
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided." });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Invalid token format." });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // allow role 0 (superadmin) and role 1 (admin)
    if (![0, 1].includes(decoded.role)) {
      return res.status(403).json({ message: "Access denied. Not authorized." });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

//Middleware: Superadmin only
function authenticateSuperAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided." });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Invalid token format." });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 0) {
      return res.status(403).json({ message: "Access denied. Not superadmin." });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

module.exports = { router, authenticateAdmin, authenticateSuperAdmin };
