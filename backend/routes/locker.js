const express = require("express");
const router = express.Router();
const db = require("../db");
const store = require("../store");

// POST: /api/text-input
router.post("/text-input", async (req, res) => {
  const { textInput } = req.body;
  if (!textInput) return res.status(400).json({ error: "no_input_provided" });

  store.lastTextInput = textInput;
  //check if registered
  try {
    const [userRows] = await db.query("SELECT * FROM users WHERE tupcID = ?", [
      textInput,
    ]);
    if (!userRows.length) {
      store.lockerToOpen = { error: "unregistered_user" };
      return res.json(store.lockerToOpen);
    }

    const user = userRows[0];
    const userId = user.id;
    const balance = parseFloat(user.balance);

    const [feeRow] = await db.query("SELECT fee FROM currentCharge LIMIT 1");
    const fee = feeRow.length ? parseFloat(feeRow[0].fee) : 5;
    //check balance format
    if (isNaN(balance)) {
      store.lockerToOpen = { error: "invalid_balance_format" };
      return res.json(store.lockerToOpen);
    }
    //check storing or retrieving
    const [existingSlot] = await db.query(
      "SELECT * FROM lockerSlot WHERE tupcID = ?",
      [textInput]
    );
    //retrieving
    if (existingSlot.length) {
      const lockerId = existingSlot[0].id;

      await db.query(
        "UPDATE lockerSlot SET tupcID = NULL, status = 0 WHERE id = ?",
        [lockerId]
      );
      await db.query(
        "INSERT INTO lockerHistory (tupcID, slotNumber, action) VALUES (?, ?, 'retrieved')",
        [textInput, lockerId]
      );

      store.lockerToOpen = { lockerToOpen: lockerId };
      return res.json(store.lockerToOpen);
    }
    //storing, check total balance
    if (balance < fee) {
      store.lockerToOpen = { error: "insufficient_balance" };
      return res.json(store.lockerToOpen);
    }
    //check available slot
    const [available] = await db.query(`
      SELECT id FROM lockerSlot
      WHERE status = 0
        AND id <= (SELECT total FROM totalLocker LIMIT 1)
      ORDER BY id ASC
      LIMIT 1
    `);

    if (!available.length) {
      store.lockerToOpen = { error: "no_available_slot" };
      return res.json(store.lockerToOpen);
    }
    //stores updated lockerSlot and balance
    const lockerId = available[0].id;
    await db.query(
      "UPDATE lockerSlot SET tupcID = ?, status = 1, dateTime = NOW() WHERE id = ?",
      [textInput, lockerId]
    );
    await db.query("UPDATE users SET balance = balance - ? WHERE id = ?", [
      fee,
      userId,
    ]);
    await db.query(
      "INSERT INTO lockerHistory (tupcID, slotNumber, action) VALUES (?, ?, 'stored')",
      [textInput, lockerId]
    );
    store.lockerToOpen = { lockerToOpen: lockerId };
    return res.json(store.lockerToOpen);
  } catch (err) {
    console.error(err);
    store.lockerToOpen = { error: "server_error" };
    res.status(500).json(store.lockerToOpen);
  }
});

// GET: /api/last-text
router.get("/last-text", (req, res) => {
  res.json({ textInput: store.lastTextInput });
});

// GET: /api/locker-number
router.get("/locker-number", (req, res) => {
  if (store.lockerToOpen !== null) {
    const response = store.lockerToOpen;
    store.lockerToOpen = null;
    res.json(response);
  } else {
    res.json({ lockerToOpen: null });
  }
});

module.exports = router;
