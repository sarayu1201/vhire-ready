const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectDB } = require('../db');

const router = express.Router();

const signToken = (user) =>
  jwt.sign({ id: user._id.toString(), email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields are required' });

  const db = await connectDB();
  const users = db.collection('users');

  if (await users.findOne({ email }))
    return res.status(409).json({ message: 'Email already registered' });

  const hashed = await bcrypt.hash(password, 10);
  const result = await users.insertOne({ name, email, password: hashed, createdAt: new Date().toISOString() });
  const user = { _id: result.insertedId, name, email };

  res.status(201).json({ token: signToken(user), user: { id: result.insertedId.toString(), name, email } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'All fields are required' });

  const db = await connectDB();
  const user = await db.collection('users').findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });

  res.json({ token: signToken(user), user: { id: user._id.toString(), name: user.name, email } });
});

module.exports = router;
