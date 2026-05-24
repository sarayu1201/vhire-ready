require('dotenv').config();
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});
app.use('/api/auth', express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', express.json());
app.use('/api/user', require('./routes/user'));
app.use('/api/courses', express.json());
app.use('/api/courses', require('./routes/courses'));
app.use('/api/admin', express.json());
app.use('/api/admin', require('./routes/admin'));
app.use('/api/enrollment', require('./routes/enrollment'));
app.get('/', (req, res) => res.json({ message: 'Vhire API is running', version: 'v3-mongodb' }));
app.use((req, res) => res.status(404).json({ message: `Route ${req.method} ${req.url} not found` }));

// Connect to MongoDB before starting server
connectDB().then(() => {
  const server = app.listen(process.env.PORT || 5005, () =>
    console.log(`Server running on port ${server.address().port}`)
  );
}).catch((err) => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

module.exports = app;
