const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/display-total-charge", async (req, res) => {
  try {
    const [lockerRows] = await db.query(
      "SELECT total FROM totalLocker LIMIT 1"
    );
    const [chargeRows] = await db.query(
      "SELECT fee FROM currentCharge LIMIT 1"
    );

    res.json({
      totalLocker: lockerRows[0]?.total ?? null,
      currentCharge: chargeRows[0]?.fee ?? null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.get("/used-lockers", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, tupcID, dateTime FROM lockerSlot WHERE status = 1"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

module.exports = router;
