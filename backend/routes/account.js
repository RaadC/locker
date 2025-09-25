const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const db = require("../db");

router.get("/admin-account", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, email, role FROM admin ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.post("/admin-account", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "missing_fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO admin (email, password_hash, role) VALUES (?, ?, ?)",
      [email, hashedPassword, role || 0]
    );

    res.json({ message: "Admin added successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "email_already_exists" });
    }
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.put("/admin-account/:id", async (req, res) => {
  try {
    const { password } = req.body;
    const { id } = req.params;

    if (!password) {
      return res.status(400).json({ error: "missing_password" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "UPDATE admin SET password_hash = ? WHERE id = ?",
      [hashedPassword, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "admin_not_found" });
    }

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.delete("/admin-account/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query("DELETE FROM admin WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "admin_not_found" });
    }

    res.json({ message: "Admin deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.delete("/load-history", async (req, res) => {
  try {
    await db.query("DELETE FROM creditLoadHistory");
    res.json({ message: "Load history cleared" });
  } catch (err) {
    console.error("Error deleting load history:", err);
    res.status(500).json({ error: "server_error" });
  }
});

router.delete("/locker-history", async (req, res) => {
  try {
    await db.query("DELETE FROM lockerHistory");
    res.json({ message: "Locker history cleared" });
  } catch (err) {
    console.error("Error deleting locker history:", err);
    res.status(500).json({ error: "server_error" });
  }
});
module.exports = router;
