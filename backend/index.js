require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const lockerRoutes = require('./routes/locker');
const displayRoutes = require('./routes/display');
const adminRoutes = require('./routes/settings');

const app = express();
app.use(cors());
app.use(bodyParser.json());

//API routes
app.use('/api', lockerRoutes);
app.use('/api', displayRoutes);
app.use('/api', adminRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
