const express = require("express");
const router = express.Router();
const db = require("../db");

// Update totalLocker and currentCharge
router.put("/settings", async (req, res) => {
  const { totalLocker, currentCharge } = req.body;

  try {
    if (typeof totalLocker === "number") {
      const [[{ maxId } = {}]] = await db.query(
        "SELECT MAX(id) AS maxId FROM lockerSlot WHERE status = 1"
      );

      const maxLockerId = maxId || 0;

      if (totalLocker >= maxLockerId) {
        const [result] = await db.query("UPDATE totalLocker SET total = ?", [
          totalLocker,
        ]);

        if (result.affectedRows === 0) {
          return res.json({
            message: "No row found to update.",
            updated: false,
          });
        }

        if (result.changedRows === 0) {
          return res.json({
            message: "Total value is already the same. No changes made.",
            updated: false,
          });
        }

        return res.json({
          message: "Total locker updated successfully.",
          updated: true,
          affectedRows: result.affectedRows,
        });
      } else {
        return res.json({
          message: `Provided value (${totalLocker}) is less than the highest active locker ID (${maxLockerId}).`,
          updated: false,
        });
      }
    }

    if (typeof currentCharge === "number") {
      await db.query("UPDATE currentCharge SET fee = ?", [currentCharge]);
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "update_failed" });
  }
});

router.post("/insert-user", async (req, res) => {
  const { tupcID, balance } = req.body;

  if (!tupcID || balance == null) {
    return res.status(400).json({ message: "Missing tupcID or balance." });
  }

  try {
    const [existing] = await db.query("SELECT * FROM users WHERE tupcID = ?", [
      tupcID,
    ]);

    if (existing.length > 0) {
      return res.status(409).json({ message: "User already exists." });
    }

    await db.query("INSERT INTO users (tupcID, balance) VALUES (?, ?)", [
      tupcID,
      balance,
    ]);
    return res.status(201).json({ message: "User inserted successfully." });
  } catch (err) {
    console.error("Error inserting user:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
});

router.delete("/delete-user/:tupcID", async (req, res) => {
  const { tupcID } = req.params;

  try {
    const [result] = await db.query("DELETE FROM users WHERE tupcID = ?", [
      tupcID,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Failed to delete user." });
  }
});
router.put("/deactivate-locker/:id", async (req, res) => {
  const lockerId = req.params.id;

  try {
    const [result] = await db.query(
      "UPDATE lockerSlot SET tupcID = NULL, status = 0 WHERE id = ?",
      [lockerId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Locker not found or already inactive." });
    }

    res.json({ message: "Locker deactivated successfully." });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Database error while deactivating locker." });
  }
});
// PUT /api/add-credit
router.put("/add-credits", async (req, res) => {
  const { tupcID, amount } = req.body;

  if (!tupcID || isNaN(amount)) {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE tupcID = ?", [
      tupcID,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    await db.query("UPDATE users SET balance = balance + ? WHERE tupcID = ?", [
      amount,
      tupcID,
    ]);
    await db.query(
      "INSERT INTO creditLoadHistory (tupcID, addedAmount) VALUES (?, ?)",
      [tupcID, amount]
    );
    res.json({ message: "Balance updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

module.exports = router;
