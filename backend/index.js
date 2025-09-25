require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { router: authRoutes, authenticateAdmin } = require("./routes/auth");

const lockerRoutes = require('./routes/locker');
const displayRoutes = require('./routes/display');
const adminRoutes = require('./routes/settings');
const adminAccountRoutes = require('./routes/account')

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(bodyParser.json());

//API routes
app.use('/api', lockerRoutes);
app.use('/api', displayRoutes);
app.use('/api', adminRoutes);
app.use("/api", authRoutes);
app.use("/api", adminAccountRoutes);


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
