const express = require('express');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const protect = require('../middleware/authMiddleware');
const { connectDB } = require('../db');

const router = express.Router();

// GET /api/user/profile
router.get('/profile', protect, async (req, res) => {
  const db = await connectDB();
  let user;
  try {
    user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
  } catch {
    user = await db.collection('users').findOne({ id: req.user.id });
  }
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ id: user._id.toString(), name: user.name, email: user.email, createdAt: user.createdAt });
});

// PUT /api/user/update-password
router.put('/update-password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ message: 'All fields are required' });

  const db = await connectDB();
  let user;
  try {
    user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
  } catch {
    user = await db.collection('users').findOne({ id: req.user.id });
  }
  if (!user) return res.status(404).json({ message: 'User not found' });

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) return res.status(401).json({ message: 'Current password is incorrect' });

  const hashed = await bcrypt.hash(newPassword, 10);
  await db.collection('users').updateOne({ _id: user._id }, { $set: { password: hashed } });
  res.json({ message: 'Password updated successfully' });
});

// DELETE /api/user/delete-account
router.delete('/delete-account', protect, async (req, res) => {
  const db = await connectDB();
  let result;
  try {
    result = await db.collection('users').deleteOne({ _id: new ObjectId(req.user.id) });
  } catch {
    result = await db.collection('users').deleteOne({ id: req.user.id });
  }
  if (result.deletedCount === 0) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'Account deleted successfully' });
});

module.exports = router;
